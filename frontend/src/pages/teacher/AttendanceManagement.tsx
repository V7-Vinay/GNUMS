import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { Modal } from "../../components/Modal";
import { DataTable } from "../../components/DataTable";
import { Calendar, Plus, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import {
  getTeacherCourses,
  getTeacherAttendance,
  getClassStudents,
  markTeacherAttendance,
} from "../../api/teacherApi";

interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  date: string;
  status: "present" | "absent" | "late";
}

interface StudentRoster {
  id: string;
  name: string;
  rollNumber: string | null;
}

export const TeacherAttendanceManagement = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [students, setStudents] = useState<StudentRoster[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0]);
  const [markingRecords, setMarkingRecords] = useState<Record<string, "present" | "absent" | "late">>({});

  const loadData = async () => {
    setIsLoading(true);
    try {
      const coursesData = await getTeacherCourses();
      setCourses(coursesData);

      const attendanceData = await getTeacherAttendance();
      // Map database attendance records to match the table format
      const formattedAttendance = attendanceData.map((a: any) => ({
        id: a.id,
        studentId: a.student_id,
        studentName: a.student ? `${a.student.first_name} ${a.student.last_name}` : "Unknown Student",
        courseId: a.class_id,
        courseName: a.classes?.name || "Unknown Course",
        date: a.date,
        status: a.status,
      }));
      setAttendance(formattedAttendance);
    } catch (error) {
      console.error("Failed to load attendance management data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Fetch students roster when a course is chosen in the modal
  useEffect(() => {
    const fetchRoster = async () => {
      if (!selectedCourse) {
        setStudents([]);
        return;
      }
      setIsLoadingStudents(true);
      try {
        const roster = await getClassStudents(selectedCourse);
        setStudents(roster);
        
        // Pre-fill marking record states with 'present'
        const initialStates: Record<string, "present" | "absent" | "late"> = {};
        roster.forEach((student: StudentRoster) => {
          initialStates[student.id] = "present";
        });
        setMarkingRecords(initialStates);
      } catch (error) {
        console.error("Failed to load classroom roster:", error);
      } finally {
        setIsLoadingStudents(false);
      }
    };
    fetchRoster();
  }, [selectedCourse]);

  const handleStatusChange = (studentId: string, status: "present" | "absent" | "late") => {
    setMarkingRecords((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleMarkAttendanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !attendanceDate || students.length === 0) return;

    setIsSubmitting(true);
    try {
      const recordsPayload = students.map((s) => ({
        studentId: s.id,
        status: markingRecords[s.id] || "present",
      }));

      await markTeacherAttendance({
        classId: selectedCourse,
        date: attendanceDate,
        records: recordsPayload,
      });

      alert("Attendance marked successfully.");
      setShowMarkModal(false);
      setSelectedCourse("");
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to mark attendance.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      header: "Student Name",
      accessor: "studentName",
    },
    {
      header: "Course",
      accessor: "courseName",
    },
    {
      header: "Date",
      accessor: "date",
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      header: "Status",
      accessor: "status",
      render: (value: string) => {
        const config = {
          present: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
          absent: { icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
          late: { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
        };
        const active = config[value as keyof typeof config] || config.present;
        const Icon = active.icon;
        return (
          <span
            className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${active.bg} ${active.color}`}
          >
            <Icon className="w-4 h-4" />
            <span className="capitalize">{value}</span>
          </span>
        );
      },
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Attendance Management</h1>
            <p className="text-gray-600">Mark and manage student attendance</p>
          </div>
          <button
            onClick={() => setShowMarkModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            <span>Mark Attendance</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Calendar className="w-8 h-8 text-blue-600 mb-2" />
            <p className="text-3xl font-bold text-gray-900">{attendance.length}</p>
            <p className="text-sm text-gray-600">Total Records</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <CheckCircle2 className="w-8 h-8 text-green-600 mb-2" />
            <p className="text-3xl font-bold text-gray-900">
              {attendance.filter((a) => a.status === "present").length}
            </p>
            <p className="text-sm text-gray-600">Present</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <XCircle className="w-8 h-8 text-red-600 mb-2" />
            <p className="text-3xl font-bold text-gray-900">
              {attendance.filter((a) => a.status === "absent").length}
            </p>
            <p className="text-sm text-gray-600">Absent</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Attendance Records</h2>
          </div>
          {isLoading ? (
            <div className="p-8 text-center text-gray-500 text-sm">Loading attendance registry...</div>
          ) : attendance.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">No attendance records found.</div>
          ) : (
            <DataTable columns={columns} data={attendance} />
          )}
        </div>
      </div>

      {/* Mark Attendance Modal */}
      <Modal isOpen={showMarkModal} onClose={() => setShowMarkModal(false)} title="Mark Classroom Attendance">
        <form onSubmit={handleMarkAttendanceSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Course</label>
            <select
              required
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500"
            >
              <option value="">Choose a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name} ({course.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              required
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          {selectedCourse && (
            <div className="border-t border-gray-200 pt-4 space-y-4">
              <h4 className="font-semibold text-sm text-gray-900">Student Attendance List</h4>
              
              {isLoadingStudents ? (
                <div className="text-center text-sm text-gray-500 py-4">Fetching roster...</div>
              ) : students.length === 0 ? (
                <div className="flex items-center text-amber-600 text-sm bg-amber-50 p-3 rounded-lg">
                  <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
                  <span>No students are enrolled in this class yet. Enrolments can be managed by the Admin.</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                    >
                      <div>
                        <p className="font-medium text-sm text-gray-900">{student.name}</p>
                        {student.rollNumber && (
                          <p className="text-xs text-gray-500">Roll: {student.rollNumber}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name={`status-${student.id}`}
                            value="present"
                            checked={markingRecords[student.id] === "present"}
                            onChange={() => handleStatusChange(student.id, "present")}
                            className="text-blue-600 focus:ring-blue-500 h-4 w-4 border-gray-300"
                          />
                          <span className="ml-1 text-xs text-gray-700">Present</span>
                        </label>
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name={`status-${student.id}`}
                            value="absent"
                            checked={markingRecords[student.id] === "absent"}
                            onChange={() => handleStatusChange(student.id, "absent")}
                            className="text-red-600 focus:ring-red-500 h-4 w-4 border-gray-300"
                          />
                          <span className="ml-1 text-xs text-gray-700">Absent</span>
                        </label>
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name={`status-${student.id}`}
                            value="late"
                            checked={markingRecords[student.id] === "late"}
                            onChange={() => handleStatusChange(student.id, "late")}
                            className="text-yellow-600 focus:ring-yellow-500 h-4 w-4 border-gray-300"
                          />
                          <span className="ml-1 text-xs text-gray-700">Late</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowMarkModal(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || students.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Attendance"}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
