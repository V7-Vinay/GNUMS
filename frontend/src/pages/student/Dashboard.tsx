import { BookOpen, Calendar, GraduationCap, ClipboardList, TrendingUp, Clock } from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { DashboardCard } from '../../components/DashboardCard';
import { useAuth } from '../../context/AuthContext';
import { courses, attendance, marks, assignments, studyMaterials } from '../../data/mockData';

export const StudentDashboard = () => {
  const { user } = useAuth();

  const enrolledCourses = courses.filter((c) =>
    user?.enrolledCourses?.includes(c.id)
  );

  const studentAttendance = attendance.filter((a) => a.studentId === user?.id);
  const totalClasses = studentAttendance.length;
  const presentClasses = studentAttendance.filter((a) => a.status === 'present').length;
  const attendancePercentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;

  const studentMarks = marks.filter((m) => m.studentId === user?.id);
  const avgMarks = studentMarks.length > 0
    ? Math.round(
        studentMarks.reduce((sum, m) => sum + (m.marks / m.totalMarks) * 100, 0) /
          studentMarks.length
      )
    : 0;

  const allAssignments = assignments.filter((a) =>
    user?.enrolledCourses?.includes(a.courseId)
  );
  const pendingAssignments = allAssignments.filter((a) => {
    const hasSubmitted = a.submissions?.some((s) => s.studentId === user?.id);
    return !hasSubmitted && new Date(a.dueDate) > new Date();
  });

  const recentMaterials = studyMaterials
    .filter((m) => user?.enrolledCourses?.includes(m.courseId))
    .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
    .slice(0, 5);

  const upcomingAssignments = allAssignments
    .filter((a) => new Date(a.dueDate) > new Date())
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600">Here's what's happening with your courses today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            title="Enrolled Courses"
            value={enrolledCourses.length}
            icon={BookOpen}
            iconColor="text-blue-600"
            bgColor="bg-blue-100"
          />
          <DashboardCard
            title="Attendance"
            value={`${attendancePercentage}%`}
            icon={Calendar}
            iconColor="text-green-600"
            bgColor="bg-green-100"
            description={`${presentClasses} of ${totalClasses} classes`}
          />
          <DashboardCard
            title="Average Marks"
            value={`${avgMarks}%`}
            icon={GraduationCap}
            iconColor="text-purple-600"
            bgColor="bg-purple-100"
            description="Overall performance"
          />
          <DashboardCard
            title="Pending Assignments"
            value={pendingAssignments.length}
            icon={ClipboardList}
            iconColor="text-orange-600"
            bgColor="bg-orange-100"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Assignments</h2>
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {upcomingAssignments.length === 0 ? (
                <p className="text-gray-500 text-sm">No upcoming assignments</p>
              ) : (
                upcomingAssignments.map((assignment) => {
                  const course = courses.find((c) => c.id === assignment.courseId);
                  const daysLeft = Math.ceil(
                    (new Date(assignment.dueDate).getTime() - new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                  );
                  return (
                    <div
                      key={assignment.id}
                      className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{assignment.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{course?.name}</p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded ${
                            daysLeft <= 2
                              ? 'bg-red-100 text-red-700'
                              : daysLeft <= 5
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {daysLeft === 0 ? 'Due today' : `${daysLeft} days left`}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Study Materials</h2>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {recentMaterials.length === 0 ? (
                <p className="text-gray-500 text-sm">No study materials available</p>
              ) : (
                recentMaterials.map((material) => {
                  const course = courses.find((c) => c.id === material.courseId);
                  return (
                    <div
                      key={material.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 text-sm">{material.title}</h3>
                        <p className="text-xs text-gray-600 mt-1">{course?.name}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(material.uploadDate).toLocaleDateString()}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">My Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrolledCourses.map((course) => {
              const courseAttendance = studentAttendance.filter((a) => a.courseId === course.id);
              const coursePresent = courseAttendance.filter((a) => a.status === 'present').length;
              const courseAttendancePerc =
                courseAttendance.length > 0
                  ? Math.round((coursePresent / courseAttendance.length) * 100)
                  : 0;

              return (
                <div
                  key={course.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-xs font-medium text-gray-500">{course.code}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{course.name}</h3>
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Attendance:</span>
                    <span
                      className={`font-medium ${
                        courseAttendancePerc >= 75 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {courseAttendancePerc}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
