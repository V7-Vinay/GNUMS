export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'student' | 'teacher' | 'admin';
  avatar?: string;
  enrolledCourses?: string[];
  teachingCourses?: string[];
}

export interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  teacherId: string;
  studentIds: string[];
  startDate: string;
  endDate: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  courseId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
}

export interface Mark {
  id: string;
  studentId: string;
  courseId: string;
  examType: string;
  marks: number;
  totalMarks: number;
  date: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  maxMarks: number;
  teacherId: string;
  submissions?: AssignmentSubmission[];
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  submittedDate: string;
  marks?: number;
  feedback?: string;
  fileUrl: string;
}

export interface StudyMaterial {
  id: string;
  courseId: string;
  title: string;
  description: string;
  uploadDate: string;
  fileType: string;
  fileUrl: string;
  teacherId: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  date: string;
  read: boolean;
}

export const users: User[] = [
  {
    id: '1',
    name: 'John Admin',
    email: 'admin@portal.com',
    password: 'admin123',
    role: 'admin',
  },
  {
    id: '2',
    name: 'Dr. Sarah Johnson',
    email: 'sarah@portal.com',
    password: 'teacher123',
    role: 'teacher',
    teachingCourses: ['1', '2'],
  },
  {
    id: '3',
    name: 'Prof. Michael Chen',
    email: 'michael@portal.com',
    password: 'teacher123',
    role: 'teacher',
    teachingCourses: ['3'],
  },
  {
    id: '4',
    name: 'Emma Wilson',
    email: 'emma@portal.com',
    password: 'student123',
    role: 'student',
    enrolledCourses: ['1', '2', '3'],
  },
  {
    id: '5',
    name: 'James Smith',
    email: 'james@portal.com',
    password: 'student123',
    role: 'student',
    enrolledCourses: ['1', '2'],
  },
  {
    id: '6',
    name: 'Olivia Brown',
    email: 'olivia@portal.com',
    password: 'student123',
    role: 'student',
    enrolledCourses: ['2', '3'],
  },
];

export const courses: Course[] = [
  {
    id: '1',
    name: 'Web Development',
    code: 'CS301',
    description: 'Learn modern web development with React and Node.js',
    teacherId: '2',
    studentIds: ['4', '5'],
    startDate: '2024-01-15',
    endDate: '2024-05-30',
  },
  {
    id: '2',
    name: 'Data Structures',
    code: 'CS201',
    description: 'Master data structures and algorithms',
    teacherId: '2',
    studentIds: ['4', '5', '6'],
    startDate: '2024-01-15',
    endDate: '2024-05-30',
  },
  {
    id: '3',
    name: 'Machine Learning',
    code: 'CS401',
    description: 'Introduction to AI and Machine Learning',
    teacherId: '3',
    studentIds: ['4', '6'],
    startDate: '2024-01-15',
    endDate: '2024-05-30',
  },
];

export const attendance: Attendance[] = [
  { id: '1', studentId: '4', courseId: '1', date: '2024-03-01', status: 'present' },
  { id: '2', studentId: '4', courseId: '1', date: '2024-03-02', status: 'present' },
  { id: '3', studentId: '4', courseId: '1', date: '2024-03-03', status: 'absent' },
  { id: '4', studentId: '4', courseId: '1', date: '2024-03-04', status: 'present' },
  { id: '5', studentId: '4', courseId: '1', date: '2024-03-05', status: 'late' },
  { id: '6', studentId: '4', courseId: '2', date: '2024-03-01', status: 'present' },
  { id: '7', studentId: '4', courseId: '2', date: '2024-03-02', status: 'present' },
  { id: '8', studentId: '4', courseId: '2', date: '2024-03-03', status: 'present' },
  { id: '9', studentId: '4', courseId: '3', date: '2024-03-01', status: 'present' },
  { id: '10', studentId: '4', courseId: '3', date: '2024-03-02', status: 'absent' },
  { id: '11', studentId: '5', courseId: '1', date: '2024-03-01', status: 'present' },
  { id: '12', studentId: '5', courseId: '1', date: '2024-03-02', status: 'present' },
  { id: '13', studentId: '5', courseId: '2', date: '2024-03-01', status: 'late' },
  { id: '14', studentId: '6', courseId: '2', date: '2024-03-01', status: 'present' },
  { id: '15', studentId: '6', courseId: '3', date: '2024-03-01', status: 'present' },
];

export const marks: Mark[] = [
  { id: '1', studentId: '4', courseId: '1', examType: 'Midterm', marks: 85, totalMarks: 100, date: '2024-02-15' },
  { id: '2', studentId: '4', courseId: '1', examType: 'Quiz 1', marks: 18, totalMarks: 20, date: '2024-01-20' },
  { id: '3', studentId: '4', courseId: '2', examType: 'Midterm', marks: 78, totalMarks: 100, date: '2024-02-15' },
  { id: '4', studentId: '4', courseId: '2', examType: 'Quiz 1', marks: 16, totalMarks: 20, date: '2024-01-20' },
  { id: '5', studentId: '4', courseId: '3', examType: 'Midterm', marks: 92, totalMarks: 100, date: '2024-02-15' },
  { id: '6', studentId: '5', courseId: '1', examType: 'Midterm', marks: 75, totalMarks: 100, date: '2024-02-15' },
  { id: '7', studentId: '5', courseId: '2', examType: 'Midterm', marks: 82, totalMarks: 100, date: '2024-02-15' },
  { id: '8', studentId: '6', courseId: '2', examType: 'Midterm', marks: 88, totalMarks: 100, date: '2024-02-15' },
  { id: '9', studentId: '6', courseId: '3', examType: 'Midterm', marks: 90, totalMarks: 100, date: '2024-02-15' },
];

export const assignments: Assignment[] = [
  {
    id: '1',
    courseId: '1',
    title: 'Build a React Portfolio',
    description: 'Create a personal portfolio website using React and TailwindCSS',
    dueDate: '2024-03-20',
    maxMarks: 100,
    teacherId: '2',
    submissions: [
      {
        id: '1',
        assignmentId: '1',
        studentId: '4',
        submittedDate: '2024-03-18',
        marks: 95,
        feedback: 'Excellent work! Great design and functionality.',
        fileUrl: 'portfolio.zip',
      },
    ],
  },
  {
    id: '2',
    courseId: '1',
    title: 'REST API Development',
    description: 'Build a RESTful API using Node.js and Express',
    dueDate: '2024-03-25',
    maxMarks: 100,
    teacherId: '2',
    submissions: [],
  },
  {
    id: '3',
    courseId: '2',
    title: 'Implement Binary Search Tree',
    description: 'Implement BST with insertion, deletion, and traversal operations',
    dueDate: '2024-03-22',
    maxMarks: 50,
    teacherId: '2',
    submissions: [],
  },
  {
    id: '4',
    courseId: '3',
    title: 'Linear Regression Model',
    description: 'Build a linear regression model from scratch using Python',
    dueDate: '2024-03-28',
    maxMarks: 100,
    teacherId: '3',
    submissions: [],
  },
];

export const studyMaterials: StudyMaterial[] = [
  {
    id: '1',
    courseId: '1',
    title: 'Introduction to React Hooks',
    description: 'Comprehensive guide on React Hooks and their usage',
    uploadDate: '2024-02-01',
    fileType: 'pdf',
    fileUrl: 'react-hooks.pdf',
    teacherId: '2',
  },
  {
    id: '2',
    courseId: '1',
    title: 'JavaScript ES6 Features',
    description: 'Modern JavaScript features and best practices',
    uploadDate: '2024-02-05',
    fileType: 'pdf',
    fileUrl: 'es6-features.pdf',
    teacherId: '2',
  },
  {
    id: '3',
    courseId: '2',
    title: 'Data Structures Cheat Sheet',
    description: 'Quick reference for common data structures',
    uploadDate: '2024-02-03',
    fileType: 'pdf',
    fileUrl: 'ds-cheatsheet.pdf',
    teacherId: '2',
  },
  {
    id: '4',
    courseId: '2',
    title: 'Algorithm Complexity Analysis',
    description: 'Understanding Big O notation and time complexity',
    uploadDate: '2024-02-08',
    fileType: 'pptx',
    fileUrl: 'complexity-analysis.pptx',
    teacherId: '2',
  },
  {
    id: '5',
    courseId: '3',
    title: 'Machine Learning Basics',
    description: 'Introduction to ML concepts and terminology',
    uploadDate: '2024-02-02',
    fileType: 'pdf',
    fileUrl: 'ml-basics.pdf',
    teacherId: '3',
  },
  {
    id: '6',
    courseId: '3',
    title: 'Neural Networks Tutorial',
    description: 'Deep dive into neural networks and backpropagation',
    uploadDate: '2024-02-10',
    fileType: 'video',
    fileUrl: 'neural-networks.mp4',
    teacherId: '3',
  },
];

export const notifications: Notification[] = [
  {
    id: '1',
    userId: '4',
    title: 'New Assignment Posted',
    message: 'REST API Development assignment has been posted for Web Development course.',
    type: 'info',
    date: '2024-03-10T10:00:00',
    read: false,
  },
  {
    id: '2',
    userId: '4',
    title: 'Marks Updated',
    message: 'Your midterm marks for Data Structures have been uploaded.',
    type: 'success',
    date: '2024-03-09T14:30:00',
    read: false,
  },
  {
    id: '3',
    userId: '4',
    title: 'Assignment Due Soon',
    message: 'Build a React Portfolio assignment is due in 2 days.',
    type: 'warning',
    date: '2024-03-08T09:00:00',
    read: true,
  },
  {
    id: '4',
    userId: '4',
    title: 'New Study Material',
    message: 'Neural Networks Tutorial has been uploaded for Machine Learning.',
    type: 'info',
    date: '2024-03-07T11:00:00',
    read: true,
  },
  {
    id: '5',
    userId: '2',
    title: 'New Submission',
    message: 'Emma Wilson submitted Build a React Portfolio assignment.',
    type: 'info',
    date: '2024-03-11T16:00:00',
    read: false,
  },
  {
    id: '6',
    userId: '2',
    title: 'Class Schedule Update',
    message: 'Web Development class on March 15 has been rescheduled.',
    type: 'warning',
    date: '2024-03-10T08:00:00',
    read: true,
  },
];
