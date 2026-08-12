const supabase = require("../../config/supabaseClient");

const getStudentMaterials = async (req, res) => {
  try {
    const studentId = req.user.id;

    // 1. Get enrolled classes
    const { data: enrollments, error: enrollError } = await supabase
      .from("class_enrollments")
      .select("class_id")
      .eq("student_id", studentId);

    if (enrollError) {
      return res.status(500).json({ message: enrollError.message });
    }

    const classIds = enrollments.map((e) => e.class_id);

    if (classIds.length === 0) {
      return res.json([]);
    }

    // 2. Get study materials for those classes
    const { data, error } = await supabase
      .from("study_materials")
      .select("*")
      .in("class_id", classIds)
      .order("upload_date", { ascending: false });

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    // 3. Map for frontend compatibility
    const mapped = data.map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      course_id: m.class_id,
      class_id: m.class_id,
      file_url: m.file_url,
      fileUrl: m.file_url,
      file_type: m.file_type,
      fileType: m.file_type,
      upload_date: m.upload_date,
      uploadDate: m.upload_date,
    }));

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getStudentMaterials,
};
