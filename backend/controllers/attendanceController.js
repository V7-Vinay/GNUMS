const supabase = require("../config/supabaseClient")

// Mark/Upsert attendance (idempotent design)
const markAttendance = async (req, res) => {
  try {
    const { classId, date, records } = req.body
    const teacherId = req.user.id

    if (!classId || !date || !records || !Array.isArray(records)) {
      return res.status(400).json({ message: "classId, date, and records array are required." })
    }

    // 1. Verify that the class belongs to this teacher
    const { data: classData, error: classError } = await supabase
      .from("classes")
      .select("teacher_id")
      .eq("id", classId)
      .single()

    if (classError || !classData) {
      return res.status(404).json({ message: "Class not found." })
    }

    if (classData.teacher_id !== teacherId && req.user.role !== "admin") {
      return res.status(403).json({ message: "You are not authorized to mark attendance for this class." })
    }

    // 2. Map and Upsert attendance records
    const attendanceData = records.map(record => ({
      class_id: classId,
      student_id: record.studentId,
      date: date,
      status: record.status,
      marked_by: teacherId
    }))

    const { data, error } = await supabase
      .from("attendance")
      .upsert(attendanceData, { onConflict: "class_id,student_id,date" })
      .select()

    if (error) {
      return res.status(500).json({ message: error.message })
    }

    res.json({ message: "Attendance marked successfully.", data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// Get attendance records for classes taught by this teacher
const getTeacherAttendance = async (req, res) => {
  try {
    const teacherId = req.user.id

    const { data, error } = await supabase
      .from("attendance")
      .select(`
        *,
        classes!inner(name, code, teacher_id),
        student:users!attendance_student_id_fkey(first_name, last_name, email)
      `)
      .eq("classes.teacher_id", teacherId)

    if (error) {
      return res.status(500).json({ message: error.message })
    }

    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = {
  markAttendance,
  getTeacherAttendance
}