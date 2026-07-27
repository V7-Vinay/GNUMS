import { useEffect, useState } from "react";
import {
  GraduationCap,
  Mail,
  BookOpen,
  Shield,
  Hash,
  UserCircle,
  BookMarked,
  GitBranch,
  Layers,
  Users,
} from "lucide-react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { useAuth } from "../../context/AuthContext";

import {
  getStudentCourses,
  getStudentMarks,
  getStudentAttendance,
} from "../../api/studentApi";

const Field = ({
  icon: Icon,
  label,
  value,
  iconColor = "text-gray-400",
}: {
  icon: React.ElementType;
  label: string;
  value?: string | number | null;
  iconColor?: string;
}) => (
  <div className="flex flex-col gap-1">
    <span className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
      <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
      {label}
    </span>
    <span className="text-sm font-semibold text-gray-800">{value ?? "—"}</span>
  </div>
);

const Section = ({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 px-1">
      <Icon className="w-5 h-5 text-gray-500" />
      <h2 className="text-base font-bold text-gray-800">{title}</h2>
    </div>
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      {children}
    </div>
  </div>
);

export const StudentProfile = () => {
  const { user } = useAuth();

  const [courses, setCourses] = useState<any[]>([]);
  const [marks, setMarks] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const coursesData = await getStudentCourses();
        setCourses(coursesData);

        const marksData = await getStudentMarks();
        setMarks(marksData);

        const attendanceData = await getStudentAttendance();
        setAttendance(attendanceData);
      } catch (err) {
        console.error("Profile load error:", err);
      }
    };

    loadData();
  }, []);

  const enrolledCourses = courses;

  const studentAttendance = attendance;
  const present = studentAttendance.filter((a) => a.status === "present").length;

  const attendancePerc =
    studentAttendance.length > 0
      ? Math.round((present / studentAttendance.length) * 100)
      : 0;

  const studentMarks = marks;

  const avgMarks =
    studentMarks.length > 0
      ? Math.round(
          studentMarks.reduce(
            (sum, m) => sum + (m.marks / m.total_marks) * 100,
            0
          ) / studentMarks.length
        )
      : 0;

  const initials = (user?.name ?? "S")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-5 pb-10">

        {/* Hero */}
        <div className="rounded-2xl overflow-hidden shadow-md">
          <div className="bg-gray-900 px-6 pt-10 pb-14 flex flex-col items-center gap-3">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-white/20 shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-blue-600 flex items-center justify-center border-4 border-white/20 shadow-lg">
                <span className="text-3xl font-bold text-white">{initials}</span>
              </div>
            )}

            <div className="text-center">
              <h1 className="text-xl font-bold text-white">{user?.name}</h1>
              <span className="mt-2 inline-block px-5 py-1 rounded-full text-xs font-semibold bg-amber-400 text-amber-900">
                Active
              </span>
            </div>
          </div>
          <div className="bg-gray-50 h-5 rounded-t-3xl -mt-5" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Courses",
              value: enrolledCourses.length,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              label: "Attendance",
              value: `${attendancePerc}%`,
              color: "text-green-600",
              bg: "bg-green-50",
            },
            {
              label: "Avg Marks",
              value: `${avgMarks}%`,
              color: "text-purple-600",
              bg: "bg-purple-50",
            },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4 text-center`}>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Education */}
        <Section icon={GraduationCap} title="Education Details">
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <Field icon={GitBranch} label="Branch" value={user?.branch} iconColor="text-blue-500" />
            <Field icon={Hash} label="Roll No." value={user?.rollNo} iconColor="text-blue-500" />
            <Field icon={Layers} label="Semester" value={user?.semester} iconColor="text-blue-500" />
            <Field icon={Users} label="Section" value={user?.section} iconColor="text-blue-500" />
          </div>
        </Section>

        {/* Account */}
        <Section icon={Shield} title="Account Info">
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <Field icon={Hash} label="Student ID" value={user?.id} iconColor="text-purple-500" />
            <Field
              icon={UserCircle}
              label="Role"
              value={user?.role ? user.role : "Student"}
              iconColor="text-purple-500"
            />
            <div className="col-span-2">
              <Field icon={Mail} label="Email" value={user?.email} iconColor="text-teal-500" />
            </div>
          </div>
        </Section>

        {/* Courses */}
        <Section icon={BookMarked} title="Enrolled Courses">
          {enrolledCourses.length === 0 ? (
            <p className="text-sm text-gray-400">No courses enrolled.</p>
          ) : (
            <div className="space-y-3">
              {enrolledCourses.map((course) => {
                const ca = studentAttendance.filter(
                  (a) => a.course_id === course.id
                );

                const cp = ca.filter((a) => a.status === "present").length;

                const cap =
                  ca.length > 0 ? Math.round((cp / ca.length) * 100) : 0;

                const cm = studentMarks.filter(
                  (m) => m.course_id === course.id
                );

                const cavg =
                  cm.length > 0
                    ? Math.round(
                        cm.reduce(
                          (s, m) => s + (m.marks / m.total_marks) * 100,
                          0
                        ) / cm.length
                      )
                    : null;

                return (
                  <div
                    key={course.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {course.name}
                        </p>
                        <p className="text-xs text-gray-400 font-mono">
                          {course.code}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <p
                          className={`text-sm font-bold ${
                            cap >= 75 ? "text-green-600" : "text-red-500"
                          }`}
                        >
                          {cap}%
                        </p>
                        <p className="text-xs text-gray-400">Attend.</p>
                      </div>

                      <div>
                        <p className="text-sm font-bold text-purple-600">
                          {cavg !== null ? `${cavg}%` : "—"}
                        </p>
                        <p className="text-xs text-gray-400">Marks</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Section>

      </div>
    </DashboardLayout>
  );
};