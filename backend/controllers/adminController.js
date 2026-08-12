const supabase = require("../config/supabaseClient");

// 1. Get all users with their roles and profile information
const getUsers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select(`
        *,
        roles(name),
        student_profiles(roll_number),
        teacher_profiles(department)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    const mapped = data.map((u) => ({
      id: u.id,
      first_name: u.first_name,
      last_name: u.last_name,
      name: `${u.first_name} ${u.last_name}`,
      email: u.email,
      role: u.roles.name,
      roll_number: u.student_profiles?.roll_number || null,
      department: u.teacher_profiles?.department || null,
      must_change_password: u.must_change_password,
      created_at: u.created_at,
    }));

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Admin creates a new user
const createUser = async (req, res) => {
  try {
    const { email, password, role, first_name, last_name, roll_number, department } = req.body;

    if (!email || !role || !first_name || !last_name) {
      return res.status(400).json({ message: "email, role, first_name, and last_name are required." });
    }

    const validRoles = ["student", "teacher", "admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role specified." });
    }

    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password: password || "temp123456",
      email_confirm: true,
      user_metadata: {
        role,
        first_name,
        last_name,
        roll_number: role === "student" ? roll_number : null,
        department: role === "teacher" ? department : null,
      },
    });

    if (authError) {
      return res.status(500).json({ message: authError.message });
    }

    res.status(201).json({
      message: "User created successfully in Supabase Auth and database profiles.",
      user: authUser.user,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. Admin deletes a user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const { error } = await supabase.auth.admin.deleteUser(id);

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    res.json({ message: "User deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. Admin updates user profile
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, roll_number, department } = req.body;

    if (!id) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const { error: userError } = await supabase
      .from("users")
      .update({
        first_name,
        last_name,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (userError) {
      return res.status(500).json({ message: userError.message });
    }

    if (roll_number) {
      await supabase
        .from("student_profiles")
        .update({ roll_number })
        .eq("user_id", id);
    }

    if (department) {
      await supabase
        .from("teacher_profiles")
        .update({ department })
        .eq("user_id", id);
    }

    res.json({ message: "User updated successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 5. Get all classes/courses
const getClasses = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("classes")
      .select(`
        *,
        teacher:users!classes_teacher_id_fkey(id, first_name, last_name, email),
        class_enrollments(student_id)
      `);

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    const mapped = data.map((c) => ({
      id: c.id,
      code: c.code,
      name: c.name,
      description: c.description,
      teacherId: c.teacher_id,
      teacher: c.teacher
        ? {
            id: c.teacher.id,
            name: `${c.teacher.first_name} ${c.teacher.last_name}`,
            email: c.teacher.email,
          }
        : null,
      studentIds: c.class_enrollments ? c.class_enrollments.map((ce) => ce.student_id) : [],
    }));

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 6. Admin creates a new class
const createClass = async (req, res) => {
  try {
    const { code, name, description, teacherId } = req.body;

    if (!code || !name) {
      return res.status(400).json({ message: "code and name are required." });
    }

    const { data, error } = await supabase
      .from("classes")
      .insert([
        {
          code,
          name,
          description,
          teacher_id: teacherId || null,
        },
      ])
      .select();

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    res.status(201).json({ message: "Class created successfully.", data: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 7. Admin updates a class
const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, description, teacherId } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Class ID is required." });
    }

    const { data, error } = await supabase
      .from("classes")
      .update({
        code,
        name,
        description,
        teacher_id: teacherId || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select();

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    res.json({ message: "Class updated successfully.", data: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 8. Admin deletes a class
const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Class ID is required." });
    }

    const { error } = await supabase.from("classes").delete().eq("id", id);

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    res.json({ message: "Class deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 9. Enroll student into class
const enrollStudent = async (req, res) => {
  try {
    const { classId, studentId } = req.body;

    if (!classId || !studentId) {
      return res.status(400).json({ message: "classId and studentId are required." });
    }

    const { data, error } = await supabase
      .from("class_enrollments")
      .insert([
        {
          class_id: classId,
          student_id: studentId,
        },
      ])
      .select();

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    res.json({ message: "Student enrolled successfully.", data: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 10. Admin dashboard consolidated analytics stats
const getDashboardStats = async (req, res) => {
  try {
    // A. Users count & breakdown
    const { data: usersData, error: userError } = await supabase
      .from("users")
      .select("roles(name)");

    if (userError) {
      return res.status(500).json({ message: userError.message });
    }

    const totalUsers = usersData.length;
    const totalStudents = usersData.filter((u) => u.roles.name === "student").length;
    const totalTeachers = usersData.filter((u) => u.roles.name === "teacher").length;
    const totalAdmins = usersData.filter((u) => u.roles.name === "admin").length;

    // B. Classes count
    const { count: totalClasses, error: classError } = await supabase
      .from("classes")
      .select("*", { count: "exact", head: true });

    if (classError) {
      return res.status(500).json({ message: classError.message });
    }

    // C. Avg Attendance Rate & Count
    const { data: attData, error: attError } = await supabase.from("attendance").select("status");
    if (attError) {
      return res.status(500).json({ message: attError.message });
    }
    const totalAttendance = attData.length;
    const presentAtt = attData.filter((a) => a.status === "present").length;
    const avgAttendance = totalAttendance > 0 ? Math.round((presentAtt / totalAttendance) * 100) : 0;

    // D. Avg Academic Performance
    const { data: subData, error: subError } = await supabase
      .from("assignment_submissions")
      .select("marks_obtained, assignments(max_marks)")
      .not("marks_obtained", "is", null);

    if (subError) {
      return res.status(500).json({ message: subError.message });
    }

    const totalSubmissions = subData.length;
    const totalScorePercent = totalSubmissions > 0
      ? subData.reduce((sum, s) => sum + (Number(s.marks_obtained) / Number(s.assignments.max_marks)) * 100, 0)
      : 0;
    const avgMarks = totalSubmissions > 0 ? Math.round(totalScorePercent / totalSubmissions) : 0;

    // E. Extra counts for System Analytics
    const { count: totalMarksCount } = await supabase
      .from("marks")
      .select("*", { count: "exact", head: true });

    const { count: totalAssignmentsCount } = await supabase
      .from("assignments")
      .select("*", { count: "exact", head: true });

    const { count: totalMaterialsCount } = await supabase
      .from("study_materials")
      .select("*", { count: "exact", head: true });

    res.json({
      totalUsers,
      totalStudents,
      totalTeachers,
      totalAdmins,
      totalClasses: totalClasses || 0,
      avgAttendance,
      avgMarks,
      totalAttendance,
      totalMarks: totalMarksCount || 0,
      totalAssignments: totalAssignmentsCount || 0,
      totalMaterials: totalMaterialsCount || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getUsers,
  createUser,
  deleteUser,
  updateUser,
  getClasses,
  createClass,
  updateClass,
  deleteClass,
  enrollStudent,
  getDashboardStats,
};
