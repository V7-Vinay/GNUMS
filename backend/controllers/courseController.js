const supabase = require("../config/supabaseClient");

const getTeacherCourses = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { data, error } = await supabase
      .from("classes")
      .select(`
        *,
        class_enrollments (
          student_id
        )
      `)
      .eq("teacher_id", teacherId);

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    const mapped = data.map((c) => ({
      id: c.id,
      code: c.code,
      name: c.name,
      description: c.description || "",
      teacherId: c.teacher_id,
      studentIds: c.class_enrollments ? c.class_enrollments.map((ce) => ce.student_id) : [],
    }));

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get students enrolled in a specific class/course
const getClassStudents = async (req, res) => {
  try {
    const { classId } = req.params;
    const teacherId = req.user.id;

    // Verify class ownership
    const { data: classData, error: classError } = await supabase
      .from("classes")
      .select("teacher_id")
      .eq("id", classId)
      .single();

    if (classError || !classData) {
      return res.status(404).json({ message: "Class not found." });
    }

    if (classData.teacher_id !== teacherId && req.user.role !== "admin") {
      return res.status(403).json({ message: "You are not authorized to view students for this class." });
    }

    // Query enrollments
    const { data: enrollments, error: enrollError } = await supabase
      .from("class_enrollments")
      .select(`
        student:users!class_enrollments_student_id_fkey (
          id,
          first_name,
          last_name,
          email,
          student_profiles (
            roll_number
          )
        )
      `)
      .eq("class_id", classId);

    if (enrollError) {
      return res.status(500).json({ message: enrollError.message });
    }

    const students = enrollments
      .map((e) => {
        const s = e.student;
        if (!s) return null;
        return {
          id: s.id,
          name: `${s.first_name} ${s.last_name}`,
          email: s.email,
          rollNumber: s.student_profiles?.roll_number || null,
        };
      })
      .filter(Boolean);

    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getTeacherCourses,
  getClassStudents,
};