import { DashboardLayout } from '../../components/DashboardLayout';
import { users, courses, attendance, marks, assignments, studyMaterials } from '../../data/mockData';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Activity, Database } from 'lucide-react';

export const AdminSystemAnalytics = () => {
  const systemStats = {
    totalUsers: users.length,
    totalCourses: courses.length,
    totalAttendance: attendance.length,
    totalMarks: marks.length,
    totalAssignments: assignments.length,
    totalMaterials: studyMaterials.length,
  };

  const roleDistribution = [
    { name: 'Students', value: users.filter((u) => u.role === 'student').length, color: '#3b82f6' },
    { name: 'Teachers', value: users.filter((u) => u.role === 'teacher').length, color: '#10b981' },
    { name: 'Admins', value: users.filter((u) => u.role === 'admin').length, color: '#8b5cf6' },
  ];

  const monthlyActivity = [
    { month: 'Jan', users: 120, courses: 8 },
    { month: 'Feb', users: 150, courses: 10 },
    { month: 'Mar', users: users.length, courses: courses.length },
  ];

  const performanceMetrics = [
    { metric: 'Avg Attendance', value: Math.round((attendance.filter((a) => a.status === 'present').length / attendance.length) * 100) },
    { metric: 'Avg Marks', value: Math.round(marks.reduce((sum, m) => sum + (m.marks / m.totalMarks) * 100, 0) / marks.length) },
    { metric: 'Assignment Completion', value: 85 },
    { metric: 'Material Usage', value: 92 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">System Analytics</h1>
          <p className="text-gray-600">Comprehensive system performance metrics</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(systemStats).map(([key, value]) => (
            <div key={key} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-600 mt-1 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">User Role Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roleDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  dataKey="value"
                >
                  {roleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Growth</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="courses" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceMetrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="metric" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <TrendingUp className="w-8 h-8 mb-2 opacity-80" />
            <p className="text-3xl font-bold">+15%</p>
            <p className="text-sm opacity-90">User Growth</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <Activity className="w-8 h-8 mb-2 opacity-80" />
            <p className="text-3xl font-bold">92%</p>
            <p className="text-sm opacity-90">System Uptime</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <Database className="w-8 h-8 mb-2 opacity-80" />
            <p className="text-3xl font-bold">2.4GB</p>
            <p className="text-sm opacity-90">Data Usage</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
