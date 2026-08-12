const supabase = require("../../config/supabaseClient");

const getStudentMarks = async (req, res) => {
  try {
    const studentId = req.user.id;

    // 1. Fetch assignment submissions (assignment grades)
    const { data: subData, error: subError } = await supabase
      .from("assignment_submissions")
      .select(`
        id,
        submitted_at,
        marks_obtained,
        feedback,
        assignments (
          id,
          title,
          max_marks,
          classes (
            id,
            code,
            name
          )
        )
      `)
      .eq("student_id", studentId)
      .not("marks_obtained", "is", null)
      .order("submitted_at", { ascending: false });

    if (subError) {
      return res.status(500).json({ message: subError.message });
    }

    const assignmentMarks = subData.map((sub) => ({
      id: sub.id,
      exam_type: "Assignment: " + sub.assignments.title,
      marks: Number(sub.marks_obtained),
      total_marks: Number(sub.assignments.max_marks),
      date: sub.submitted_at,
      course_id: sub.assignments.classes?.id || null,
      class_id: sub.assignments.classes?.id || null,
      courses: sub.assignments.classes,
    }));

    // 2. Fetch exam marks (from the newly created marks table)
    const { data: examData, error: examError } = await supabase
      .from("marks")
      .select(`
        id,
        exam_type,
        marks,
        total_marks,
        date,
        classes (
          id,
          code,
          name
        )
      `)
      .eq("student_id", studentId)
      .order("date", { ascending: false });

    if (examError) {
      // If marks table doesn't exist yet, we will fallback to empty array for exams
      console.warn("Could not fetch exam marks:", examError.message);
    }

    const examMarks = (examData || []).map((exam) => ({
      id: exam.id,
      exam_type: exam.exam_type,
      marks: Number(exam.marks),
      total_marks: Number(exam.total_marks),
      date: exam.date,
      course_id: exam.classes?.id || null,
      class_id: exam.classes?.id || null,
      courses: exam.classes,
    }));

    // Combine both assignment submissions and general exams
    const combinedMarks = [...examMarks, ...assignmentMarks];

    res.json(combinedMarks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getStudentMarks,
};