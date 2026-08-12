const supabase = require("../../config/supabaseClient");

const getStudentNotifications = async (req, res) => {
  try {
    const studentId = req.user.id;

    // 1. Fetch student's enrolled classes
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

    // 2. Fetch assignments created for their classes
    const { data: assignments, error: asgError } = await supabase
      .from("assignments")
      .select(`
        id,
        title,
        created_at,
        classes (
          name,
          code
        )
      `)
      .in("class_id", classIds)
      .order("created_at", { ascending: false });

    if (asgError) {
      return res.status(500).json({ message: asgError.message });
    }

    // 3. Fetch graded submissions for the student
    const { data: submissions, error: subError } = await supabase
      .from("assignment_submissions")
      .select(`
        id,
        graded_at,
        marks_obtained,
        assignments (
          title
        )
      `)
      .eq("student_id", studentId)
      .not("graded_at", "is", null)
      .order("graded_at", { ascending: false });

    if (subError) {
      return res.status(500).json({ message: subError.message });
    }

    // 4. Map to notification objects
    const assignmentNotifications = (assignments || []).map((a) => ({
      id: "asg-" + a.id,
      userId: studentId,
      title: "New Assignment Posted",
      message: `"${a.title}" has been posted for ${a.classes?.name} (${a.classes?.code}).`,
      type: "info",
      date: a.created_at,
      read: false,
    }));

    const gradeNotifications = (submissions || []).map((s) => ({
      id: "grade-" + s.id,
      userId: studentId,
      title: "Marks Updated",
      message: `Your submission for "${s.assignments?.title}" has been graded. Score: ${s.marks_obtained}.`,
      type: "success",
      date: s.graded_at,
      read: false,
    }));

    // Combine notifications and sort by date
    const allNotifications = [...assignmentNotifications, ...gradeNotifications].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    res.json(allNotifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getStudentNotifications,
};
