import { useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Modal } from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';
import { useEffect } from 'react';
import {
  getStudentAssignments,
  getStudentCourses,
  submitAssignment
} from '../../api/studentApi';
import { useSemester } from '../../hooks/useSemester';
import { ClipboardList, Clock, CheckCircle, Upload, Calendar } from 'lucide-react';

export const StudentAssignments = () => {
  const { user } = useAuth();
  const { selectedSem, SemesterDropdown } = useSemester();

  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
const [courses, setCourses] = useState<any[]>([]);
const [assignments, setAssignments] = useState<any[]>([]);
  // ── Semester filter: only courses in selected sem ──────────────────────
  const allEnrolled = courses.filter((c) => user?.enrolledCourses?.includes(c.id));
  const semCourses  = allEnrolled.filter((c) => selectedSem === 'all' || c.semester === selectedSem);
  const semCourseIds = semCourses.map((c) => c.id);
  useEffect(() => {

  const loadData = async () => {

    try {

      const coursesData = await getStudentCourses();
      setCourses(coursesData);

      const assignmentsData = await getStudentAssignments();
      setAssignments(assignmentsData);

    } catch (error) {
      console.error("Failed to load assignments:", error);
    }

  };

  loadData();

}, []);
  // ── All assignments for those courses ──────────────────────────────────
  const studentAssignments = assignments.filter((a) => semCourseIds.includes(a.course_id));

 const pendingAssignments = studentAssignments.filter(
  (a) => new Date(a.due_date) > new Date()
);

  const submittedAssignments = studentAssignments.filter((a) =>
    a.submissions?.some((s) => s.studentId === user?.id)
  );

  const overdueAssignments = studentAssignments.filter((a) => {
    const hasSubmitted = a.submissions?.some((s) => s.studentId === user?.id);
    return !hasSubmitted && new Date(a.due_date) < new Date();
  });

  const handleSubmit = async (e: React.FormEvent) => {

  e.preventDefault();

  if (!selectedFile || !selectedAssignment) return;

  try {

    const formData = new FormData();

    formData.append("file", selectedFile);
    formData.append("assignmentId", selectedAssignment.id);

    await submitAssignment(formData);

    alert("Assignment submitted successfully");

    setShowSubmitModal(false);
    setSelectedFile(null);

  } catch (error) {
    console.error("Submission failed:", error);
  }

};

  const AssignmentCard = ({
    assignment,
    status,
  }: {
    assignment: any;
    status: 'pending' | 'submitted' | 'overdue';
  }) => {
    const course = courses.find((c) => c.id === assignment.course_id);
    const teacher = { name: "Instructor" };
    const submission = assignment.submissions?.find((s: any) => s.studentId === user?.id);
    const daysLeft = Math.ceil(
      (new Date(assignment.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    const statusConfig = {
      pending: {
        color: 'border-yellow-200 bg-yellow-50',
        badge: 'bg-yellow-100 text-yellow-700',
        icon: Clock,
        iconColor: 'text-yellow-600',
      },
      submitted: {
        color: 'border-green-200 bg-green-50',
        badge: 'bg-green-100 text-green-700',
        icon: CheckCircle,
        iconColor: 'text-green-600',
      },
      overdue: {
        color: 'border-red-200 bg-red-50',
        badge: 'bg-red-100 text-red-700',
        icon: Clock,
        iconColor: 'text-red-600',
      },
    };

    const config = statusConfig[status];
    const StatusIcon = config.icon;

    return (
      <div className={`bg-white rounded-lg shadow-sm border-2 ${config.color} p-5`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{assignment.title}</h3>
            <p className="text-xs text-gray-500">
              {course?.name} • {teacher?.name}
              {course?.semester && (
                <span className="ml-2 font-medium text-blue-500">Sem {course.semester}</span>
              )}
            </p>
          </div>
          <StatusIcon className={`w-5 h-5 ${config.iconColor}`} />
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{assignment.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-xs text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
            {status === 'pending' && daysLeft > 0 && (
              <span className={`ml-auto ${config.badge} px-2 py-0.5 rounded font-medium`}>
                {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
              </span>
            )}
          </div>
          <div className="flex items-center text-xs text-gray-600">
            <ClipboardList className="w-4 h-4 mr-2" />
            <span>Max Marks: {assignment.max_marks ?? assignment.maxMarks}</span>
          </div>
        </div>

        {status === 'submitted' && submission && (
          <div className="bg-white rounded border border-gray-200 p-3 mb-4">
            <p className="text-xs text-gray-600 mb-1">
              Submitted on: {new Date(submission.submittedDate).toLocaleDateString()}
            </p>
            {submission.marks !== undefined && (
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-600">Marks:</span>
                <span className="text-sm font-bold text-green-600">
                  {submission.marks} / {assignment.max_marks ?? assignment.maxMarks}
                </span>
              </div>
            )}
            {submission.feedback && (
              <p className="text-xs text-gray-600 mt-2">
                <strong>Feedback:</strong> {submission.feedback}
              </p>
            )}
          </div>
        )}

        {status === 'pending' && (
          <button
            onClick={() => {
              setSelectedAssignment(assignment);
              setShowSubmitModal(true);
            }}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span className="text-sm font-medium">Submit Assignment</span>
          </button>
        )}

        {status === 'overdue' && (
          <button
            disabled
            className="w-full bg-gray-300 text-gray-600 py-2 px-4 rounded-lg cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <span className="text-sm font-medium">Overdue</span>
          </button>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* ── Header + Semester Dropdown ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Assignments</h1>
            <p className="text-gray-600">Manage and submit your assignments</p>
          </div>
          <SemesterDropdown />
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
            <Clock className="w-8 h-8 mb-2 opacity-80" />
            <p className="text-3xl font-bold">{pendingAssignments.length}</p>
            <p className="text-sm opacity-90">Pending</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <CheckCircle className="w-8 h-8 mb-2 opacity-80" />
            <p className="text-3xl font-bold">{submittedAssignments.length}</p>
            <p className="text-sm opacity-90">Submitted</p>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
            <Clock className="w-8 h-8 mb-2 opacity-80" />
            <p className="text-3xl font-bold">{overdueAssignments.length}</p>
            <p className="text-sm opacity-90">Overdue</p>
          </div>
        </div>

        {/* ── Pending ── */}
        {pendingAssignments.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Assignments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingAssignments.map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} status="pending" />
              ))}
            </div>
          </div>
        )}

        {/* ── Submitted ── */}
        {submittedAssignments.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Submitted Assignments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {submittedAssignments.map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} status="submitted" />
              ))}
            </div>
          </div>
        )}

        {/* ── Overdue ── */}
        {overdueAssignments.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Overdue Assignments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {overdueAssignments.map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} status="overdue" />
              ))}
            </div>
          </div>
        )}

        {/* ── Empty state ── */}
        {studentAssignments.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments yet</h3>
            <p className="text-gray-600">
              {selectedSem === 'all'
                ? 'Assignments will appear here once posted by your teachers'
                : `No assignments found for Semester ${selectedSem}`}
            </p>
          </div>
        )}
      </div>

      {/* ── Submit Modal ── */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => {
          setShowSubmitModal(false);
          setSelectedFile(null);
        }}
        title="Submit Assignment"
        footer={
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowSubmitModal(false);
                setSelectedFile(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedFile}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit
            </button>
          </div>
        }
      >
        {selectedAssignment && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900">{selectedAssignment.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{selectedAssignment.description}</p>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload your work
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-2">
                  {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                </p>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  Browse files
                </label>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};