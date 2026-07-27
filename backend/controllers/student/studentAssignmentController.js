const supabase = require("../../config/supabaseClient")

const getStudentAssignments = async (req, res) => {
  try {
    const studentId = req.user.id

    // get enrolled classes
    const { data: enrollments, error: enrollError } = await supabase
      .from("class_enrollments")
      .select("class_id")
      .eq("student_id", studentId)

    if (enrollError) {
      return res.status(500).json({ message: enrollError.message })
    }

    const classIds = enrollments.map(e => e.class_id)

    if (classIds.length === 0) {
      return res.json([])
    }

    // get assignments for those classes
    const { data, error } = await supabase
      .from("assignments")
      .select(`
        id,
        title,
        description,
        due_date,
        max_marks,
        classes (
          id,
          code,
          name
        )
      `)
      .in("class_id", classIds)
      .order("due_date", { ascending: true })

    if (error) {
      return res.status(500).json({ message: error.message })
    }

    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = {
  getStudentAssignments
}