const supabase = require("../config/supabaseClient")

const getTeacherAnalytics = async (req, res) => {
  try {
    const teacherId = req.user.id

    // 1. Fetch class-level dashboard summaries
    const { data: classes, error: classErr } = await supabase
      .from("view_class_analytics_summary")
      .select("*")
      .eq("teacher_id", teacherId)

    if (classErr) {
      return res.status(500).json({ message: classErr.message })
    }

    const classIds = classes.map(c => c.class_id)

    // If teacher has no classes, return empty datasets
    if (classIds.length === 0) {
      return res.json({
        classes: [],
        assignments: [],
        studentAttendance: []
      })
    }

    // 2. Fetch assignment-level submission rates and averages
    const { data: assignments, error: asgErr } = await supabase
      .from("view_assignment_submission_analytics")
      .select("*")
      .in("class_id", classIds)

    if (asgErr) {
      return res.status(500).json({ message: asgErr.message })
    }

    // 3. Fetch student-level attendance summaries
    const { data: studentAttendance, error: attErr } = await supabase
      .from("view_student_attendance_analytics")
      .select("*")
      .in("class_id", classIds)

    if (attErr) {
      return res.status(500).json({ message: attErr.message })
    }

    res.json({
      classes,
      assignments,
      studentAttendance
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = { getTeacherAnalytics }