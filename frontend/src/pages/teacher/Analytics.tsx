import { DashboardLayout } from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { courses, attendance, marks } from '../../data/mockData';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Users, Award } from 'lucide-react';

export const TeacherAnalytics = () => {
  const { user } = useAuth();

  const teachingCourses = courses.filter((c) => user?.teachingCourses?.includes(c.id));

  const attendanceData = teachingCourses.map((course) => {
    const courseAttendance = attendance.filter((a) => course.studentIds.includes(a.studentId));
    const present = courseAttendance.filter((a) => a.status === 'present').length;
    const total = courseAttendance.length;
    return {
      name: course.code,
      attendance: total > 0 ? Math.round((present / total) * 100) : 0,
    };
  });

  const performanceData = teachingCourses.map((course) => {
    const courseMarks = marks.filter((m) => m.courseId === course.id);
    const avg = courseMarks.length > 0
      ? courseMarks.reduce((sum, m) => sum + (m.marks / m.totalMarks) * 100, 0) / courseMarks.length
      : 0;
    return {
      name: course.code,
      average: Math.round(avg),
    };
  });

  const gradeDistribution = [
    { name: 'A (90-100%)', value: 0, color: '#10b981' },
    { name: 'B (80-89%)', value: 0, color: '#3b82f6' },
    { name: 'C (70-79%)', value: 0, color: '#f59e0b' },
    { name: 'D (60-69%)', value: 0, color: '#ef4444' },
    { name: 'F (<60%)', value: 0, color: '#dc2626' },
  ];

  marks.forEach((mark) => {
    const percentage = (mark.marks / mark.totalMarks) * 100;
    if (percentage >= 90) gradeDistribution[0].value++;
    else if (percentage >= 80) gradeDistribution[1].value++;
    else if (percentage >= 70) gradeDistribution[2].value++;
    else if (percentage >= 60) gradeDistribution[3].value++;
    else gradeDistribution[4].value++;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Class Analytics</h1>
          <p className="text-gray-600">Insights into student performance and engagement</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <Users className="w-8 h-8 mb-2 opacity-80" />
            <p className="text-3xl font-bold">
              {teachingCourses.reduce((sum, c) => sum + c.studentIds.length, 0)}
            </p>
            <p className="text-sm opacity-90">Total Students</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <TrendingUp className="w-8 h-8 mb-2 opacity-80" />
            <p className="text-3xl font-bold">
              {Math.round(attendanceData.reduce((sum, d) => sum + d.attendance, 0) / attendanceData.length || 0)}%
            </p>
            <p className="text-sm opacity-90">Avg Attendance</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <Award className="w-8 h-8 mb-2 opacity-80" />
            <p className="text-3xl font-bold">
              {Math.round(performanceData.reduce((sum, d) => sum + d.average, 0) / performanceData.length || 0)}%
            </p>
            <p className="text-sm opacity-90">Avg Performance</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Course-wise Attendance</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="attendance" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Average Performance</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="average" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Grade Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={gradeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent=0}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                dataKey="value"
              >
                {gradeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
};
