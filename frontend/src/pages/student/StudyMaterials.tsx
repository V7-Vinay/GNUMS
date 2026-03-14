import { useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { studyMaterials, courses, users } from '../../data/mockData';
import { BookOpen, Download, FileText, Video, Presentation, Search } from 'lucide-react';

export const StudyMaterials = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');

  const enrolledCourses = courses.filter((c) => user?.enrolledCourses?.includes(c.id));

  let filteredMaterials = studyMaterials.filter((m) =>
    user?.enrolledCourses?.includes(m.courseId)
  );

  if (selectedCourse !== 'all') {
    filteredMaterials = filteredMaterials.filter((m) => m.courseId === selectedCourse);
  }

  if (searchTerm) {
    filteredMaterials = filteredMaterials.filter(
      (m) =>
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  const sortedMaterials = [...filteredMaterials].sort(
    (a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
  );

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
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Study Materials</h1>
          <p className="text-gray-600">Access course materials and resources</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Courses</option>
              {enrolledCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3">
            {sortedMaterials.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No materials found</h3>
                <p className="text-gray-600">
                  {searchTerm
                    ? 'Try adjusting your search criteria'
                    : 'Study materials will appear here once uploaded by your teachers'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedMaterials.map((material) => {
                  const course = courses.find((c) => c.id === material.courseId);
                  const teacher = users.find((u) => u.id === material.teacherId);
                  const FileIcon = getFileIcon(material.fileType);
                  const fileColorClass = getFileColor(material.fileType);

                  return (
                    <div
                      key={material.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start space-x-3 mb-3">
                        <div className={`p-3 rounded-lg ${fileColorClass}`}>
                          <FileIcon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">
                            {material.title}
                          </h3>
                          <p className="text-xs text-gray-500">{course?.code}</p>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {material.description}
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                        <span>{teacher?.name}</span>
                        <span>{new Date(material.uploadDate).toLocaleDateString()}</span>
                      </div>

                      <button className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                        <Download className="w-4 h-4" />
                        <span className="text-sm font-medium">Download</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{filteredMaterials.length}</p>
              <p className="text-sm text-gray-600 mt-1">Total Materials</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {filteredMaterials.filter((m) => m.fileType === 'pdf').length}
              </p>
              <p className="text-sm text-gray-600 mt-1">PDF Files</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">
                {filteredMaterials.filter((m) => m.fileType === 'video').length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Videos</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">
                {filteredMaterials.filter((m) => m.fileType === 'pptx').length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Presentations</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
