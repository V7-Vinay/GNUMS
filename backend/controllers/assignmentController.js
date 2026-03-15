const supabase = require("../config/supabaseClient")

// mark attendance
const markAttendance = async (req, res) => {

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
}


// get teacher attendance records
const getTeacherAttendance = async (req, res) => {

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
}

module.exports = {
  markAttendance,
  getTeacherAttendance
}