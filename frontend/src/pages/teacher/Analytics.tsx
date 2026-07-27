import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Users, Award, Loader2 } from 'lucide-react';
import API from '../../api/axios';

export const TeacherAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<{
    classes: any[];
    assignments: any[];
    studentAttendance: any[];
  } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await API.get("/analytics/teacher");
        setAnalyticsData(data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load analytics.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-gray-500 font-medium">Aggregating database statistics...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !analyticsData) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-xl mx-auto mt-10">
          <p className="text-red-800 font-semibold mb-2">Error Loading Analytics</p>
          <p className="text-red-600 text-sm">{error || "Could not retrieve data."}</p>
        </div>
      </DashboardLayout>
    );
  }

  const { classes, assignments, studentAttendance } = analyticsData;

  // Process data for charts
  const attendanceData = classes.map((c) => ({
    name: c.class_code,
    attendance: Math.round(Number(c.average_attendance || 0)),
  }));

  const performanceData = classes.map((c) => ({
    name: c.class_code,
    average: Math.round(Number(c.average_grade_percentage || 0)),
  }));

  const totalStudents = new Set(studentAttendance.map((s) => s.student_id)).size;

  const gradeDistribution = [
    { name: 'A (90-100%)', value: 0, color: '#10b981' },
    { name: 'B (80-89%)', value: 0, color: '#3b82f6' },
    { name: 'C (70-79%)', value: 0, color: '#f59e0b' },
    { name: 'D (60-69%)', value: 0, color: '#ef4444' },
    { name: 'F (<60%)', value: 0, color: '#dc2626' },
  ];

  assignments.forEach((asg: any) => {
    const percentage = asg.max_marks > 0 ? (Number(asg.average_marks) / Number(asg.max_marks)) * 100 : 0;
    if (percentage >= 90) gradeDistribution[0].value++;
    else if (percentage >= 80) gradeDistribution[1].value++;
    else if (percentage >= 70) gradeDistribution[2].value++;
    else if (percentage >= 60) gradeDistribution[3].value++;
    else gradeDistribution[4].value++;
  });

  const avgAttendanceOverall = attendanceData.length > 0
    ? Math.round(attendanceData.reduce((sum, d) => sum + d.attendance, 0) / attendanceData.length)
    : 0;

  const avgPerformanceOverall = performanceData.length > 0
    ? Math.round(performanceData.reduce((sum, d) => sum + d.average, 0) / performanceData.length)
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Class Analytics</h1>
          <p className="text-gray-600">Database View-aggregated insights into student performance and engagement</p>
        </div>

        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <Users className="w-8 h-8 mb-2 opacity-80" />
            <p className="text-3xl font-bold">{totalStudents}</p>
            <p className="text-sm opacity-90">Total Enrolled Students</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <TrendingUp className="w-8 h-8 mb-2 opacity-80" />
            <p className="text-3xl font-bold">{avgAttendanceOverall}%</p>
            <p className="text-sm opacity-90">Avg Attendance Rate</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <Award className="w-8 h-8 mb-2 opacity-80" />
            <p className="text-3xl font-bold">{avgPerformanceOverall}%</p>
            <p className="text-sm opacity-90">Avg Performance Score</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Course-wise Attendance</h2>
            {attendanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="attendance" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-gray-400">No attendance data to display</div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Average Performance</h2>
            {performanceData.length > 0 ? (
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
            ) : (
              <div className="flex h-[300px] items-center justify-center text-gray-400">No performance data to display</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Assignment Performance Distribution</h2>
          {assignments.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={gradeDistribution.filter(g => g.value > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent = 0 }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  dataKey="value"
                >
                  {gradeDistribution.filter(g => g.value > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-gray-400">No assignments to distribute</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
