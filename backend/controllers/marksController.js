const supabase = require("../config/supabaseClient");

// Add marks
const addMarks = async (req, res) => {
  try {
    const { studentId, courseId, examType, marks, totalMarks } = req.body;

    if (!studentId || !courseId || !examType || marks === undefined || !totalMarks) {
      return res.status(400).json({ message: "studentId, courseId, examType, marks, and totalMarks are required." });
    }

    const { data, error } = await supabase
      .from("marks")
      .insert([
        {
          student_id: studentId,
          class_id: courseId, // maps frontend courseId/classId to db class_id
          exam_type: examType,
          marks: Number(marks),
          total_marks: Number(totalMarks),
          date: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    // Map back for frontend format compatibility
    const mapped = data.map((m) => ({
      id: m.id,
      studentId: m.student_id,
      courseId: m.class_id,
      examType: m.exam_type,
      marks: m.marks,
      totalMarks: m.total_marks,
      date: m.date,
    }));

    res.json(mapped[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get marks for teacher courses
const getTeacherMarks = async (req, res) => {
  try {
    const teacherId = req.user.id;

    // Get teacher classes
    const { data: classes, error: classError } = await supabase
      .from("classes")
      .select("id")
      .eq("teacher_id", teacherId);

    if (classError) {
      return res.status(500).json({ message: classError.message });
    }

    const classIds = classes.map((c) => c.id);

    if (classIds.length === 0) {
      return res.json([]);
    }

    // Get marks for those classes
    const { data, error } = await supabase
      .from("marks")
      .select("*")
      .in("class_id", classIds);

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    // Map to frontend expected names: studentId, courseId, examType, totalMarks
    const mapped = data.map((m) => ({
      id: m.id,
      studentId: m.student_id,
      courseId: m.class_id,
      examType: m.exam_type,
      marks: m.marks,
      totalMarks: m.total_marks,
      date: m.date,
    }));

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  addMarks,
  getTeacherMarks,
};