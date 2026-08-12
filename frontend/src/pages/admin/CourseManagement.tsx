import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { Modal } from "../../components/Modal";
import { BookOpen, Plus, CreditCard as Edit, Trash2, Users, UserPlus } from "lucide-react";
import {
  getAdminClasses,
  createAdminClass,
  updateAdminClass,
  deleteAdminClass,
  getAdminUsers,
  enrollAdminStudent,
} from "../../api/adminApi";

interface ClassType {
  id: string;
  code: string;
  name: string;
  description: string;
  teacherId?: string;
  teacher?: {
    id: string;
    name: string;
    email: string;
  } | null;
  studentIds: string[];
}

interface UserType {
  id: string;
  name: string;
  role: string;
}

export const AdminCourseManagement = () => {
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [teachers, setTeachers] = useState<UserType[]>([]);
  const [students, setStudents] = useState<UserType[]>([]);
  
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [classesError, setClassesError] = useState("");
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassType | null>(null);
  const [selectedClassForEnroll, setSelectedClassForEnroll] = useState<ClassType | null>(null);

  // Form Fields
  const [className, setClassName] = useState("");
  const [classCode, setClassCode] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [isSubmittingClass, setIsSubmittingClass] = useState(false);
  const [isSubmittingEnroll, setIsSubmittingEnroll] = useState(false);

  const loadData = async () => {
    setIsLoadingClasses(true);
    try {
      const classesData = await getAdminClasses();
      setClasses(classesData);

      const usersData = await getAdminUsers();
      setTeachers(usersData.filter((u: any) => u.role === "teacher"));
      setStudents(usersData.filter((u: any) => u.role === "student"));
    } catch (err: any) {
      setClassesError(err.response?.data?.message || "Failed to load course details.");
    } finally {
      setIsLoadingClasses(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddOrEditClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingClass(true);
    try {
      if (editingClass) {
        await updateAdminClass(editingClass.id, {
          code: classCode,
          name: className,
          description,
          teacherId: selectedTeacherId || null,
        });
        alert("Class updated successfully.");
      } else {
        await createAdminClass({
          code: classCode,
          name: className,
          description,
          teacherId: selectedTeacherId || null,
        });
        alert("Class created successfully.");
      }

      setShowAddModal(false);
      setEditingClass(null);
      resetClassForm();
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save class.");
    } finally {
      setIsSubmittingClass(false);
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this course/class? All attendance, assignments and grades will be deleted permanently.")) return;
    try {
      await deleteAdminClass(id);
      alert("Class deleted successfully.");
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete class.");
    }
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassForEnroll || !selectedStudentId) return;

    setIsSubmittingEnroll(true);
    try {
      await enrollAdminStudent({
        classId: selectedClassForEnroll.id,
        studentId: selectedStudentId,
      });

      alert("Student enrolled successfully.");
      setShowEnrollModal(false);
      setSelectedStudentId("");
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Student is already enrolled or failed to enroll.");
    } finally {
      setIsSubmittingEnroll(false);
    }
  };

  const openAddModal = () => {
    setEditingClass(null);
    resetClassForm();
    setShowAddModal(true);
  };

  const openEditModal = (c: ClassType) => {
    setEditingClass(c);
    setClassName(c.name);
    setClassCode(c.code);
    setDescription(c.description);
    setSelectedTeacherId(c.teacherId || "");
    setShowAddModal(true);
  };

  const openEnrollModal = (c: ClassType) => {
    setSelectedClassForEnroll(c);
    setSelectedStudentId("");
    setShowEnrollModal(true);
  };

  const resetClassForm = () => {
    setClassName("");
    setClassCode("");
    setDescription("");
    setSelectedTeacherId("");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Course Management</h1>
            <p className="text-gray-600">Manage all courses and student enrollments in the system</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            <span>Add Course</span>
          </button>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <BookOpen className="w-10 h-10 mb-2 opacity-80" />
          <p className="text-4xl font-bold">{classes.length}</p>
          <p className="text-sm opacity-90">Total Courses</p>
        </div>

        {isLoadingClasses ? (
          <div className="text-center py-12 text-gray-500">Loading system courses...</div>
        ) : classesError ? (
          <div className="text-center py-12 text-red-500">{classesError}</div>
        ) : classes.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No courses defined in the system yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => openEnrollModal(course)}
                        className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded"
                        title="Enroll Student"
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(course)}
                        className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                        title="Edit Course"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClass(course.id)}
                        className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                        title="Delete Course"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-gray-500">{course.code}</span>
                  <h3 className="font-semibold text-gray-900 mt-1 mb-2">{course.name}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                </div>
                <div className="space-y-2 text-sm pt-4 border-t border-gray-100">
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{course.studentIds?.length || 0} students enrolled</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Teacher: {course.teacher ? course.teacher.name : <em className="text-red-400">None Assigned</em>}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Course Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={editingClass ? "Edit Course/Class Details" : "Add New Course"}
      >
        <form onSubmit={handleAddOrEditClassSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course Name</label>
            <input
              type="text"
              required
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="e.g. Object Oriented Programming"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course Code</label>
            <input
              type="text"
              required
              value={classCode}
              onChange={(e) => setClassCode(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="e.g. CS-201"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
              rows={3}
              placeholder="Provide a brief course description..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Teacher</label>
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Select teacher</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingClass}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
            >
              {isSubmittingClass ? "Saving..." : editingClass ? "Save Changes" : "Create Course"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Enroll Student Modal */}
      <Modal
        isOpen={showEnrollModal}
        onClose={() => setShowEnrollModal(false)}
        title={`Enroll Student in ${selectedClassForEnroll?.name}`}
      >
        <form onSubmit={handleEnrollSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Student</label>
            <select
              required
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Select Student</option>
              {students
                // Filter out students who are already enrolled
                .filter((s) => !selectedClassForEnroll?.studentIds?.includes(s.id))
                .map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={() => setShowEnrollModal(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingEnroll}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
            >
              {isSubmittingEnroll ? "Enrolling..." : "Enroll Student"}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
