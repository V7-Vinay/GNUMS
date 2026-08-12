import API from "./axios"

// Fetch student dashboard statistics
export const getStudentDashboard = async () => {
  const { data } = await API.get("/student/dashboard")
  return data
}

// Fetch enrolled classes
export const getStudentCourses = async () => {
  const { data } = await API.get("/student/courses")
  return data
}

// Fetch student attendance records
export const getStudentAttendance = async () => {
  const { data } = await API.get("/student/attendance")
  return data
}

// Fetch student grades/marks
export const getStudentMarks = async () => {
  const { data } = await API.get("/student/marks")
  return data
}

// Fetch assignments published for enrolled classes
export const getStudentAssignments = async () => {
  const { data } = await API.get("/student/assignments")
  return data
}

// Submit assignment file & text
export const submitAssignment = async (formData: FormData) => {
  const { data } = await API.post("/student/assignments/submit", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  })
  return data
}

// Fetch study materials
export const getStudentMaterials = async () => {
  const { data } = await API.get("/student/materials");
  return data;
};

// Fetch student notifications
export const getStudentNotifications = async () => {
  const { data } = await API.get("/student/notifications");
  return data;
};