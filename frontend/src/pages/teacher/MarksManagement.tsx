import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { Modal } from "../../components/Modal";
import { DataTable } from "../../components/DataTable";
import { GraduationCap, Plus, AlertCircle } from "lucide-react";
import {
  getTeacherCourses,
  getTeacherMarks,
  getClassStudents,
  addStudentMarks,
} from "../../api/teacherApi";

interface MarkRecord {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  examType: string;
  marks: number;
  totalMarks: number;
  date: string;
}

interface StudentType {
  id: string;
  name: string;
  rollNumber: string | null;
}

export const TeacherMarksManagement = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [students, setStudents] = useState<StudentType[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form Fields
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [examType, setExamType] = useState("");
  const [obtainedMarks, setObtainedMarks] = useState(0);
  const [totalMarks, setTotalMarks] = useState(100);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const coursesData = await getTeacherCourses();
      setCourses(coursesData);

      const marksData = await getTeacherMarks();
      
      // We will map records and resolve student/course names
      const mappedMarks = marksData.map((m: any) => {
        const matchedCourse = coursesData.find((c: any) => c.id === m.courseId);
        return {
          id: m.id,
          studentId: m.studentId,
          studentName: "Student Profile", // Fallback, we'll map actual names below
          courseId: m.courseId,
          courseName: matchedCourse ? matchedCourse.name : "Loaded Course",
          examType: m.examType,
          marks: m.marks,
          totalMarks: m.totalMarks,
          date: m.date,
        };
      });

      // To render student names, let's fetch students for each course represented in marks
      // or we can resolve it on demand. To be efficient:
      setMarks(mappedMarks);
    } catch (error) {
      console.error("Failed to load marks management data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Fetch students list when class selection changes in modal
  useEffect(() => {
    const fetchStudentsList = async () => {
      if (!selectedCourseId) {
        setStudents([]);
        return;
      }
      setIsLoadingStudents(true);
      try {
        const roster = await getClassStudents(selectedCourseId);
        setStudents(roster);
      } catch (error) {
        console.error("Failed to load course roster:", error);
      } finally {
        setIsLoadingStudents(false);
      }
    };
    fetchStudentsList();
  }, [selectedCourseId]);

  // Try to map student names to marks list once students are loaded/available
  const [resolvedMarks, setResolvedMarks] = useState<MarkRecord[]>([]);

  useEffect(() => {
    const resolveNames = async () => {
      // Resolve student name mapping from course rosters or adminUsers lookup
      // Since we don't have getAdminUsers here, we can fetch class students for teaching courses
      // and index them by id.
      try {
        const studentIndex: Record<string, string> = {};
        for (const course of courses) {
          const roster = await getClassStudents(course.id);
          roster.forEach((s: StudentType) => {
            studentIndex[s.id] = s.name;
          });
        }
        
        const mapped = marks.map((m) => ({
          ...m,
          studentName: studentIndex[m.studentId] || `Student ID: ...${m.studentId.substring(0, 5)}`,
        }));
        setResolvedMarks(mapped);
      } catch (err) {
        setResolvedMarks(marks);
      }
    };
    if (courses.length > 0 && marks.length > 0) {
      resolveNames();
    } else {
      setResolvedMarks([]);
    }
  }, [courses, marks]);

  const handleAddMarksSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId || !selectedStudentId || !examType || obtainedMarks === undefined || !totalMarks) return;

    if (obtainedMarks < 0 || obtainedMarks > totalMarks) {
      alert(`Obtained marks must be between 0 and ${totalMarks}`);
      return;
    }

    setIsSubmitting(true);
    try {
      await addStudentMarks({
        studentId: selectedStudentId,
        courseId: selectedCourseId,
        examType,
        marks: Number(obtainedMarks),
        totalMarks: Number(totalMarks),
      });

      alert("Exam marks added successfully.");
      setShowAddModal(false);
      resetForm();
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to add exam marks.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedCourseId("");
    setSelectedStudentId("");
    setExamType("");
    setObtainedMarks(0);
    setTotalMarks(100);
  };

  const columns = [
    {
      header: "Student",
      accessor: "studentName",
    },
    {
      header: "Course",
      accessor: "courseName",
    },
    {
      header: "Exam Type",
      accessor: "examType",
    },
    {
      header: "Marks",
      accessor: "marks",
      render: (value: number, row: any) => `${value}/${row.totalMarks}`,
    },
    {
      header: "Percentage",
      accessor: "percentage",
      render: (_: any, row: any) => {
        const percentage = Math.round((row.marks / row.totalMarks) * 100);
        return (
          <span
            className={`font-medium ${
              percentage >= 80 ? "text-green-600" : percentage >= 60 ? "text-yellow-600" : "text-red-600"
            }`}
          >
            {percentage}%
          </span>
        );
      },
    },
    {
      header: "Date",
      accessor: "date",
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Marks Management</h1>
            <p className="text-gray-600">Add and manage student exam and assessment marks</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            <span>Add Marks</span>
          </button>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <GraduationCap className="w-10 h-10 mb-2 opacity-80" />
          <p className="text-4xl font-bold">{marks.length}</p>
          <p className="text-sm opacity-90">Total Marks Entered</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Marks Records</h2>
          </div>
          {isLoading ? (
            <div className="p-8 text-center text-gray-500 text-sm">Loading marks log...</div>
          ) : resolvedMarks.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">No marks records entered yet.</div>
          ) : (
            <DataTable columns={columns} data={resolvedMarks} />
          )}
        </div>
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Student Marks">
        <form onSubmit={handleAddMarksSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
            <select
              required
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500"
            >
              <option value="">Select course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name} ({course.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
            <select
              required
              disabled={!selectedCourseId}
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100"
            >
              <option value="">Select student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} {student.rollNumber ? `(${student.rollNumber})` : ""}
                </option>
              ))}
            </select>
            {selectedCourseId && students.length === 0 && !isLoadingStudents && (
              <p className="text-xs text-red-500 mt-1">No students enrolled in this course.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Exam Type</label>
            <input
              type="text"
              required
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="e.g. Midterm, Quiz 1, Final Exam"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Marks Obtained</label>
              <input
                type="number"
                required
                min={0}
                value={obtainedMarks}
                onChange={(e) => setObtainedMarks(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total Marks</label>
              <input
                type="number"
                required
                min={1}
                value={totalMarks}
                onChange={(e) => setTotalMarks(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedStudentId}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Marks"}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
