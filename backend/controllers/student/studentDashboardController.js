const supabase = require("../../config/supabaseClient")

const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user.id

    // 1. Get total classes count
    const { data: enrollments, error: enrollError } = await supabase
      .from("class_enrollments")
      .select("class_id")
      .eq("student_id", studentId)

    const totalCourses = enrollments ? enrollments.length : 0

    // 2. Attendance percentage calculation
    const { data: attendance } = await supabase
      .from("attendance")
      .select("status")
      .eq("student_id", studentId)

    const totalAttendance = attendance ? attendance.length : 0
    const present = attendance ? attendance.filter(a => a.status === "present").length : 0
    const attendancePercent = totalAttendance > 0
      ? Math.round((present / totalAttendance) * 100)
      : 0

    // 3. Average assignment marks percentage
    const { data: submissions } = await supabase
      .from("assignment_submissions")
      .select(`
        marks_obtained,
        assignments!inner(max_marks)
      `)
      .eq("student_id", studentId)
      .not("marks_obtained", "is", null)

    const gradedCount = submissions ? submissions.length : 0
    const avgMarks = gradedCount > 0
      ? Math.round(
          submissions.reduce(
            (sum, s) => sum + (Number(s.marks_obtained) / Number(s.assignments.max_marks)) * 100,
            0
          ) / gradedCount
        )
      : 0

    res.json({
      totalCourses,
      attendancePercent,
      avgMarks
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = { getStudentDashboard }