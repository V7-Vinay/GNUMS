import { DashboardLayout } from '../../components/DashboardLayout';
import { DashboardCard } from '../../components/DashboardCard';
import { users, courses, attendance, marks } from '../../data/mockData';
import { Users, BookOpen, TrendingUp, Activity, UserPlus, GraduationCap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const AdminDashboard = () => {
  const totalUsers = users.length;
  const totalStudents = users.filter((u) => u.role === 'student').length;
  const totalTeachers = users.filter((u) => u.role === 'teacher').length;
  const totalCourses = courses.length;

  const avgAttendance = attendance.length > 0
    ? Math.round((attendance.filter((a) => a.status === 'present').length / attendance.length) * 100)
    : 0;

  const avgMarks = marks.length > 0
    ? Math.round(marks.reduce((sum, m) => sum + (m.marks / m.totalMarks) * 100, 0) / marks.length)
    : 0;

  const userGrowthData = [
    { month: 'Jan', students: 150, teachers: 12 },
    { month: 'Feb', students: 180, teachers: 15 },
    { month: 'Mar', students: totalStudents, teachers: totalTeachers },
  ];

  const courseEnrollmentData = courses.map((course) => ({
    name: course.code,
    students: course.studentIds.length,
  }));

  const recentActivities = [
    { action: 'New student enrolled', user: 'Emma Wilson', time: '2 hours ago' },
    { action: 'Course created', user: 'Dr. Sarah Johnson', time: '5 hours ago' },
    { action: 'Assignment submitted', user: 'James Smith', time: '1 day ago' },
    { action: 'New teacher joined', user: 'Prof. Michael Chen', time: '2 days ago' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin Dashboard</h1>
          <p className="text-gray-600">System overview and statistics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            title="Total Users"
            value={totalUsers}
            icon={Users}
            iconColor="text-blue-600"
            bgColor="bg-blue-100"
          />
          <DashboardCard
            title="Total Courses"
            value={totalCourses}
            icon={BookOpen}
            iconColor="text-green-600"
            bgColor="bg-green-100"
          />
          <DashboardCard
            title="Avg Attendance"
            value={`${avgAttendance}%`}
            icon={TrendingUp}
            iconColor="text-purple-600"
            bgColor="bg-purple-100"
          />
          <DashboardCard
            title="Avg Performance"
            value={`${avgMarks}%`}
            icon={Activity}
            iconColor="text-orange-600"
            bgColor="bg-orange-100"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="students" fill="#3b82f6" name="Students" />
                <Bar dataKey="teachers" fill="#10b981" name="Teachers" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Enrollment</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={courseEnrollmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="students" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Students</p>
                    <p className="text-xs text-gray-600">{Math.round((totalStudents / totalUsers) * 100)}% of total</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-blue-600">{totalStudents}</p>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Teachers</p>
                    <p className="text-xs text-gray-600">{Math.round((totalTeachers / totalUsers) * 100)}% of total</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-green-600">{totalTeachers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h2>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-600">{activity.user} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
