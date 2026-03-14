import { useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Modal } from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';
import { studyMaterials, courses } from '../../data/mockData';
import { Upload, FileText, Video, Presentation, Trash2, Plus } from 'lucide-react';

export const TeacherUploadNotes = () => {
  const { user } = useAuth();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [formData, setFormData] = useState({
    courseId: '',
    title: '',
    description: '',
    fileType: 'pdf',
  });

  const teachingCourses = courses.filter((c) => user?.teachingCourses?.includes(c.id));
  const teacherMaterials = studyMaterials.filter((m) => m.teacherId === user?.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowUploadModal(false);
    setFormData({ courseId: '', title: '', description: '', fileType: 'pdf' });
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return FileText;
      case 'video':
        return Video;
      case 'pptx':
        return Presentation;
      default:
        return FileText;
    }
  };

  const getFileColor = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return 'text-red-600 bg-red-100';
      case 'video':
        return 'text-purple-600 bg-purple-100';
      case 'pptx':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Upload Study Materials</h1>
            <p className="text-gray-600">Share resources and notes with your students</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Upload Material</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teacherMaterials.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No materials uploaded yet</h3>
              <p className="text-gray-600 mb-4">Start by uploading your first study material</p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Upload Now
              </button>
            </div>
          ) : (
            teacherMaterials.map((material) => {
              const course = courses.find((c) => c.id === material.courseId);
              const FileIcon = getFileIcon(material.fileType);
              const fileColorClass = getFileColor(material.fileType);

              return (
                <div
                  key={material.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-3 rounded-lg ${fileColorClass}`}>
                      <FileIcon className="w-6 h-6" />
                    </div>
                    <button className="text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{material.title}</h3>
                  <p className="text-xs text-gray-500 mb-2">{course?.name}</p>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{material.description}</p>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{new Date(material.uploadDate).toLocaleDateString()}</span>
                    <span className="uppercase font-medium">{material.fileType}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Study Material"
        footer={
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowUploadModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Upload
            </button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
            <select
              value={formData.courseId}
              onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select a course</option>
              {teachingCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Chapter 5: Data Structures"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Brief description of the material"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">File Type</label>
            <select
              value={formData.fileType}
              onChange={(e) => setFormData({ ...formData, fileType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="pdf">PDF Document</option>
              <option value="video">Video</option>
              <option value="pptx">Presentation</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload File</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
              <input type="file" className="hidden" id="material-upload" required />
              <label
                htmlFor="material-upload"
                className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                Browse files
              </label>
            </div>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
