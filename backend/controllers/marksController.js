const supabase = require("../config/supabaseClient")

// Add marks
const addMarks = async (req, res) => {
  try {

    const { studentId, courseId, examType, marks, totalMarks } = req.body

    const { data, error } = await supabase
      .from("marks")
      .insert([
        {
          student_id: studentId,
          course_id: courseId,
          exam_type: examType,
          marks,
          total_marks: totalMarks,
          date: new Date()
        }
      ])
      .select()

    if (error) {
      return res.status(500).json(error)
    }

    res.json(data)

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}


// Get marks for teacher courses
const getTeacherMarks = async (req, res) => {
  try {

    const teacherId = req.user.id

    // get teacher courses
    const { data: courses, error: courseError } = await supabase
      .from("courses")
      .select("id")
      .eq("teacher_id", teacherId)

    if (courseError) {
      return res.status(500).json(courseError)
    }

    const courseIds = courses.map(c => c.id)

    // get marks for those courses
    const { data, error } = await supabase
      .from("marks")
      .select("*")
      .in("course_id", courseIds)

    if (error) {
      return res.status(500).json(error)
    }

    res.json(data)

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = {
  addMarks,
  getTeacherMarks
}