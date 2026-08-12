const supabase = require("../../config/supabaseClient");

const getStudentAssignments = async (req, res) => {
  try {
    const studentId = req.user.id;

    // 1. Get enrolled class IDs
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

    // 2. Fetch assignments for those classes along with submissions
    const { data, error } = await supabase
      .from("assignments")
      .select(`
        id,
        title,
        description,
        due_date,
        max_marks,
        class_id,
        classes (
          id,
          code,
          name
        ),
        assignment_submissions (
          id,
          submitted_at,
          marks_obtained,
          feedback,
          file_url,
          student_id
        )
      `)
      .in("class_id", classIds)
      .order("due_date", { ascending: true });

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    // 3. Map assignment list and embed the user's specific submission
    const mapped = data.map((a) => {
      const studentSubs = a.assignment_submissions
        ? a.assignment_submissions
            .filter((sub) => sub.student_id === studentId)
            .map((sub) => ({
              id: sub.id,
              assignmentId: a.id,
              studentId: sub.student_id,
              submittedDate: sub.submitted_at,
              marks: sub.marks_obtained,
              feedback: sub.feedback,
              fileUrl: sub.file_url,
            }))
        : [];

      return {
        id: a.id,
        course_id: a.class_id, // maps class_id to course_id for frontend
        title: a.title,
        description: a.description,
        due_date: a.due_date,
        max_marks: a.max_marks,
        classes: a.classes,
        submissions: studentSubs,
      };
    });

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getStudentAssignments,
};