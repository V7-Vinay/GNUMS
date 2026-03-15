  const supabase = require("../config/supabaseClient")

// upload study material
const uploadMaterial = async (req, res) => {

  try {

    const teacherId = req.user.id
    const { courseId, title, description, fileType } = req.body
    const file = req.file

    const filePath = `materials/${Date.now()}_${file.originalname}`

    const { error: uploadError } = await supabase.storage
      .from("study-materials")
      .upload(filePath, file.buffer)

    if (uploadError) {
      return res.status(500).json(uploadError)
    }

    const { data } = supabase.storage
      .from("study-materials")
      .getPublicUrl(filePath)

    const { error } = await supabase
      .from("study_materials")
      .insert([
        {
          title,
          description,
          course_id: courseId,
          teacher_id: teacherId,
          file_url: data.publicUrl,
          file_type: fileType,
          upload_date: new Date()
        }
      ])

    if (error) {
      return res.status(500).json(error)
    }

    res.json({
      message: "Material uploaded successfully",
      url: data.publicUrl
    })

  } catch (err) {

    res.status(500).json({ error: err.message })

  }

}


// get teacher materials
const getTeacherMaterials = async (req, res) => {

  try {

    const teacherId = req.user.id

    const { data, error } = await supabase
      .from("study_materials")
      .select("*")
      .eq("teacher_id", teacherId)

    if (error) {
      return res.status(500).json(error)
    }

    res.json(data)

  } catch (err) {

    res.status(500).json({ error: err.message })

  }

}

module.exports = {
  uploadMaterial,
  getTeacherMaterials
}