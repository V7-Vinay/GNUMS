import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { Modal } from "../../components/Modal";
import { useAuth } from "../../context/AuthContext";
import { ClipboardList, Plus, Calendar, Users, Award, Download, CheckCircle, FileText } from "lucide-react";
import {
  getTeacherCourses,
  getTeacherAssignments,
  getTeacherSubmissions,
  createTeacherAssignment,
  gradeStudentSubmission,
  getAssignmentSubmissions,
} from "../../api/teacherApi";

interface AssignmentType {
  id: string;
  title: string;
  description: string;
  due_date: string;
  max_marks: number;
  class_id: string;
  classes?: {
    name: string;
    code: string;
  };
}

interface SubmissionType {
  id: string;
  studentId: string;
  studentName: string;
  assignmentTitle: string;
  courseCode: string;
  submittedDate: string;
  marks?: number;
  feedback?: string;
  fileUrl: string;
  submission_text?: string;
}

export const TeacherAssignmentManagement = () => {
  const { user } = useAuth();
  
  const [courses, setCourses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<AssignmentType[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingAssignment, setViewingAssignment] = useState<AssignmentType | null>(null);
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [gradingSubmissions, setGradingSubmissions] = useState<any[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);

  // Form Fields - Create Assignment
  const [selectedCourse, setSelectedCourse] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [maxMarks, setMaxMarks] = useState(100);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields - Grading
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [gradeMarks, setGradeMarks] = useState(0);
  const [gradeFeedback, setGradeFeedback] = useState("");
  const [isSubmittingGrade, setIsSubmittingGrade] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [coursesData, assignmentsData, submissionsData] = await Promise.all([
        getTeacherCourses(),
        getTeacherAssignments(),
        getTeacherSubmissions(),
      ]);
      setCourses(coursesData);
      
      const formattedAssignments = assignmentsData.map((a: any) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        due_date: a.due_date,
        max_marks: a.max_marks,
        class_id: a.class_id,
        classes: a.classes,
      }));
      setAssignments(formattedAssignments);
      setSubmissions(submissionsData);
    } catch (error) {
      console.error("Failed to load assignment data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !title || !dueDate || !maxMarks) return;

    setIsSubmitting(true);
    try {
      await createTeacherAssignment({
        title,
        description,
        classId: selectedCourse,
        dueDate: new Date(dueDate).toISOString(),
        maxMarks: Number(maxMarks),
      });

      alert("Assignment created successfully.");
      setShowCreateModal(false);
      resetCreateForm();
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to create assignment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenGradingView = async (assignment: AssignmentType) => {
    setViewingAssignment(assignment);
    setIsLoadingSubmissions(true);
    setShowGradingModal(true);
    try {
      const subs = await getAssignmentSubmissions(assignment.id);
      
      const mapped = subs.map((s: any) => ({
        id: s.id,
        fileUrl: s.file_url,
        submissionText: s.submission_text,
        submittedDate: s.submitted_at,
        marks: s.marks_obtained,
        feedback: s.feedback,
        studentName: s.student ? `${s.student.first_name} ${s.student.last_name}` : "Unknown Student",
      }));
      setGradingSubmissions(mapped);
    } catch (error) {
      console.error("Failed to load submissions for grading:", error);
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  const startGradingSubmission = (sub: any) => {
    setSelectedSubmission(sub);
    setGradeMarks(sub.marks || 0);
    setGradeFeedback(sub.feedback || "");
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission || !viewingAssignment) return;

    if (gradeMarks < 0 || gradeMarks > viewingAssignment.max_marks) {
      alert(`Marks must be between 0 and ${viewingAssignment.max_marks}`);
      return;
    }

    setIsSubmittingGrade(true);
    try {
      await gradeStudentSubmission(selectedSubmission.id, {
        marks: gradeMarks,
        feedback: gradeFeedback,
      });

      alert("Submission graded successfully.");
      setSelectedSubmission(null);
      // Re-fetch submissions
      if (viewingAssignment) {
        handleOpenGradingView(viewingAssignment);
      }
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to submit grade.");
    } finally {
      setIsSubmittingGrade(false);
    }
  };

  const resetCreateForm = () => {
    setSelectedCourse("");
    setTitle("");
    setDescription("");
    setDueDate("");
    setMaxMarks(100);
  };

  const activeAssignments = assignments.filter((a) => new Date(a.due_date) > new Date());

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Assignment Management</h1>
            <p className="text-gray-600">Create, view, and grade student assignments</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            <span>Create Assignment</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <ClipboardList className="w-8 h-8 text-blue-600 mb-2" />
            <p className="text-3xl font-bold text-gray-900">{assignments.length}</p>
            <p className="text-sm text-gray-600">Total Assignments</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Users className="w-8 h-8 text-green-600 mb-2" />
            <p className="text-3xl font-bold text-gray-900">{submissions.length}</p>
            <p className="text-sm text-gray-600">Total Submissions</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Calendar className="w-8 h-8 text-purple-600 mb-2" />
            <p className="text-3xl font-bold text-gray-900">{activeAssignments.length}</p>
            <p className="text-sm text-gray-600">Active Assignments</p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading assignments registry...</div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No assignments created yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignments.map((assignment) => {
              const course = courses.find((c) => c.id === assignment.class_id);
              const assignmentSubs = submissions.filter((s) => s.assignmentId === assignment.id);
              const submissionCount = assignmentSubs.length;
              const totalStudents = course?.studentIds?.length || 0;

              return (
                <div
                  key={assignment.id}
                  onClick={() => handleOpenGradingView(assignment)}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{assignment.title}</h3>
                        <p className="text-xs text-gray-500">{course ? course.name : "Class Assigned"}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{assignment.description}</p>
                  </div>
                  <div className="space-y-2 border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Due Date:</span>
                      <span className="font-medium">{new Date(assignment.due_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Submissions:</span>
                      <span className="font-medium">
                        {submissionCount}/{totalStudents}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${totalStudents > 0 ? (submissionCount / totalStudents) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Assignment Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Assignment">
        <form onSubmit={handleCreateAssignmentSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
            <select
              required
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="e.g. Midterm Lab Assignment"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
              rows={3}
              placeholder="Provide assignment guidelines and submission instructions..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Marks</label>
              <input
                type="number"
                required
                min={1}
                value={maxMarks}
                onChange={(e) => setMaxMarks(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Assignment"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Submissions & Grading Modal */}
      <Modal
        isOpen={showGradingModal}
        onClose={() => {
          setShowGradingModal(false);
          setSelectedSubmission(null);
        }}
        title={`Submissions for "${viewingAssignment?.title}"`}
      >
        <div className="space-y-4 max-h-[75vh] overflow-y-auto">
          {isLoadingSubmissions ? (
            <div className="text-center text-sm text-gray-500 py-6">Loading submissions roster...</div>
          ) : gradingSubmissions.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-6">No submissions received for this assignment yet.</p>
          ) : (
            <div className="space-y-4">
              <div className="divide-y divide-gray-100 border rounded-lg bg-gray-50/50">
                {gradingSubmissions.map((sub) => (
                  <div key={sub.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="font-semibold text-sm text-gray-900">{sub.studentName}</p>
                      <p className="text-xs text-gray-500">
                        Submitted: {new Date(sub.submittedDate).toLocaleString()}
                      </p>
                      {sub.submissionText && (
                        <div className="text-xs bg-white p-2 rounded border text-gray-700 max-w-md">
                          <strong>Note:</strong> {sub.submissionText}
                        </div>
                      )}
                      {sub.fileUrl && (
                        <a
                          href={sub.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs text-blue-600 hover:underline bg-white px-2.5 py-1.5 border rounded mt-1 font-medium"
                        >
                          <Download className="w-3.5 h-3.5 mr-1" />
                          Download Submitted File
                        </a>
                      )}
                    </div>
                    
                    <div className="text-right flex items-center space-x-3 self-end md:self-center">
                      <div>
                        {sub.marks !== null ? (
                          <span className="inline-flex items-center bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-full font-bold">
                            <CheckCircle className="w-3.5 h-3.5 mr-1" />
                            Graded: {sub.marks}/{viewingAssignment?.max_marks}
                          </span>
                        ) : (
                          <span className="inline-flex items-center bg-amber-50 text-amber-700 text-xs px-2.5 py-1 rounded-full font-bold">
                            Pending Grade
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => startGradingSubmission(sub)}
                        className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm"
                      >
                        {sub.marks !== null ? "Re-grade" : "Grade"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {selectedSubmission && (
                <form onSubmit={handleGradeSubmit} className="border-t border-gray-200 pt-4 space-y-3 bg-blue-50/50 p-4 rounded-lg border">
                  <h4 className="font-bold text-sm text-blue-900">Grading: {selectedSubmission.studentName}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Score obtained (Max: {viewingAssignment?.max_marks})
                      </label>
                      <input
                        type="number"
                        required
                        min={0}
                        max={viewingAssignment?.max_marks}
                        value={gradeMarks}
                        onChange={(e) => setGradeMarks(Number(e.target.value))}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Feedback</label>
                    <textarea
                      value={gradeFeedback}
                      onChange={(e) => setGradeFeedback(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm bg-white"
                      rows={2}
                      placeholder="Add grading notes or recommendations..."
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedSubmission(null)}
                      className="px-3 py-1 text-xs border rounded bg-white text-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingGrade}
                      className="bg-green-600 hover:bg-green-700 text-white px-3.5 py-1 text-xs font-semibold rounded"
                    >
                      {isSubmittingGrade ? "Saving Grade..." : "Submit Grade"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </Modal>
    </DashboardLayout>
  );
};
