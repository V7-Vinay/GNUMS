const supabase = require("../../config/supabaseClient")

const getStudentMarks = async (req, res) => {
  try {
    const studentId = req.user.id

    const { data, error } = await supabase
      .from("assignment_submissions")
      .select(`
        id,
        submitted_at,
        marks_obtained,
        feedback,
        assignments (
          id,
          title,
          max_marks,
          classes (
            id,
            code,
            name
          )
        )
      `)
      .eq("student_id", studentId)
      .not("marks_obtained", "is", null)
      .order("submitted_at", { ascending: false })

    if (error) {
      return res.status(500).json({ message: error.message })
    }

    // Map to marks structure for frontend compatibility
    const marksData = data.map(sub => ({
      id: sub.id,
      exam_type: "Assignment: " + sub.assignments.title,
      marks: sub.marks_obtained,
      total_marks: sub.assignments.max_marks,
      date: sub.submitted_at,
      courses: sub.assignments.classes
    }))

    res.json(marksData)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = {
  getStudentMarks
}