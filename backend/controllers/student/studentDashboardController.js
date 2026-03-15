const supabase = require("../../config/supabaseClient")

const getStudentDashboard = async (req, res) => {

  try {

    const studentId = req.user.id

    // courses count
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("course_id")
      .eq("student_id", studentId)

    const totalCourses = enrollments.length

    // attendance
    const { data: attendance } = await supabase
      .from("attendance")
      .select("status")
      .eq("student_id", studentId)

    const present = attendance.filter(a => a.status === "present").length
    const attendancePercent =
      attendance.length > 0
        ? Math.round((present / attendance.length) * 100)
        : 0

    // marks average
    const { data: marks } = await supabase
      .from("marks")
      .select("marks,total_marks")
      .eq("student_id", studentId)

    const avgMarks =
      marks.length > 0
        ? Math.round(
            marks.reduce(
              (sum, m) => sum + (m.marks / m.total_marks) * 100,
              0
            ) / marks.length
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