import { DashboardLayout } from "../../components/DashboardLayout"
import { DataTable } from "../../components/DataTable"
import { useAuth } from "../../context/AuthContext"
import { useEffect, useState } from "react"
import { getStudentMarks, getStudentCourses } from "../../api/studentApi"
import { useSemester } from "../../hooks/useSemester"
import { GraduationCap, TrendingUp, Award } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

export const StudentMarks = () => {
  const { user } = useAuth();
  const { selectedSem, SemesterDropdown } = useSemester();

  const [courses, setCourses] = useState<any[]>([])
  const [marks, setMarks] = useState<any[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const coursesData = await getStudentCourses()
        setCourses(coursesData)

        const marksData = await getStudentMarks()
        setMarks(marksData)
      } catch (error) {
        console.error("Failed to load marks:", error)
      }
    }

    loadData()
  }, [])

  // ── Semester filter ────────────────────────────────────────────────────
  const allEnrolled  = courses.filter((c) => user?.enrolledCourses?.includes(c.id));
  const semCourses   = allEnrolled.filter((c) => selectedSem === 'all' || c.semester === selectedSem);
  const semCourseIds = semCourses.map((c) => c.id);

  const studentMarks = marks.filter((m) =>
  semCourseIds.includes(m.course_id)
);

  // ── Stats (scoped to selected semester) ───────────────────────────────
  const totalMarks     = studentMarks.reduce((sum, m) => sum + m.marks, 0);
  const totalPossible  = studentMarks.reduce((sum, m) => sum + m.total_marks, 0);
  const overallPercentage = totalPossible > 0
    ? Math.round((totalMarks / totalPossible) * 100)
    : 0;

  const avgPercentage = studentMarks.length > 0
    ? Math.round(
        studentMarks.reduce((sum, m) => sum + (m.marks / m.total_marks) * 100, 0) /
          studentMarks.length
      )
    : 0;

  const highestMark = studentMarks.length > 0
    ? Math.max(...studentMarks.map((m) => (m.marks / m.total_marks) * 100))
    : 0;

  // ── Chart data (scoped to semester courses) ───────────────────────────
  const performanceData = semCourses.map((course) => {
    const courseMarks = studentMarks.filter((m) => m.course_id === course.id)
    const avg =
      courseMarks.length > 0
        ? courseMarks.reduce(
            (sum, m) => sum + (m.marks / m.total_marks) * 100,
            0
          ) / courseMarks.length
        : 0
    return {
      name: course.code,
      percentage: Math.round(avg),
    };
  });

  // ── Table columns (unchanged) ──────────────────────────────────────────
  const columns = [
    {
      header: 'Course',
      accessor: 'course_id',
      render: (value: string) => {
        const course = courses.find((c) => c.id === value);
        return (
          <div>
            <p className="font-medium">{course?.name}</p>
            <p className="text-xs text-gray-500">
              {course?.code}
              {course?.semester && (
                <span className="ml-2 font-medium text-blue-500">Sem {course.semester}</span>
              )}
            </p>
          </div>
        );
      },
    },
    {
      header: 'Exam Type',
      accessor: 'exam_type',
    },
    {
      header: 'Marks Obtained',
      accessor: 'marks',
      render: (value: number, row: any) => (
        <span className="font-medium">{value} / {row.total_marks}</span>
      ),
    },
    {
      header: 'Percentage',
      accessor: 'percentage',
      render: (_: any, row: any) => {
        const percentage = Math.round((row.marks / row.total_marks) * 100);
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
      render: (value: string) =>
        new Date(value).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
    },
    {
      header: 'Grade',
      accessor: 'grade',
      render: (_: any, row: any) => {
        const percentage = Math.round((row.marks / row.total_marks) * 100);
        let grade = 'F';
        let colorClass = 'bg-red-100 text-red-700';
        if (percentage >= 90) { grade = 'A+'; colorClass = 'bg-green-100 text-green-700'; }
        else if (percentage >= 80) { grade = 'A';  colorClass = 'bg-green-100 text-green-700'; }
        else if (percentage >= 70) { grade = 'B';  colorClass = 'bg-blue-100 text-blue-700'; }
        else if (percentage >= 60) { grade = 'C';  colorClass = 'bg-yellow-100 text-yellow-700'; }
        else if (percentage >= 50) { grade = 'D';  colorClass = 'bg-orange-100 text-orange-700'; }
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

        {/* ── Header + Semester Dropdown ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Marks & Performance</h1>
            <p className="text-gray-600">View your exam results and academic performance</p>
          </div>
          <SemesterDropdown />
        </div>

        {/* ── Stat Cards ── */}
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

        {/* ── Course-wise Performance Chart ── */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Course-wise Performance</h2>
          {performanceData.length > 0 ? (
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
          ) : (
            <p className="text-gray-400 text-sm text-center py-10">
              No performance data for this semester.
            </p>
          )}
        </div>

        {/* ── Marks History Table ── */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Marks History</h2>
          </div>
          <DataTable
            columns={columns}
            data={sortedMarks}
            emptyMessage={
              selectedSem === 'all'
                ? 'No marks available yet'
                : `No marks found for Semester ${selectedSem}`
            }
          />
        </div>

      </div>
    </DashboardLayout>
  );
};