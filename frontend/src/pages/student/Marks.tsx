import { DashboardLayout } from '../../components/DashboardLayout';
import { DataTable } from '../../components/DataTable';
import { useAuth } from '../../context/AuthContext';
import { marks, courses } from '../../data/mockData';
import { GraduationCap, TrendingUp, Award } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const StudentMarks = () => {
  const { user } = useAuth();

  const studentMarks = marks.filter((m) => m.studentId === user?.id);

  const totalMarks = studentMarks.reduce((sum, m) => sum + m.marks, 0);
  const totalPossible = studentMarks.reduce((sum, m) => sum + m.totalMarks, 0);
  const overallPercentage = totalPossible > 0
    ? Math.round((totalMarks / totalPossible) * 100)
    : 0;

  const avgPercentage = studentMarks.length > 0
    ? Math.round(
        studentMarks.reduce((sum, m) => sum + (m.marks / m.totalMarks) * 100, 0) /
          studentMarks.length
      )
    : 0;

  const highestMark = studentMarks.length > 0
    ? Math.max(...studentMarks.map((m) => (m.marks / m.totalMarks) * 100))
    : 0;

  const performanceData = courses
    .filter((c) => user?.enrolledCourses?.includes(c.id))
    .map((course) => {
      const courseMarks = studentMarks.filter((m) => m.courseId === course.id);
      const avg = courseMarks.length > 0
        ? courseMarks.reduce((sum, m) => sum + (m.marks / m.totalMarks) * 100, 0) /
          courseMarks.length
        : 0;

      return {
        name: course.code,
        percentage: Math.round(avg),
      };
    });

  const columns = [
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
      header: 'Exam Type',
      accessor: 'examType',
    },
    {
      header: 'Marks Obtained',
      accessor: 'marks',
      render: (value: number, row: any) => (
        <span className="font-medium">{value} / {row.totalMarks}</span>
      ),
    },
    {
      header: 'Percentage',
      accessor: 'percentage',
      render: (_: any, row: any) => {
        const percentage = Math.round((row.marks / row.totalMarks) * 100);
        return (
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
              <div
                className={`h-2 rounded-full ${
                  percentage >= 80
                    ? 'bg-green-500'
                    : percentage >= 60
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="font-medium text-sm">{percentage}%</span>
          </div>
        );
      },
    },
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
      header: 'Grade',
      accessor: 'grade',
      render: (_: any, row: any) => {
        const percentage = Math.round((row.marks / row.totalMarks) * 100);
        let grade = 'F';
        let colorClass = 'bg-red-100 text-red-700';

        if (percentage >= 90) {
          grade = 'A+';
          colorClass = 'bg-green-100 text-green-700';
        } else if (percentage >= 80) {
          grade = 'A';
          colorClass = 'bg-green-100 text-green-700';
        } else if (percentage >= 70) {
          grade = 'B';
          colorClass = 'bg-blue-100 text-blue-700';
        } else if (percentage >= 60) {
          grade = 'C';
          colorClass = 'bg-yellow-100 text-yellow-700';
        } else if (percentage >= 50) {
          grade = 'D';
          colorClass = 'bg-orange-100 text-orange-700';
        }

        return (
          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}>
            {grade}
          </span>
        );
      },
    },
  ];

  const sortedMarks = [...studentMarks].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Marks & Performance</h1>
          <p className="text-gray-600">View your exam results and academic performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <GraduationCap className="w-8 h-8 mb-3 opacity-80" />
            <p className="text-sm font-medium opacity-90 mb-1">Overall Percentage</p>
            <p className="text-4xl font-bold">{overallPercentage}%</p>
            <p className="text-xs mt-2 opacity-80">{totalMarks} / {totalPossible} marks</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <TrendingUp className="w-8 h-8 mb-3 opacity-80" />
            <p className="text-sm font-medium opacity-90 mb-1">Average Score</p>
            <p className="text-4xl font-bold">{avgPercentage}%</p>
            <p className="text-xs mt-2 opacity-80">Across all exams</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <Award className="w-8 h-8 mb-3 opacity-80" />
            <p className="text-sm font-medium opacity-90 mb-1">Highest Score</p>
            <p className="text-4xl font-bold">{Math.round(highestMark)}%</p>
            <p className="text-xs mt-2 opacity-80">Best performance</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Course-wise Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="percentage"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Marks History</h2>
          </div>
          <DataTable columns={columns} data={sortedMarks} emptyMessage="No marks available yet" />
        </div>
      </div>
    </DashboardLayout>
  );
};
