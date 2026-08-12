import API from "./axios";

// 1. Fetch all system users
export const getAdminUsers = async () => {
  const { data } = await API.get("/admin/users");
  return data;
};

// 2. Create new user
export const createAdminUser = async (userData: any) => {
  const { data } = await API.post("/admin/users", userData);
  return data;
};

// 3. Update existing user profile fields
export const updateAdminUser = async (id: string, userData: any) => {
  const { data } = await API.put(`/admin/users/${id}`, userData);
  return data;
};

// 4. Delete user
export const deleteAdminUser = async (id: string) => {
  const { data } = await API.delete(`/admin/users/${id}`);
  return data;
};

// 5. Fetch all courses/classes
export const getAdminClasses = async () => {
  const { data } = await API.get("/admin/classes");
  return data;
};

// 6. Create class
export const createAdminClass = async (classData: any) => {
  const { data } = await API.post("/admin/classes", classData);
  return data;
};

// 7. Update class
export const updateAdminClass = async (id: string, classData: any) => {
  const { data } = await API.put(`/admin/classes/${id}`, classData);
  return data;
};

// 8. Delete class
export const deleteAdminClass = async (id: string) => {
  const { data } = await API.delete(`/admin/classes/${id}`);
  return data;
};

// 9. Enroll student into class
export const enrollAdminStudent = async (enrollData: { classId: string; studentId: string }) => {
  const { data } = await API.post("/admin/classes/enroll", enrollData);
  return data;
};

// 10. Fetch consolidated system dashboard stats
export const getAdminDashboardStats = async () => {
  const { data } = await API.get("/admin/dashboard");
  return data;
};
