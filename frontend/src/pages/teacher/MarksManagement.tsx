import { useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Modal } from '../../components/Modal';
import { DataTable } from '../../components/DataTable';
import { useAuth } from '../../context/AuthContext';
import { courses, users, marks } from '../../data/mockData';
import { GraduationCap, Plus } from 'lucide-react';

export const TeacherMarksManagement = () => {
  const { user } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);

  const teachingCourses = courses.filter((c) => user?.teachingCourses?.includes(c.id));

  const columns = [
    {
      header: 'Student',
      accessor: 'studentId',
      render: (value: string) => users.find((u) => u.id === value)?.name || '-',
    },
    {
      header: 'Course',
      accessor: 'courseId',
      render: (value: string) => courses.find((c) => c.id === value)?.name || '-',
    },
    {
      header: 'Exam Type',
      accessor: 'examType',
    },
    {
      header: 'Marks',
      accessor: 'marks',
      render: (value: number, row: any) => `${value}/${row.totalMarks}`,
    },
    {
      header: 'Percentage',
      accessor: 'percentage',
      render: (_: any, row: any) => {
        const percentage = Math.round((row.marks / row.totalMarks) * 100);
        return (
          <span className={`font-medium ${percentage >= 80 ? 'text-green-600' : percentage >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
            {percentage}%
          </span>
        );
      },
    },
    {
      header: 'Date',
      accessor: 'date',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  const teacherMarks = marks.filter((m) =>
    teachingCourses.some((c) => c.id === m.courseId)
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Marks Management</h1>
            <p className="text-gray-600">Add and manage student marks</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            <span>Add Marks</span>
          </button>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <GraduationCap className="w-10 h-10 mb-2 opacity-80" />
          <p className="text-4xl font-bold">{teacherMarks.length}</p>
          <p className="text-sm opacity-90">Total Marks Entered</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Marks</h2>
          </div>
          <DataTable columns={columns} data={teacherMarks} />
        </div>
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Marks">
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option value="">Select course</option>
              {teachingCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Exam Type</label>
            <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="e.g., Midterm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Marks Obtained</label>
              <input type="number" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total Marks</label>
              <input type="number" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
