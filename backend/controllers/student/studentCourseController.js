const supabase = require("../../config/supabaseClient")

const getStudentCourses = async (req, res) => {
  try {
    const studentId = req.user.id

    const { data, error } = await supabase
      .from("class_enrollments")
      .select(`
        classes (
          id,
          code,
          name,
          teacher_id
        )
      `)
      .eq("student_id", studentId)

    if (error) {
      return res.status(500).json({ message: error.message })
    }

    // Extract the embedded classes data
    const classes = data.map(e => e.classes).filter(Boolean)

    res.json(classes)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = {
  getStudentCourses
}