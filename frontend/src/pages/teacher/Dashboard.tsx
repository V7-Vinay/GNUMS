import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { DashboardCard } from "../../components/DashboardCard";
import { useAuth } from "../../context/AuthContext";
import { BookOpen, Users, ClipboardList, FileText, Calendar, TrendingUp } from "lucide-react";
import {
  getTeacherCourses,
  getTeacherAssignments,
  getTeacherMaterials,
  getTeacherSubmissions,
} from "../../api/teacherApi";

export const TeacherDashboard = () => {
  const { user } = useAuth();
  
  const [courses, setCourses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [coursesData, assignmentsData, materialsData, submissionsData] = await Promise.all([
          getTeacherCourses(),
          getTeacherAssignments(),
          getTeacherMaterials(),
          getTeacherSubmissions(),
        ]);
        
        setCourses(coursesData);
        setAssignments(assignmentsData);
        setMaterials(materialsData);
        setSubmissions(submissionsData);
      } catch (error) {
        console.error("Failed to load teacher dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalStudents = courses.reduce((sum, course) => sum + (course.studentIds?.length || 0), 0);
  const totalSubmissions = submissions.length;
  const recentSubmissions = submissions.slice(0, 5);

  const upcomingClasses = courses.map((course) => {
    const nextClass = new Date();
    nextClass.setDate(nextClass.getDate() + Math.floor(Math.random() * 5) + 1);
    return {
      course,
      date: nextClass,
    };
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64 text-gray-500">
          Loading teacher dashboard data...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Welcome, {user?.first_name} {user?.last_name}!
          </h1>
          <p className="text-gray-600">Here's an overview of your teaching activities.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            title="Courses Teaching"
            value={courses.length}
            icon={BookOpen}
            iconColor="text-blue-600"
            bgColor="bg-blue-100"
          />
          <DashboardCard
            title="Total Students"
            value={totalStudents}
            icon={Users}
            iconColor="text-green-600"
            bgColor="bg-green-100"
          />
          <DashboardCard
            title="Assignments"
            value={assignments.length}
            icon={ClipboardList}
            iconColor="text-purple-600"
            bgColor="bg-purple-100"
            description={`${totalSubmissions} submissions`}
          />
          <DashboardCard
            title="Study Materials"
            value={materials.length}
            icon={FileText}
            iconColor="text-orange-600"
            bgColor="bg-orange-100"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Submissions</h2>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {recentSubmissions.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-6">No student submissions yet</p>
              ) : (
                recentSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-sm">{submission.assignmentTitle}</h3>
                      <p className="text-xs text-gray-600 mt-1">
                        {submission.studentName} • {submission.courseCode}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(submission.submittedDate).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Classes</h2>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {upcomingClasses.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-6">No scheduled courses</p>
              ) : (
                upcomingClasses.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.course.name}</h3>
                      <p className="text-xs text-gray-600 mt-1">
                        {item.course.studentIds?.length || 0} students enrolled
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {item.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                      <p className="text-xs text-gray-500">10:00 AM</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">My Courses</h2>
          {courses.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">You are not teaching any courses yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-xs font-medium text-gray-500">{course.code}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{course.name}</h3>
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">{course.studentIds?.length || 0} Students</span>
                    <span className="font-medium text-green-600">Active</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
