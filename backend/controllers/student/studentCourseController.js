const supabase = require("../../config/supabaseClient");

const getStudentCourses = async (req, res) => {
  try {
    const studentId = req.user.id;

    const { data, error } = await supabase
      .from("class_enrollments")
      .select(`
        classes (
          id,
          code,
          name,
          description,
          teacher_id,
          semester
        )
      `)
      .eq("student_id", studentId);

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    // Extract and format the embedded classes data
    const classes = data
      .map((e) => {
        const c = e.classes;
        if (!c) return null;
        return {
          id: c.id,
          code: c.code,
          name: c.name,
          description: c.description || "",
          teacherId: c.teacher_id,
          semester: c.semester || 1,
        };
      })
      .filter(Boolean);

    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getStudentCourses,
};