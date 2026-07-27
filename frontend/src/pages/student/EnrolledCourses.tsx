import { useState } from 'react';
import {
  BookOpen,
  Search,
  Clock,
  User,
  ChevronRight,
  BarChart2,
  FileText,
  ClipboardList,
  Filter,
} from 'lucide-react';
import { useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import {
  getStudentCourses,
  getStudentAttendance,
  getStudentMarks,
  getStudentAssignments
} from "../../api/studentApi";
import { useSemester } from '../../hooks/useSemester';

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  upcoming: 'bg-yellow-100 text-yellow-700',
};

export const EnrolledCourses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { selectedSem, SemesterDropdown } = useSemester();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'upcoming'>('all');
  const [courses, setCourses] = useState<any[]>([]);
const [attendance, setAttendance] = useState<any[]>([]);
const [marks, setMarks] = useState<any[]>([]);
const [assignments, setAssignments] = useState<any[]>([]);

const studentAttendance = attendance;
const studentMarks = marks;
  useEffect(() => {

  const loadData = async () => {

    try {

      const coursesData = await getStudentCourses();
      setCourses(coursesData);

      const attendanceData = await getStudentAttendance();
      setAttendance(attendanceData);

      const marksData = await getStudentMarks();
      setMarks(marksData);

      const assignmentsData = await getStudentAssignments();
      setAssignments(assignmentsData);

    } catch (error) {
      console.error("Failed to load courses page:", error);
    }

  };

  loadData();

}, []);
  // ── All enrolled, then filter by semester ─────────────────────────────
  const enrolledCourses = courses;
    const semCourses = enrolledCourses.filter(
    (c) => selectedSem === 'all' || c.semester === selectedSem
  );

  // ── Search + status filter applied on top of semester filter ──────────
  const filteredCourses = semCourses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(search.toLowerCase()) ||
      course.code.toLowerCase().includes(search.toLowerCase()) ||
      course.description?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === 'all' || (course.status ?? 'active') === filter;
    return matchesSearch && matchesFilter;
  });

  const getCourseStats = (course_id: string) => {
    const courseAttendance = studentAttendance.filter((a) => a.course_id === course_id);
    const present = courseAttendance.filter((a) => a.status === 'present').length;
    const attendancePerc =
      courseAttendance.length > 0
        ? Math.round((present / courseAttendance.length) * 100)
        : 0;

    const courseMarks = studentMarks.filter((m) => m.course_id === course_id);
    const avgMark =
      courseMarks.length > 0
        ? Math.round(
            courseMarks.reduce((sum, m) => sum + (m.marks / m.total_marks) * 100, 0) /
              courseMarks.length
          )
        : 0;

    const courseAssignments = assignments.filter((a) => a.course_id === course_id);
    const pending = courseAssignments.length;

    return { attendancePerc, avgMark, pending, totalClasses: courseAttendance.length };
  };

  const filterOptions: { label: string; value: typeof filter }[] = [
    { label: 'All',       value: 'all'       },
    { label: 'Active',    value: 'active'    },
    { label: 'Completed', value: 'completed' },
    { label: 'Upcoming',  value: 'upcoming'  },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
            <p className="text-gray-500 text-sm mt-1">
              {semCourses.length} course{semCourses.length !== 1 ? 's' : ''}
              {selectedSem !== 'all' ? ` in Semester ${selectedSem}` : ' enrolled'}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Semester Dropdown */}
            <SemesterDropdown />

            {/* Search */}
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* ── Status Filter Tabs ── */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-gray-400" />
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === opt.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* ── Summary Stats (scoped to semCourses) ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Courses',
              value: semCourses.length,
              icon: BookOpen,
              color: 'text-blue-600',
              bg: 'bg-blue-50',
            },
            {
              label: 'Avg Attendance',
              value: (() => {
                const percs = semCourses.map((c) => getCourseStats(c.id).attendancePerc);
                return percs.length
                  ? Math.round(percs.reduce((a, b) => a + b, 0) / percs.length) + '%'
                  : '—';
              })(),
              icon: Clock,
              color: 'text-green-600',
              bg: 'bg-green-50',
            },
            {
              label: 'Avg Marks',
              value: (() => {
                const avgs = semCourses
                  .map((c) => getCourseStats(c.id).avgMark)
                  .filter(Boolean);
                return avgs.length
                  ? Math.round(avgs.reduce((a, b) => a + b, 0) / avgs.length) + '%'
                  : '—';
              })(),
              icon: BarChart2,
              color: 'text-purple-600',
              bg: 'bg-purple-50',
            },
            {
              label: 'Pending Tasks',
              value: semCourses.reduce((sum, c) => sum + getCourseStats(c.id).pending, 0),
              icon: ClipboardList,
              color: 'text-orange-600',
              bg: 'bg-orange-50',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3"
            >
              <div className={`w-9 h-9 ${stat.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-lg font-bold text-gray-900 leading-tight">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Course Cards ── */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-xl">
            <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No courses found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your search, filter, or semester</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredCourses.map((course) => {
              const stats  = getCourseStats(course.id);
              const status = course.status ?? 'active';

              return (
                <div
                  key={course.id}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all group"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex items-center gap-2">
                        {course.semester && (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 text-white">
                            Sem {course.semester}
                          </span>
                        )}
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                            STATUS_COLORS[status] ?? STATUS_COLORS.active
                          }`}
                        >
                          {status}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-white font-semibold text-base leading-snug">{course.name}</h3>
                    <p className="text-blue-200 text-xs mt-1 font-mono">{course.code}</p>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-4">
                    <p className="text-gray-500 text-sm line-clamp-2">{course.description}</p>

                    {course.instructor && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{course.instructor}</span>
                      </div>
                    )}

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <div className="text-center">
                        <div className={`text-sm font-bold ${stats.attendancePerc >= 75 ? 'text-green-600' : 'text-red-500'}`}>
                          {stats.attendancePerc}%
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">Attendance</div>
                      </div>
                      <div className="text-center border-x border-gray-100">
                        <div className="text-sm font-bold text-purple-600">
                          {stats.avgMark > 0 ? `${stats.avgMark}%` : '—'}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">Avg Marks</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-sm font-bold ${stats.pending > 0 ? 'text-orange-500' : 'text-gray-400'}`}>
                          {stats.pending}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">Pending</div>
                      </div>
                    </div>

                    {/* Attendance Progress Bar */}
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Attendance</span>
                        <span>{stats.totalClasses} classes</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${stats.attendancePerc >= 75 ? 'bg-green-500' : 'bg-red-400'}`}
                          style={{ width: `${stats.attendancePerc}%` }}
                        />
                      </div>
                    </div>

                    {/* Quick Links */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => navigate('/student/attendance')}
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs text-gray-600 bg-gray-50 hover:bg-green-50 hover:text-green-700 py-2 rounded-lg transition-colors"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        Attendance
                      </button>
                      <button
                        onClick={() => navigate('/student/marks')}
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs text-gray-600 bg-gray-50 hover:bg-purple-50 hover:text-purple-700 py-2 rounded-lg transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Marks
                      </button>
                      <button
                        onClick={() => navigate('/student/assignments')}
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs text-gray-600 bg-gray-50 hover:bg-orange-50 hover:text-orange-700 py-2 rounded-lg transition-colors"
                      >
                        <ClipboardList className="w-3.5 h-3.5" />
                        Tasks
                      </button>
                    </div>

                    <button
                      onClick={() => navigate('/student/enrolled-courses')}
                      className="w-full flex items-center justify-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 py-2.5 rounded-lg transition-colors"
                    >
                      View Course Details
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};