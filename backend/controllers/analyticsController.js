const supabase = require("../config/supabaseClient")

const getTeacherAnalytics = async (req, res) => {

  try {

    const teacherId = req.user.id

    // get teacher courses
    const { data: courses } = await supabase
      .from("courses")
      .select("id, code, name")
      .eq("teacher_id", teacherId)

    const courseIds = courses.map(c => c.id)

    // attendance
    const { data: attendance } = await supabase
      .from("attendance")
      .select("*")
      .in("course_id", courseIds)

    // marks
    const { data: marks } = await supabase
      .from("marks")
      .select("*")
      .in("course_id", courseIds)

    // calculate attendance %
    const attendanceStats = courses.map(course => {

      const records = attendance.filter(a => a.course_id === course.id)

      const present = records.filter(r => r.status === "present").length
      const total = records.length

      return {
        course: course.code,
        attendance: total ? Math.round((present / total) * 100) : 0
      }

    })

    // performance
    const performanceStats = courses.map(course => {

      const courseMarks = marks.filter(m => m.course_id === course.id)

      const avg = courseMarks.length
        ? courseMarks.reduce((sum, m) => sum + (m.marks / m.total_marks) * 100, 0) / courseMarks.length
        : 0

      return {
        course: course.code,
        average: Math.round(avg)
      }

    })

    res.json({
      attendance: attendanceStats,
      performance: performanceStats
    })

  } catch (err) {

    res.status(500).json({ error: err.message })

  }

}

module.exports = { getTeacherAnalytics }