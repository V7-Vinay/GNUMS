const supabase = require("../../config/supabaseClient")

const submitAssignment = async (req, res) => {
  try {
    const studentId = req.user.id
    const { assignmentId, submissionText } = req.body
    const file = req.file

    if (!assignmentId) {
      return res.status(400).json({ message: "assignmentId is required." })
    }

    // 1. Fetch assignment and check class enrollment
    const { data: assignment, error: assignError } = await supabase
      .from("assignments")
      .select(`
        *,
        classes!inner(id)
      `)
      .eq("id", assignmentId)
      .single()

    if (assignError || !assignment) {
      return res.status(404).json({ message: "Assignment not found." })
    }

    const classId = assignment.classes.id

    // Check enrollment
    const { data: enrollment, error: enrollError } = await supabase
      .from("class_enrollments")
      .select("*")
      .eq("class_id", classId)
      .eq("student_id", studentId)
      .single()

    if (enrollError || !enrollment) {
      return res.status(403).json({ message: "You are not enrolled in the class for this assignment." })
    }

    // 2. Check if deadline has passed
    const now = new Date()
    const dueDate = new Date(assignment.due_date)
    if (now > dueDate) {
      return res.status(400).json({ message: "Cannot submit. The assignment deadline has passed." })
    }

    let fileUrl = null
    if (file) {
      const filePath = `submissions/${Date.now()}_${file.originalname}`
      const { error: uploadError } = await supabase.storage
        .from("assignment-submissions")
        .upload(filePath, file.buffer)

      if (uploadError) {
        return res.status(500).json({ message: "File upload failed: " + uploadError.message })
      }

      const { data: urlData } = supabase.storage
        .from("assignment-submissions")
        .getPublicUrl(filePath)

      fileUrl = urlData.publicUrl
    }

    if (!fileUrl && !submissionText) {
      return res.status(400).json({ message: "Either a file or submission text must be provided." })
    }

    // 3. Save submission
    const { data, error } = await supabase
      .from("assignment_submissions")
      .insert([
        {
          assignment_id: assignmentId,
          student_id: studentId,
          submission_text: submissionText || null,
          file_url: fileUrl
        }
      ])
      .select()

    if (error) {
      if (error.code === "23505") { // unique constraint violation
        return res.status(400).json({ message: "You have already submitted this assignment." })
      }
      return res.status(500).json({ message: error.message })
    }

    res.json({
      message: "Assignment submitted successfully.",
      data: data[0]
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = {
  submitAssignment
}