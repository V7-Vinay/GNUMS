import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import { Login } from './pages/auth/Login';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { RegisterRequest } from './pages/auth/RegisterRequest';
import { ResetPassword } from './pages/auth/ResetPassword';

import { StudentDashboard } from './pages/student/Dashboard';
import { StudentAttendance } from './pages/student/Attendance';
import { StudentMarks } from './pages/student/Marks';
import { StudyMaterials } from './pages/student/StudyMaterials';
import { StudentAssignments } from './pages/student/Assignments';
import { StudentNotifications } from './pages/student/Notifications';
import { EnrolledCourses } from './pages/student/EnrolledCourses';  
import { StudentProfile } from './pages/student/Studentprofile';

import { TeacherDashboard } from './pages/teacher/Dashboard';
import { TeacherUploadNotes } from './pages/teacher/UploadNotes';
import { TeacherAttendanceManagement } from './pages/teacher/AttendanceManagement';
import { TeacherMarksManagement } from './pages/teacher/MarksManagement';
import { TeacherAssignmentManagement } from './pages/teacher/AssignmentManagement';
import { TeacherAnalytics } from './pages/teacher/Analytics';

import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminUserManagement } from './pages/admin/UserManagement';
import { AdminCourseManagement } from './pages/admin/CourseManagement';
import { AdminSystemAnalytics } from './pages/admin/SystemAnalytics';
import { AdminSettings } from './pages/admin/Settings';

const ProtectedRoute = ({ children, allowedRole }: { children: React.ReactNode; allowedRole: string }) => {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== allowedRole) {
    return <Navigate to={`/${user?.role}/dashboard`} replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to={`/${user?.role}/dashboard`} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Login />} />
      <Route path="/register-request" element={<RegisterRequest />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />


      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
       <Route
        path="/student/enrolled-courses"
        element={
          <ProtectedRoute allowedRole="student">
            <EnrolledCourses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/attendance"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentAttendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/marks"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentMarks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/materials"
        element={
          <ProtectedRoute allowedRole="student">
            <StudyMaterials />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/assignments"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentAssignments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/notifications"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentNotifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/profile"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher/dashboard"
        element={
          <ProtectedRoute allowedRole="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/upload-notes"
        element={
          <ProtectedRoute allowedRole="teacher">
            <TeacherUploadNotes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/attendance"
        element={
          <ProtectedRoute allowedRole="teacher">
            <TeacherAttendanceManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/marks"
        element={
          <ProtectedRoute allowedRole="teacher">
            <TeacherMarksManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/assignments"
        element={
          <ProtectedRoute allowedRole="teacher">
            <TeacherAssignmentManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/analytics"
        element={
          <ProtectedRoute allowedRole="teacher">
            <TeacherAnalytics />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminUserManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/courses"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminCourseManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminSystemAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminSettings />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
