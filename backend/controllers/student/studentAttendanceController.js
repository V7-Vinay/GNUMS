const supabase = require("../../config/supabaseClient");

const getStudentAttendance = async (req, res) => {
  try {
    const studentId = req.user.id;

    const { data, error } = await supabase
      .from("attendance")
      .select(`
        id,
        date,
        status,
        classes (
          id,
          code,
          name
        )
      `)
      .eq("student_id", studentId)
      .order("date", { ascending: false });

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    const mapped = data.map((item) => ({
      id: item.id,
      date: item.date,
      status: item.status,
      course_id: item.classes?.id || null, // map classes.id to course_id
      class_id: item.classes?.id || null,
      classes: item.classes,
    }));

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getStudentAttendance,
};