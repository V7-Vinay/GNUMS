import { DashboardLayout } from '../../components/DashboardLayout';
import { DashboardCard } from '../../components/DashboardCard';
import { useAuth } from '../../context/AuthContext';
import { courses, attendance, assignments, studyMaterials, users } from '../../data/mockData';
import { BookOpen, Users, ClipboardList, FileText, Calendar, TrendingUp } from 'lucide-react';

export const TeacherDashboard = () => {
  const { user } = useAuth();

  const teachingCourses = courses.filter((c) =>
    user?.teachingCourses?.includes(c.id)
  );

  const totalStudents = teachingCourses.reduce(
    (sum, course) => sum + course.studentIds.length,
    0
  );

  const teacherAssignments = assignments.filter((a) => a.teacherId === user?.id);
  const totalSubmissions = teacherAssignments.reduce(
    (sum, assignment) => sum + (assignment.submissions?.length || 0),
    0
  );

  const teacherMaterials = studyMaterials.filter((m) => m.teacherId === user?.id);

  const recentSubmissions = teacherAssignments
    .flatMap((a) =>
      (a.submissions || []).map((s) => ({
        ...s,
        assignmentTitle: a.title,
        courseId: a.courseId,
      }))
    )
    .sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime())
    .slice(0, 5);

  const upcomingClasses = teachingCourses.map((course) => {
    const nextClass = new Date();
    nextClass.setDate(nextClass.getDate() + Math.floor(Math.random() * 7));
    return {
      course,
      date: nextClass,
    };
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome, {user?.name}!</h1>
          <p className="text-gray-600">Here's an overview of your teaching activities.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            title="Courses Teaching"
            value={teachingCourses.length}
            icon={BookOpen}
            iconColor="text-blue-600"
            bgColor="bg-blue-100"
          />
          <DashboardCard
            title="Total Students"
            value={totalStudents}
            icon={Users}
            iconColor="text-green-600"
            bgColor="bg-green-100"
          />
          <DashboardCard
            title="Assignments"
            value={teacherAssignments.length}
            icon={ClipboardList}
            iconColor="text-purple-600"
            bgColor="bg-purple-100"
            description={`${totalSubmissions} submissions`}
          />
          <DashboardCard
            title="Study Materials"
            value={teacherMaterials.length}
            icon={FileText}
            iconColor="text-orange-600"
            bgColor="bg-orange-100"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Submissions</h2>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {recentSubmissions.length === 0 ? (
                <p className="text-gray-500 text-sm">No recent submissions</p>
              ) : (
                recentSubmissions.map((submission) => {
                  const student = users.find((u) => u.id === submission.studentId);
                  const course = courses.find((c) => c.id === submission.courseId);
                  return (
                    <div
                      key={submission.id}
                      className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 text-sm">{submission.assignmentTitle}</h3>
                        <p className="text-xs text-gray-600 mt-1">
                          {student?.name} • {course?.code}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(submission.submittedDate).toLocaleDateString()}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Classes</h2>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {upcomingClasses.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.course.name}</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      {item.course.studentIds.length} students enrolled
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {item.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-500">10:00 AM</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">My Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachingCourses.map((course) => {
              const courseAttendance = attendance.filter((a) => course.studentIds.includes(a.studentId));
              const avgAttendance = courseAttendance.length > 0
                ? Math.round(
                    (courseAttendance.filter((a) => a.status === 'present').length / courseAttendance.length) * 100
                  )
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
                    <span className="text-gray-600">{course.studentIds.length} Students</span>
                    <span className="font-medium text-green-600">{avgAttendance}% Avg Attendance</span>
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
