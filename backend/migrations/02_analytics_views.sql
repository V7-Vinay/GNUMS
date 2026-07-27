-- Migration 02: Database Views for Optimized Analytics Aggregation

-- Drop existing views if they exist
DROP VIEW IF EXISTS public.view_class_analytics_summary CASCADE;
DROP VIEW IF EXISTS public.view_assignment_submission_analytics CASCADE;
DROP VIEW IF EXISTS public.view_student_attendance_analytics CASCADE;

-- 1. Student Attendance Analytics View
CREATE OR REPLACE VIEW public.view_student_attendance_analytics AS
SELECT 
    a.student_id,
    u.first_name,
    u.last_name,
    a.class_id,
    c.code AS class_code,
    c.name AS class_name,
    COUNT(a.id) AS total_sessions,
    COUNT(a.id) FILTER (WHERE a.status = 'present') AS present_sessions,
    ROUND(
        COALESCE(
            (COUNT(a.id) FILTER (WHERE a.status = 'present')::NUMERIC / 
            NULLIF(COUNT(a.id), 0)::NUMERIC) * 100,
            0
        ), 
        2
    ) AS attendance_percentage
FROM 
    public.attendance a
JOIN 
    public.users u ON a.student_id = u.id
JOIN 
    public.classes c ON a.class_id = c.id
GROUP BY 
    a.student_id, u.first_name, u.last_name, a.class_id, c.code, c.name;

-- 2. Assignment Submission Rate & Average Marks View
CREATE OR REPLACE VIEW public.view_assignment_submission_analytics AS
SELECT 
    asg.id AS assignment_id,
    asg.title AS assignment_title,
    asg.class_id,
    c.code AS class_code,
    c.name AS class_name,
    COUNT(ce.student_id) AS total_enrolled,
    COUNT(sub.id) AS total_submitted,
    ROUND(
        COALESCE(
            (COUNT(sub.id)::NUMERIC / 
            NULLIF(COUNT(ce.student_id), 0)::NUMERIC) * 100,
            0
        ), 
        2
    ) AS submission_rate,
    ROUND(COALESCE(AVG(sub.marks_obtained), 0), 2) AS average_marks,
    asg.max_marks
FROM 
    public.assignments asg
JOIN 
    public.classes c ON asg.class_id = c.id
LEFT JOIN 
    public.class_enrollments ce ON c.id = ce.class_id
LEFT JOIN 
    public.assignment_submissions sub ON asg.id = sub.assignment_id AND ce.student_id = sub.student_id
GROUP BY 
    asg.id, asg.title, asg.class_id, c.code, c.name, asg.max_marks;

-- 3. Class-Level Teacher Dashboard Analytics Summary View
CREATE OR REPLACE VIEW public.view_class_analytics_summary AS
SELECT 
    c.id AS class_id,
    c.code AS class_code,
    c.name AS class_name,
    c.teacher_id,
    -- Average attendance percentage across all students in this class
    ROUND(
        COALESCE(
            (COUNT(a.id) FILTER (WHERE a.status = 'present')::NUMERIC / 
            NULLIF(COUNT(a.id), 0)::NUMERIC) * 100,
            0
        ), 
        2
    ) AS average_attendance,
    -- Total assignments created for this class
    COUNT(DISTINCT asg.id) AS total_assignments,
    -- Average assignment grade percentage across all student submissions in this class
    ROUND(
        COALESCE(
            AVG(sub.marks_obtained / asg.max_marks * 100)::NUMERIC,
            0
        ), 
        2
    ) AS average_grade_percentage
FROM 
    public.classes c
LEFT JOIN 
    public.attendance a ON c.id = a.class_id
LEFT JOIN 
    public.assignments asg ON c.id = asg.class_id
LEFT JOIN 
    public.assignment_submissions sub ON asg.id = sub.assignment_id
GROUP BY 
    c.id, c.code, c.name, c.teacher_id;
