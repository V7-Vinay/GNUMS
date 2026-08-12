import API from "./axios";

// 1. Fetch teacher courses/classes
export const getTeacherCourses = async () => {
  const { data } = await API.get("/courses/teacher");
  return data;
};

// 2. Fetch attendance history
export const getTeacherAttendance = async () => {
  const { data } = await API.get("/attendance/teacher");
  return data;
};

// 3. Submit/Mark attendance
export const markTeacherAttendance = async (attendanceData: {
  classId: string;
  date: string;
  records: Array<{ studentId: string; status: "present" | "absent" | "late" | "excused" }>;
}) => {
  const { data } = await API.post("/attendance/mark", attendanceData);
  return data;
};

// 4. Fetch assignments created by teacher
export const getTeacherAssignments = async () => {
  const { data } = await API.get("/assignments/teacher");
  return data;
};

// 5. Create new assignment
export const createTeacherAssignment = async (assignmentData: {
  title: string;
  description: string;
  classId: string;
  dueDate: string;
  maxMarks: number;
}) => {
  const { data } = await API.post("/assignments/create", assignmentData);
  return data;
};

// 6. Fetch submissions for a specific assignment
export const getAssignmentSubmissions = async (assignmentId: string) => {
  const { data } = await API.get(`/assignments/${assignmentId}/submissions`);
  return data;
};

// Fetch all submissions for teacher's assignments
export const getTeacherSubmissions = async () => {
  const { data } = await API.get("/assignments/submissions/teacher");
  return data;
};

// 7. Grade a student submission
export const gradeStudentSubmission = async (
  submissionId: string,
  gradingData: { marks: number; feedback?: string }
) => {
  const { data } = await API.put(`/assignments/submissions/${submissionId}/grade`, gradingData);
  return data;
};

// 8. Fetch exam marks entered by teacher
export const getTeacherMarks = async () => {
  const { data } = await API.get("/marks/teacher");
  return data;
};

// 9. Enter student exam marks
export const addStudentMarks = async (marksData: {
  studentId: string;
  courseId: string;
  examType: string;
  marks: number;
  totalMarks: number;
}) => {
  const { data } = await API.post("/marks/add", marksData);
  return data;
};

// 10. Fetch uploaded notes/materials
export const getTeacherMaterials = async () => {
  const { data } = await API.get("/materials/teacher");
  return data;
};

// 11. Upload study material notes
export const uploadStudyMaterial = async (formData: FormData) => {
  const { data } = await API.post("/materials/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

// 12. Fetch analytics views
export const getTeacherAnalyticsStats = async () => {
  const { data } = await API.get("/analytics/teacher");
  return data;
};

// 13. Fetch students enrolled in a class
export const getClassStudents = async (classId: string) => {
  const { data } = await API.get(`/courses/${classId}/students`);
  return data;
};
