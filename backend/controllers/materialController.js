const supabase = require("../config/supabaseClient");

// upload study material
const uploadMaterial = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { courseId, title, description, fileType } = req.body;
    const file = req.file;

    if (!courseId || !title || !file) {
      return res.status(400).json({ message: "courseId, title, and file are required." });
    }

    const filePath = `materials/${Date.now()}_${file.originalname}`;

    // Upload to Supabase Storage Bucket
    const { error: uploadError } = await supabase.storage
      .from("study-materials")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
      });

    if (uploadError) {
      return res.status(500).json({ message: uploadError.message });
    }

    const { data } = supabase.storage
      .from("study-materials")
      .getPublicUrl(filePath);

    // Insert DB Record
    const { error } = await supabase
      .from("study_materials")
      .insert([
        {
          title,
          description,
          class_id: courseId, // map courseId to class_id
          teacher_id: teacherId,
          file_url: data.publicUrl,
          file_type: fileType || file.originalname.split(".").pop(),
          upload_date: new Date().toISOString(),
        },
      ]);

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    res.json({
      message: "Material uploaded successfully",
      url: data.publicUrl,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get teacher materials
const getTeacherMaterials = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const { data, error } = await supabase
      .from("study_materials")
      .select("*")
      .eq("teacher_id", teacherId);

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    // Map to frontend compatibility format
    const mapped = data.map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      courseId: m.class_id,
      teacherId: m.teacher_id,
      fileUrl: m.file_url,
      fileType: m.file_type,
      uploadDate: m.upload_date,
    }));

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  uploadMaterial,
  getTeacherMaterials,
};