const supabase = require("../config/supabaseClient");

// Get assignment submissions for a specific assignment (Teacher only)
const getAssignmentSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const teacherId = req.user.id;

    // Verify assignment exists and teacher owns the class
    const { data: assignment, error: assignError } = await supabase
      .from("assignments")
      .select(`
        *,
        classes!inner(teacher_id)
      `)
      .eq("id", assignmentId)
      .single();

    if (assignError || !assignment) {
      return res.status(404).json({ message: "Assignment not found." });
    }

    if (assignment.classes.teacher_id !== teacherId && req.user.role !== "admin") {
      return res.status(403).json({ message: "You are not authorized to view submissions for this assignment." });
    }

    const { data, error } = await supabase
      .from("assignment_submissions")
      .select(`
        id,
        file_url,
        submission_text,
        submitted_at,
        marks_obtained,
        feedback,
        student:users!assignment_submissions_student_id_fkey(
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq("assignment_id", assignmentId)
      .order("submitted_at", { ascending: false });

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all assignment submissions across all assignments taught by this teacher
const getTeacherSubmissions = async (req, res) => {
  try {
    const teacherId = req.user.id;

    // 1. Fetch assignments created by this teacher
    const { data: assignments, error: assignError } = await supabase
      .from("assignments")
      .select("id")
      .eq("created_by", teacherId);

    if (assignError) {
      return res.status(500).json({ message: assignError.message });
    }

    const assignmentIds = assignments.map((a) => a.id);

    if (assignmentIds.length === 0) {
      return res.json([]);
    }

    // 2. Fetch submissions for these assignments
    const { data, error } = await supabase
      .from("assignment_submissions")
      .select(`
        id,
        assignment_id,
        student_id,
        file_url,
        submission_text,
        submitted_at,
        marks_obtained,
        feedback,
        student:users!assignment_submissions_student_id_fkey(
          id,
          first_name,
          last_name,
          email
        ),
        assignments (
          id,
          title,
          class_id,
          classes (
            id,
            code,
            name
          )
        )
      `)
      .in("assignment_id", assignmentIds)
      .order("submitted_at", { ascending: false });

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    // Map to frontend expected names
    const mapped = data.map((sub) => ({
      id: sub.id,
      assignmentId: sub.assignment_id,
      studentId: sub.student_id,
      studentName: sub.student ? `${sub.student.first_name} ${sub.student.last_name}` : "Unknown Student",
      assignmentTitle: sub.assignments?.title || "Unknown Assignment",
      courseCode: sub.assignments?.classes?.code || "",
      courseId: sub.assignments?.class_id || "",
      submittedDate: sub.submitted_at,
      marks: sub.marks_obtained,
      feedback: sub.feedback,
      fileUrl: sub.file_url,
    }));

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Grade assignment submission (Teacher only)
const gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { marks, feedback } = req.body;
    const teacherId = req.user.id;

    // Fetch submission with max_marks and ownership details
    const { data: submission, error: fetchError } = await supabase
      .from("assignment_submissions")
      .select(`
        *,
        assignments!inner(
          max_marks,
          classes!inner(teacher_id)
        )
      `)
      .eq("id", submissionId)
      .single();

    if (fetchError || !submission) {
      return res.status(404).json({ message: "Submission not found." });
    }

    const classTeacherId = submission.assignments.classes.teacher_id;
    if (classTeacherId !== teacherId && req.user.role !== "admin") {
      return res.status(403).json({ message: "You are not authorized to grade this submission." });
    }

    const maxMarks = submission.assignments.max_marks;
    if (marks === undefined || isNaN(Number(marks)) || Number(marks) < 0 || Number(marks) > maxMarks) {
      return res.status(400).json({ message: `Marks must be a valid number between 0 and ${maxMarks}.` });
    }

    const { data, error } = await supabase
      .from("assignment_submissions")
      .update({
        marks_obtained: Number(marks),
        feedback,
        graded_by: teacherId,
        graded_at: new Date().toISOString(),
      })
      .eq("id", submissionId)
      .select();

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    res.json({
      message: "Submission graded successfully.",
      data: data[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAssignmentSubmissions,
  getTeacherSubmissions,
  gradeSubmission,
};