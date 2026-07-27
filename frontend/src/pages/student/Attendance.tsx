import { useEffect, useState } from "react"
import { DashboardLayout } from "../../components/DashboardLayout"
import { useAuth } from "../../context/AuthContext"
import { getStudentAttendance, getStudentCourses } from "../../api/studentApi"
import { useSemester } from "../../hooks/useSemester"
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

// ── Per-course attendance card with expandable history ─────────────────────
const CourseAttendanceCard = ({
  course,
  records,
}: {
  course: { id: string; name: string; code: string; semester?: number }
  records: { date: string; status: string }[]
}) => {
  const [open, setOpen] = useState(false)

  const total = records.length
  const present = records.filter((r) => r.status === "present").length
  const absent = records.filter((r) => r.status === "absent").length
  const late = records.filter((r) => r.status === "late").length
  const perc = total > 0 ? Math.round((present / total) * 100) : 0
  const above70 = perc >= 70

  const THRESHOLD = 70
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* ── Header / summary row ── */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{course.name}</p>
            <p className="text-xs text-gray-400 font-mono">
              {course.code}
              {course.semester && (
                <span className="ml-2 font-medium text-blue-500">Sem {course.semester}</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-gray-400">Classes</p>
            <p className="text-sm font-semibold text-gray-700">{present} / {total}</p>
          </div>

          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 border-4 ${
              above70
                ? 'border-green-400 bg-green-50 text-green-700'
                : 'border-red-400 bg-red-50 text-red-600'
            }`}
          >
            <span className="text-sm font-bold">{perc}%</span>
          </div>

          {open ? (
            <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
          )}
        </div>
      </button>

      {/* ── Progress bar with 70% threshold line ── */}
      <div className="px-5 pb-4">
        <div className="relative w-full h-4 bg-gray-100 rounded-full overflow-visible">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              above70 ? 'bg-green-400' : 'bg-red-400'
            }`}
            style={{ width: `${perc}%` }}
          />
          <div
            className="absolute top-0 h-full flex flex-col items-center"
            style={{ left: `${THRESHOLD}%`, transform: 'translateX(-50%)' }}
          >
            <div className={`w-0.5 h-4 ${above70 ? 'bg-green-600' : 'bg-red-500'}`} />
            <span
              className={`mt-1 text-[10px] font-semibold whitespace-nowrap ${
                above70 ? 'text-green-600' : 'text-red-500'
              }`}
            >
              70%
            </span>
          </div>
        </div>

        <p className={`text-xs mt-3 font-medium ${above70 ? 'text-green-600' : 'text-red-500'}`}>
          {above70
            ? `✓ Good standing — ${perc}% attendance`
            : `✗ Below minimum — need ${70 - perc}% more to reach 70%`}
        </p>
      </div>

      {/* ── Expandable: stat pills + history ── */}
      {open && (
        <div className="border-t border-gray-100 px-5 py-4 space-y-4 bg-gray-50">
          <div className="flex gap-3 flex-wrap">
            {[
              { label: 'Present', value: present, color: 'bg-green-100 text-green-700' },
              { label: 'Absent',  value: absent,  color: 'bg-red-100 text-red-600' },
              { label: 'Late',    value: late,    color: 'bg-yellow-100 text-yellow-700' },
              { label: 'Total',   value: total,   color: 'bg-blue-100 text-blue-700' },
            ].map((s) => (
              <div
                key={s.label}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${s.color}`}
              >
                {s.label}: {s.value}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Attendance History
            </p>
            {records.length === 0 ? (
              <p className="text-sm text-gray-400">No records yet.</p>
            ) : (
              [...records]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((rec, i) => {
                  const statusMap = {
                    present: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50',  label: 'Present' },
                    absent:  { icon: XCircle,      color: 'text-red-600',   bg: 'bg-red-50',    label: 'Absent'  },
                    late:    { icon: Clock,         color: 'text-yellow-600',bg: 'bg-yellow-50', label: 'Late'    },
                  };
                  const cfg  = statusMap[rec.status as keyof typeof statusMap];
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-white border border-gray-100 rounded-lg px-4 py-2.5"
                    >
                      <span className="text-sm text-gray-700">
                        {new Date(rec.date).toLocaleDateString('en-US', {
                          weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
                        })}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                        {cfg.label}
                      </span>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Page ───────────────────────────────────────────────────────────────────
export const StudentAttendance = () => {
  const { user } = useAuth();
  const { selectedSem, SemesterDropdown } = useSemester();

  const [courses, setCourses] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const coursesData = await getStudentCourses()
        setCourses(coursesData)

        const attendanceData = await getStudentAttendance()
        setAttendance(attendanceData)
      } catch (error) {
        console.error("Failed to load attendance:", error)
      }
    }

    loadData()
  }, [])

  const studentAttendance = attendance;
  // ── Semester filter ────────────────────────────────────────────────────
  const allEnrolled  = courses.filter((c) => user?.enrolledCourses?.includes(c.id));
  const semCourses   = allEnrolled.filter((c) => selectedSem === 'all' || c.semester === selectedSem);
  const semAttendance = studentAttendance.filter((a) => semCourses.some((c) => c.id === a.course_id));

  // ── Stats (scoped to selected semester) ───────────────────────────────
  const total      = semAttendance.length;
  const present    = semAttendance.filter((a) => a.status === 'present').length;
  const absent     = semAttendance.filter((a) => a.status === 'absent').length;
  const late       = semAttendance.filter((a) => a.status === 'late').length;
  const overallPerc = total > 0 ? Math.round((present / total) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* ── Header + Semester Dropdown ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Attendance</h1>
            <p className="text-gray-600">Track your class attendance per course</p>
          </div>
          <SemesterDropdown />
        </div>

        {/* ── Overall stat cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Overall', value: `${overallPerc}%`, icon: Calendar,     from: 'from-blue-500',   to: 'to-blue-600',   sub: `${present} of ${total} classes` },
            { label: 'Present', value: present,           icon: CheckCircle2, from: 'from-green-500',  to: 'to-green-600',  sub: 'Classes attended' },
            { label: 'Absent',  value: absent,            icon: XCircle,      from: 'from-red-500',    to: 'to-red-600',    sub: 'Classes missed' },
            { label: 'Late',    value: late,              icon: Clock,        from: 'from-yellow-500', to: 'to-yellow-600', sub: 'Arrived late' },
          ].map((s) => (
            <div
              key={s.label}
              className={`bg-gradient-to-br ${s.from} ${s.to} rounded-xl p-5 text-white shadow-md`}
            >
              <s.icon className="w-7 h-7 mb-2 opacity-80" />
              <p className="text-xs font-medium opacity-80">{s.label}</p>
              <p className="text-3xl font-bold mt-0.5">{s.value}</p>
              <p className="text-xs mt-1 opacity-70">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Course-wise dropdowns ── */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Course-wise Attendance</h2>
          <div className="space-y-4">
            {semCourses.length === 0 ? (
              <p className="text-gray-400 text-sm">
                {selectedSem === 'all' ? 'No courses enrolled.' : `No courses for Semester ${selectedSem}.`}
              </p>
            ) : (
              semCourses.map((course) => (
                <CourseAttendanceCard
                  key={course.id}
                  course={course}
                  records={studentAttendance.filter((a) => a.course_id === course.id)}                />
              ))
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};