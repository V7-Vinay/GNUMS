import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { Modal } from "../../components/Modal";
import { Upload, FileText, Video, Presentation, Trash2, Plus } from "lucide-react";
import { getTeacherCourses, getTeacherMaterials, uploadStudyMaterial } from "../../api/teacherApi";

export const TeacherUploadNotes = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    courseId: "",
    title: "",
    description: "",
    fileType: "pdf",
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const coursesData = await getTeacherCourses();
      setCourses(coursesData);

      const materialsData = await getTeacherMaterials();
      setMaterials(materialsData);
    } catch (error) {
      console.error("Failed to load upload notes page data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Auto detect file type extension
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext === "pdf") {
        setFormData((prev) => ({ ...prev, fileType: "pdf" }));
      } else if (ext === "pptx" || ext === "ppt") {
        setFormData((prev) => ({ ...prev, fileType: "pptx" }));
      } else if (["mp4", "mkv", "avi", "mov"].includes(ext || "")) {
        setFormData((prev) => ({ ...prev, fileType: "video" }));
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.courseId || !formData.title || !selectedFile) {
      alert("Please select a course, enter a title, and browse a file.");
      return;
    }

    setIsUploading(true);
    try {
      const payload = new FormData();
      payload.append("file", selectedFile);
      payload.append("courseId", formData.courseId);
      payload.append("title", formData.title);
      payload.append("description", formData.description);
      payload.append("fileType", formData.fileType);

      await uploadStudyMaterial(payload);

      alert("Study material uploaded successfully.");
      setShowUploadModal(false);
      resetForm();
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to upload study material.");
    } finally {
      setIsUploading(false);
    }
  };

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

  const resetForm = () => {
    setFormData({ courseId: "", title: "", description: "", fileType: "pdf" });
    setSelectedFile(null);
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
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            <span>Upload Material</span>
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading notes index...</div>
        ) : materials.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No materials uploaded yet</h3>
            <p className="text-gray-600 mb-4">Start by uploading your first study material</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Upload Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {materials.map((material) => {
              const course = courses.find((c) => c.id === material.courseId);
              const FileIcon = getFileIcon(material.fileType);
              const fileColorClass = getFileColor(material.fileType);

              return (
                <div
                  key={material.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-3 rounded-lg ${fileColorClass}`}>
                        <FileIcon className="w-6 h-6" />
                      </div>
                      <a
                        href={material.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600 text-xs font-semibold"
                        title="Download Material"
                      >
                        View file
                      </a>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{material.title}</h3>
                    <p className="text-xs text-gray-500 mb-2">{course ? course.name : "Course notes"}</p>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{material.description}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100 mt-2">
                    <span>{new Date(material.uploadDate).toLocaleDateString()}</span>
                    <span className="uppercase font-medium">{material.fileType}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload Material Modal */}
      <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Upload Study Material">
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
            <select
              value={formData.courseId}
              onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              required
            >
              <option value="">Select a course</option>
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
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="e.g., Chapter 5: Data Structures"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="pdf">PDF Document</option>
              <option value="video">Video Lecture</option>
              <option value="pptx">Presentation Slides</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload File</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50/50">
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                {selectedFile ? (
                  <strong className="text-blue-600">{selectedFile.name}</strong>
                ) : (
                  "Click to browse or choose a file"
                )}
              </p>
              <input
                type="file"
                className="hidden"
                id="material-upload"
                onChange={handleFileChange}
              />
              <label
                htmlFor="material-upload"
                className="inline-block mt-3 text-sm font-semibold bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 cursor-pointer shadow-sm"
              >
                Browse files
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowUploadModal(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !selectedFile}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
            >
              {isUploading ? "Uploading..." : "Upload Notes"}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
