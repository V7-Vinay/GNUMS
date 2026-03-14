import { useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Modal } from '../../components/Modal';
import { DataTable } from '../../components/DataTable';
import { useAuth } from '../../context/AuthContext';
import { courses, users, attendance } from '../../data/mockData';
import { Calendar, Plus, CheckCircle2, XCircle, Clock } from 'lucide-react';

export const TeacherAttendanceManagement = () => {
  const { user } = useAuth();
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');

  const teachingCourses = courses.filter((c) => user?.teachingCourses?.includes(c.id));

  const columns = [
    {
      header: 'Student Name',
      accessor: 'studentId',
      render: (value: string) => {
        const student = users.find((u) => u.id === value);
        return student?.name || '-';
      },
    },
    {
      header: 'Course',
      accessor: 'courseId',
      render: (value: string) => {
        const course = courses.find((c) => c.id === value);
        return course?.name || '-';
      },
    },
    {
      header: 'Date',
      accessor: 'date',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (value: string) => {
        const config = {
          present: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          absent: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
          late: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
        };
        const { icon: Icon, color, bg } = config[value as keyof typeof config];
        return (
          <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${bg} ${color}`}>
            <Icon className="w-4 h-4" />
            <span className="capitalize">{value}</span>
          </span>
        );
      },
    },
  ];

  const teacherAttendance = attendance.filter((a) =>
    teachingCourses.some((c) => c.id === a.courseId)
  );

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
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            <span>Mark Attendance</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Calendar className="w-8 h-8 text-blue-600 mb-2" />
            <p className="text-3xl font-bold text-gray-900">{teacherAttendance.length}</p>
            <p className="text-sm text-gray-600">Total Records</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <CheckCircle2 className="w-8 h-8 text-green-600 mb-2" />
            <p className="text-3xl font-bold text-gray-900">
              {teacherAttendance.filter((a) => a.status === 'present').length}
            </p>
            <p className="text-sm text-gray-600">Present</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <XCircle className="w-8 h-8 text-red-600 mb-2" />
            <p className="text-3xl font-bold text-gray-900">
              {teacherAttendance.filter((a) => a.status === 'absent').length}
            </p>
            <p className="text-sm text-gray-600">Absent</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Attendance Records</h2>
          </div>
          <DataTable columns={columns} data={teacherAttendance} />
        </div>
      </div>

      <Modal
        isOpen={showMarkModal}
        onClose={() => setShowMarkModal(false)}
        title="Mark Attendance"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Choose a course</option>
              {teachingCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
          <p className="text-sm text-gray-600">Feature demo: Select a course to mark attendance for students.</p>
        </div>
      </Modal>
    </DashboardLayout>
  );
};
