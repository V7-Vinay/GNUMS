const supabase = require("../config/supabaseClient")

const getTeacherCourses = async (req, res) => {
  try {
    const teacherId = req.user.id
    const { data, error } = await supabase
      .from("classes")
      .select("*")
      .eq("teacher_id", teacherId)

    if (error) {
      return res.status(500).json({ message: error.message })
    }

    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = { getTeacherCourses }