const supabase = require("../config/supabaseClient")

// Mark attendance
const markAttendance = async (req, res) => {
  try {

    const { studentId, courseId, status } = req.body

    const { data, error } = await supabase
      .from("attendance")
      .insert([
        {
          student_id: studentId,
          course_id: courseId,
          date: new Date(),
          status
        }
      ])
      .select()

    if (error) {
      return res.status(500).json(error)
    }

    res.json(data)

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}


// Get attendance records for teacher courses
const getTeacherAttendance = async (req, res) => {
  try {

    const teacherId = req.user.id

    const { data, error } = await supabase
      .from("attendance")
      .select(`
        *,
        courses!inner(teacher_id)
      `)
      .eq("courses.teacher_id", teacherId)

    if (error) {
      return res.status(500).json(error)
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