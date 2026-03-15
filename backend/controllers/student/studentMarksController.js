const supabase = require("../../config/supabaseClient")

const getStudentMarks = async (req, res) => {

  try {

    const studentId = req.user.id

    const { data, error } = await supabase
      .from("marks")
      .select(`
        id,
        exam_type,
        marks,
        total_marks,
        date,
        courses (
          id,
          code,
          name
        )
      `)
      .eq("student_id", studentId)
      .order("date", { ascending: false })

    if (error) {
      return res.status(500).json(error)
    }

    res.json(data)

  } catch (err) {

    res.status(500).json({ error: err.message })

  }

}

module.exports = {
  getStudentMarks
}