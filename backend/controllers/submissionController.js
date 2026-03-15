const supabase = require("../config/supabaseClient")

const getAssignmentSubmissions = async (req, res) => {

  try {

    const { assignmentId } = req.params

    const { data, error } = await supabase
      .from("assignment_submissions")
      .select(`
        id,
        file_url,
        submitted_at,
        marks,
        feedback,
        users (
          id,
          name,
          email
        )
      `)
      .eq("assignment_id", assignmentId)
      .order("submitted_at", { ascending: false })

    if (error) {
      return res.status(500).json(error)
    }

    res.json(data)

  } catch (err) {
    res.status(500).json({ error: err.message })
  }

}

module.exports = {
  getAssignmentSubmissions
}

const gradeSubmission = async (req, res) => {

  try {

    const { submissionId } = req.params
    const { marks, feedback } = req.body

    const { data, error } = await supabase
      .from("assignment_submissions")
      .update({
        marks,
        feedback
      })
      .eq("id", submissionId)
      .select()

    if (error) {
      return res.status(500).json(error)
    }

    res.json({
      message: "Submission graded successfully",
      data
    })

  } catch (err) {

    res.status(500).json({ error: err.message })

  }

}

module.exports = {
  getAssignmentSubmissions,
  gradeSubmission
}