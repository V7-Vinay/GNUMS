const supabase = require("../config/supabaseClient")

const getTeacherCourses = async (req, res) => {

  const teacherId = req.user.id

  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("teacher_id", teacherId)

  if (error) return res.status(500).json(error)

  res.json(data)

}

module.exports = { getTeacherCourses }