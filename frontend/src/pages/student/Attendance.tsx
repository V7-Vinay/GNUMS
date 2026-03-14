import { DashboardLayout } from '../../components/DashboardLayout';
import { DataTable } from '../../components/DataTable';
import { useAuth } from '../../context/AuthContext';
import { attendance, courses } from '../../data/mockData';
import { Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const StudentAttendance = () => {
  const { user } = useAuth();

  const studentAttendance = attendance.filter((a) => a.studentId === user?.id);

  const attendanceByStatus = {
    present: studentAttendance.filter((a) => a.status === 'present').length,
    absent: studentAttendance.filter((a) => a.status === 'absent').length,
    late: studentAttendance.filter((a) => a.status === 'late').length,
  };

  const totalClasses = studentAttendance.length;
  const attendancePercentage = totalClasses > 0
    ? Math.round((attendanceByStatus.present / totalClasses) * 100)
    : 0;

  const courseAttendanceData = courses
    .filter((c) => user?.enrolledCourses?.includes(c.id))
    .map((course) => {
      const courseAttendance = studentAttendance.filter((a) => a.courseId === course.id);
      const present = courseAttendance.filter((a) => a.status === 'present').length;
      const total = courseAttendance.length;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

      return {
        name: course.code,
        attendance: percentage,
      };
    });

  const columns = [
    {
      header: 'Date',
      accessor: 'date',
      render: (value: string) => new Date(value).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    },
    {
      header: 'Course',
      accessor: 'courseId',
      render: (value: string) => {
        const course = courses.find((c) => c.id === value);
        return (
          <div>
            <p className="font-medium">{course?.name}</p>
            <p className="text-xs text-gray-500">{course?.code}</p>
          </div>
        );
      },
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (value: string) => {
        const statusConfig = {
          present: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', label: 'Present' },
          absent: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Absent' },
          late: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Late' },
        };

        const config = statusConfig[value as keyof typeof statusConfig];
        const Icon = config.icon;

        return (
          <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.color}`}>
            <Icon className="w-4 h-4" />
            <span>{config.label}</span>
          </span>
        );
      },
    },
  ];

  const sortedAttendance = [...studentAttendance].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Attendance</h1>
          <p className="text-gray-600">Track your class attendance and performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <Calendar className="w-8 h-8 mb-3 opacity-80" />
            <p className="text-sm font-medium opacity-90 mb-1">Overall Attendance</p>
            <p className="text-4xl font-bold">{attendancePercentage}%</p>
            <p className="text-xs mt-2 opacity-80">{attendanceByStatus.present} of {totalClasses} classes</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <CheckCircle2 className="w-8 h-8 mb-3 opacity-80" />
            <p className="text-sm font-medium opacity-90 mb-1">Present</p>
            <p className="text-4xl font-bold">{attendanceByStatus.present}</p>
            <p className="text-xs mt-2 opacity-80">Classes attended</p>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
            <XCircle className="w-8 h-8 mb-3 opacity-80" />
            <p className="text-sm font-medium opacity-90 mb-1">Absent</p>
            <p className="text-4xl font-bold">{attendanceByStatus.absent}</p>
            <p className="text-xs mt-2 opacity-80">Classes missed</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Course-wise Attendance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={courseAttendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="attendance" radius={[8, 8, 0, 0]}>
                {courseAttendanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.attendance >= 75 ? '#10b981' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Attendance History</h2>
          </div>
          <DataTable columns={columns} data={sortedAttendance} emptyMessage="No attendance records found" />
        </div>
      </div>
    </DashboardLayout>
  );
};
