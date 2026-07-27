import { BookOpen, Calendar, GraduationCap, ClipboardList, TrendingUp, Clock, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "../../components/DashboardLayout";
import { DashboardCard } from "../../components/DashboardCard";
import { useAuth } from "../../context/AuthContext";

import { useEffect, useState } from "react";

import {
  getStudentDashboard,
  getStudentCourses,
  getStudentAssignments,
  getStudentMaterials
} from "../../api/studentApi";

export const StudentDashboard = () => {

  const { user } = useAuth();
  const navigate = useNavigate();

  const [dashboardStats, setDashboardStats] = useState({
    totalCourses: 0,
    attendancePercent: 0,
    avgMarks: 0
  });

  const [courses, setCourses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);

  useEffect(() => {

    const fetchData = async () => {
      try {

        const dashboard = await getStudentDashboard();
        setDashboardStats(dashboard);

        const coursesData = await getStudentCourses();
        setCourses(coursesData);

        const assignmentsData = await getStudentAssignments();
        setAssignments(assignmentsData);

        const materialsData = await getStudentMaterials();
        setMaterials(materialsData);

      } catch (error) {
        console.error("Dashboard load error:", error);
      }
    };

    fetchData();

  }, []);

  const upcomingAssignments = assignments.slice(0, 3);
  const recentMaterials = materials.slice(0, 5);

  return (
    <DashboardLayout>
      <div className="space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your courses today.
          </p>
        </div>

        {/* Stat Cards */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          <button onClick={() => navigate("/student/enrolled-courses")}>
            <DashboardCard
              title="Enrolled Courses"
              value={dashboardStats.totalCourses}
              icon={BookOpen}
              iconColor="text-blue-600"
              bgColor="bg-blue-100"
            />
          </button>

          <button onClick={() => navigate("/student/attendance")}>
            <DashboardCard
              title="Attendance"
              value={`${dashboardStats.attendancePercent}%`}
              icon={Calendar}
              iconColor="text-green-600"
              bgColor="bg-green-100"
            />
          </button>

          <button onClick={() => navigate("/student/marks")}>
            <DashboardCard
              title="Average Marks"
              value={`${dashboardStats.avgMarks}%`}
              icon={GraduationCap}
              iconColor="text-purple-600"
              bgColor="bg-purple-100"
            />
          </button>

          <button onClick={() => navigate("/student/assignments")}>
            <DashboardCard
              title="Assignments"
              value={assignments.length}
              icon={ClipboardList}
              iconColor="text-orange-600"
              bgColor="bg-orange-100"
            />
          </button>

        </div>

        {/* Upcoming Assignments */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div className="bg-white rounded-lg shadow-sm border p-6">

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Upcoming Assignments</h2>

              <button
                onClick={() => navigate("/student/assignments")}
                className="text-sm text-blue-600 flex items-center"
              >
                View all <ChevronRight className="w-4 h-4" />
              </button>

            </div>

            <div className="space-y-4">

              {upcomingAssignments.length === 0 ? (
                <p className="text-gray-500 text-sm">No assignments</p>
              ) : (

                upcomingAssignments.map((assignment) => {

                  const course = courses.find(
                    (c: any) => c.id === assignment.course_id
                  );

                  return (

                    <div
                      key={assignment.id}
                      className="p-4 bg-gray-50 rounded-lg"
                    >

                      <h3 className="font-medium">{assignment.title}</h3>

                      <p className="text-sm text-gray-600">
                        {course?.name}
                      </p>

                      <p className="text-xs text-gray-500">
                        Due: {new Date(assignment.due_date).toLocaleDateString()}
                      </p>

                    </div>

                  );

                })

              )}

            </div>

          </div>

          {/* Study Materials */}

          <div className="bg-white rounded-lg shadow-sm border p-6">

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Study Materials</h2>

              <button
                onClick={() => navigate("/student/materials")}
                className="text-sm text-blue-600 flex items-center"
              >
                View all <ChevronRight className="w-4 h-4" />
              </button>

            </div>

            <div className="space-y-3">

              {recentMaterials.length === 0 ? (
                <p className="text-gray-500 text-sm">No materials</p>
              ) : (

                recentMaterials.map((material) => {

                  const course = courses.find(
                    (c: any) => c.id === material.course_id
                  );

                  return (

                    <div
                      key={material.id}
                      className="p-3 bg-gray-50 rounded-lg"
                    >

                      <h3 className="font-medium text-sm">
                        {material.title}
                      </h3>

                      <p className="text-xs text-gray-600">
                        {course?.name}
                      </p>

                    </div>

                  );

                })

              )}

            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
};