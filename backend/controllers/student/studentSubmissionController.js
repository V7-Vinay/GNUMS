const supabase = require("../../config/supabaseClient")

const submitAssignment = async (req, res) => {

  try {

    const studentId = req.user.id
    const { assignmentId } = req.body
    const file = req.file

    if (!file) {
      return res.status(400).json({ message: "File is required" })
    }

    const filePath = `submissions/${Date.now()}_${file.originalname}`

    // upload file to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from("assignment-submissions")
      .upload(filePath, file.buffer)

    if (uploadError) {
      return res.status(500).json(uploadError)
    }

    const { data } = supabase.storage
      .from("assignment-submissions")
      .getPublicUrl(filePath)

    // insert submission record
    const { error } = await supabase
      .from("assignment_submissions")
      .insert([
        {
          assignment_id: assignmentId,
          student_id: studentId,
          file_url: data.publicUrl
        }
      ])

    if (error) {

      if (error.code === "23505") {
        return res.status(400).json({
          message: "You have already submitted this assignment"
        })
      }

      return res.status(500).json(error)
    }

    res.json({
      message: "Assignment submitted successfully",
      url: data.publicUrl
    })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }

}

module.exports = {
  submitAssignment
}