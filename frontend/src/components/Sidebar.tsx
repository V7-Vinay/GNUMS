import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  GraduationCap,
  
  ClipboardList,
  Bell,
  Upload,
  BarChart3,
  Users,
  Settings,
  X,
  
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { user } = useAuth();
  const location = useLocation();

  const studentLinks = [
    { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/student/enrolled-courses', icon: BookOpen, label: 'Courses' },
    { to: '/student/attendance', icon: Calendar, label: 'Attendance' },
    { to: '/student/marks', icon: GraduationCap, label: 'Marks' },
    { to: '/student/materials', icon: BookOpen, label: 'Study Materials' },
    { to: '/student/assignments', icon: ClipboardList, label: 'Assignments' },
    { to: '/student/notifications', icon: Bell, label: 'Notifications' },
  ];

  const teacherLinks = [
    { to: '/teacher/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/teacher/upload-notes', icon: Upload, label: 'Upload Notes' },
    { to: '/teacher/attendance', icon: Calendar, label: 'Attendance' },
    { to: '/teacher/marks', icon: GraduationCap, label: 'Marks' },
    { to: '/teacher/assignments', icon: ClipboardList, label: 'Assignments' },
    { to: '/teacher/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/users', icon: Users, label: 'User Management' },
    { to: '/admin/courses', icon: BookOpen, label: 'Course Management' },
    { to: '/admin/analytics', icon: BarChart3, label: 'System Analytics' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  const links =
    user?.role === 'student'
      ? studentLinks
      : user?.role === 'teacher'
      ? teacherLinks
      : adminLinks;

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 w-64`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-800">EduPortal</span>
          </div>
          <button onClick={onClose} className="lg:hidden">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(link.to)
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
