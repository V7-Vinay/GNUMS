const supabase = require("../config/supabaseClient")

// Create assignment
const createAssignment = async (req, res) => {

  const teacherId = req.user.id
  const { title, description, courseId, dueDate, maxMarks } = req.body

  const { data, error } = await supabase
    .from("assignments")
    .insert([
      {
        title,
        description,
        course_id: courseId,
        teacher_id: teacherId,
        due_date: dueDate,
        max_marks: maxMarks
      }
    ])

  if (error) {
    return res.status(500).json(error)
  }

  res.json(data)
}


// Get assignments created by this teacher
const getTeacherAssignments = async (req, res) => {

  const teacherId = req.user.id

  const { data, error } = await supabase
    .from("assignments")
    .select("*")
    .eq("teacher_id", teacherId)

  if (error) {
    return res.status(500).json(error)
  }

  res.json(data)
}

module.exports = {
  createAssignment,
  getTeacherAssignments
}