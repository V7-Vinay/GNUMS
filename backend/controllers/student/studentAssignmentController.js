const supabase = require("../../config/supabaseClient")

const getStudentAssignments = async (req, res) => {

  try {

    const studentId = req.user.id

    // get enrolled courses
    const { data: enrollments, error: enrollError } = await supabase
      .from("enrollments")
      .select("course_id")
      .eq("student_id", studentId)

    if (enrollError) {
      return res.status(500).json(enrollError)
    }

    const courseIds = enrollments.map(e => e.course_id)

    // get assignments for those courses
    const { data, error } = await supabase
      .from("assignments")
      .select(`
        id,
        title,
        description,
        due_date,
        max_marks,
        courses (
          id,
          code,
          name
        )
      `)
      .in("course_id", courseIds)
      .order("due_date", { ascending: true })

    if (error) {
      return res.status(500).json(error)
    }

    res.json(data)

  } catch (err) {

    res.status(500).json({ error: err.message })

  }

}

module.exports = {
  getStudentAssignments
}