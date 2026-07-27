const supabase = require("../config/supabaseClient")

// Create assignment (Teacher)
const createAssignment = async (req, res) => {
  try {
    const teacherId = req.user.id
    const { title, description, classId, dueDate, maxMarks } = req.body

    // 1. Validation
    if (!title || !classId || !dueDate || maxMarks === undefined) {
      return res.status(400).json({ message: "title, classId, dueDate, and maxMarks are required." })
    }

    if (isNaN(Number(maxMarks)) || Number(maxMarks) <= 0) {
      return res.status(400).json({ message: "maxMarks must be a positive number." })
    }

    const parsedDate = new Date(dueDate)
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: "Invalid due date format." })
    }

    // 2. Ownership verification
    const { data: classData, error: classError } = await supabase
      .from("classes")
      .select("teacher_id")
      .eq("id", classId)
      .single()

    if (classError || !classData) {
      return res.status(404).json({ message: "Class not found." })
    }

    if (classData.teacher_id !== teacherId && req.user.role !== "admin") {
      return res.status(403).json({ message: "You are not authorized to create assignments for this class." })
    }

    // 3. Create assignment
    const { data, error } = await supabase
      .from("assignments")
      .insert([
        {
          title,
          description,
          class_id: classId,
          due_date: parsedDate.toISOString(),
          max_marks: Number(maxMarks),
          created_by: teacherId
        }
      ])
      .select()

    if (error) {
      return res.status(500).json({ message: error.message })
    }

    res.status(201).json({ message: "Assignment created successfully.", data })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// Get assignments created by this teacher
const getTeacherAssignments = async (req, res) => {
  try {
    const teacherId = req.user.id

    const { data, error } = await supabase
      .from("assignments")
      .select(`
        *,
        classes!inner(name, code, teacher_id)
      `)
      .eq("created_by", teacherId)

    if (error) {
      return res.status(500).json({ message: error.message })
    }

    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = {
  createAssignment,
  getTeacherAssignments
}