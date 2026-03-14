import { useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Modal } from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';
import { assignments, courses } from '../../data/mockData';
import { ClipboardList, Plus, Calendar, Users } from 'lucide-react';

export const TeacherAssignmentManagement = () => {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const teachingCourses = courses.filter((c) => user?.teachingCourses?.includes(c.id));
  const teacherAssignments = assignments.filter((a) => a.teacherId === user?.id);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Assignment Management</h1>
            <p className="text-gray-600">Create and manage assignments</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            <span>Create Assignment</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <ClipboardList className="w-8 h-8 text-blue-600 mb-2" />
            <p className="text-3xl font-bold text-gray-900">{teacherAssignments.length}</p>
            <p className="text-sm text-gray-600">Total Assignments</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Users className="w-8 h-8 text-green-600 mb-2" />
            <p className="text-3xl font-bold text-gray-900">
              {teacherAssignments.reduce((sum, a) => sum + (a.submissions?.length || 0), 0)}
            </p>
            <p className="text-sm text-gray-600">Total Submissions</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Calendar className="w-8 h-8 text-purple-600 mb-2" />
            <p className="text-3xl font-bold text-gray-900">
              {teacherAssignments.filter((a) => new Date(a.dueDate) > new Date()).length}
            </p>
            <p className="text-sm text-gray-600">Active Assignments</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teacherAssignments.map((assignment) => {
            const course = courses.find((c) => c.id === assignment.courseId);
            const submissionCount = assignment.submissions?.length || 0;
            const totalStudents = course?.studentIds.length || 0;

            return (
              <div key={assignment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{assignment.title}</h3>
                    <p className="text-xs text-gray-500">{course?.name}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{assignment.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Due Date:</span>
                    <span className="font-medium">{new Date(assignment.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Submissions:</span>
                    <span className="font-medium">{submissionCount}/{totalStudents}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(submissionCount / totalStudents) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Assignment">
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option value="">Select course</option>
              {teachingCourses.map((course) => (
                <option key={course.id} value={course.id}>{course.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea className="w-full px-4 py-2 border border-gray-300 rounded-lg" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
              <input type="date" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Marks</label>
              <input type="number" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
