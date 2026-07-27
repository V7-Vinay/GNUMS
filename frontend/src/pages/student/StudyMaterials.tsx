import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { useSemester } from "../../hooks/useSemester";

import {
  getStudentCourses,
  getStudentMaterials,
} from "../../api/studentApi";

import {
  BookOpen,
  Download,
  FileText,
  Video,
  Presentation,
  Search,
} from "lucide-react";

export const StudyMaterials = () => {
  const { user } = useAuth();
  const { selectedSem, SemesterDropdown } = useSemester();

  const [materials, setMaterials] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");

  useEffect(() => {
    const loadData = async () => {
      try {
        const coursesData = await getStudentCourses();
        setCourses(coursesData);

        const materialsData = await getStudentMaterials();
        setMaterials(materialsData);
      } catch (error) {
        console.error("Failed loading materials:", error);
      }
    };

    loadData();
  }, []);

  const semCourses = courses.filter(
    (c) => selectedSem === "all" || c.semester === selectedSem
  );

  const semCourseIds = semCourses.map((c) => c.id);

  let filteredMaterials = materials.filter((m) =>
    semCourseIds.includes(m.course_id)
  );

  if (selectedCourse !== "all") {
    filteredMaterials = filteredMaterials.filter(
      (m) => m.course_id === selectedCourse
    );
  }

  if (searchTerm) {
    filteredMaterials = filteredMaterials.filter(
      (m) =>
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  const sortedMaterials = [...filteredMaterials].sort(
    (a, b) => new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime()
  );

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "pdf":
        return FileText;
      case "video":
        return Video;
      case "pptx":
        return Presentation;
      default:
        return FileText;
    }
  };

  const getFileColor = (fileType: string) => {
    switch (fileType) {
      case "pdf":
        return "text-red-600 bg-red-100";
      case "video":
        return "text-purple-600 bg-purple-100";
      case "pptx":
        return "text-orange-600 bg-orange-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Study Materials
            </h1>
            <p className="text-gray-600">
              Access course materials and resources
            </p>
          </div>
          <SemesterDropdown />
        </div>

        {/* Search + Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row gap-4">

            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Courses</option>
              {semCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>

          </div>
        </div>

        {/* Materials */}
        {sortedMaterials.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No materials found
            </h3>
            <p className="text-gray-600">
              Study materials will appear here once uploaded
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedMaterials.map((material) => {
              const course = courses.find(
                (c) => c.id === material.course_id
              );

              const FileIcon = getFileIcon(material.file_type);
              const fileColorClass = getFileColor(material.file_type);

              return (
                <div
                  key={material.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-5"
                >
                  <div className="flex items-start space-x-3 mb-3">

                    <div className={`p-3 rounded-lg ${fileColorClass}`}>
                      <FileIcon className="w-6 h-6" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {material.title}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {course?.code}
                      </p>
                    </div>

                  </div>

                  <p className="text-sm text-gray-600 mb-4">
                    {material.description}
                  </p>

                  <button className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg">
                    <Download className="w-4 h-4" />
                    <span className="text-sm font-medium">Download</span>
                  </button>

                </div>
              );
            })}
          </div>
        )}

        {/* Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Stats
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">
                {filteredMaterials.length}
              </p>
              <p className="text-sm text-gray-600">Total Materials</p>
            </div>

            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {filteredMaterials.filter((m) => m.file_type === "pdf").length}
              </p>
              <p className="text-sm text-gray-600">PDF Files</p>
            </div>

            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">
                {filteredMaterials.filter((m) => m.file_type === "video").length}
              </p>
              <p className="text-sm text-gray-600">Videos</p>
            </div>

            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">
                {filteredMaterials.filter((m) => m.file_type === "pptx").length}
              </p>
              <p className="text-sm text-gray-600">Presentations</p>
            </div>

          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};