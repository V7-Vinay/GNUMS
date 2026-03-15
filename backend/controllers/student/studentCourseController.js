const supabase = require("../../config/supabaseClient")

const getStudentCourses = async (req, res) => {
  try {

    const studentId = req.user.id

    const { data, error } = await supabase
      .from("enrollments")
      .select(`
        courses (
          id,
          code,
          name,
          teacher_id
        )
      `)
      .eq("student_id", studentId)

    if (error) {
      return res.status(500).json(error)
    }

    const courses = data.map(e => e.courses)

    res.json(courses)

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = {
  getStudentCourses
}