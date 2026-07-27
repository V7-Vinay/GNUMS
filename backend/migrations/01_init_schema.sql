-- Migration 01: Initialize DB Schema for Smart Student-Teacher Portal

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop trigger first to prevent dependency errors during drops
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop existing tables if they exist to start fresh
DROP TABLE IF EXISTS public.assignment_submissions CASCADE;
DROP TABLE IF EXISTS public.assignments CASCADE;
DROP TABLE IF EXISTS public.attendance CASCADE;
DROP TABLE IF EXISTS public.class_enrollments CASCADE;
DROP TABLE IF EXISTS public.classes CASCADE;
DROP TABLE IF EXISTS public.teacher_profiles CASCADE;
DROP TABLE IF EXISTS public.student_profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;

-- 1. Create Roles Table
CREATE TABLE public.roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- Insert Roles
INSERT INTO public.roles (name) VALUES 
('admin'),
('teacher'),
('student');

-- 2. Create Users Table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    role_id INTEGER NOT NULL REFERENCES public.roles(id) ON DELETE RESTRICT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT email_domain_check CHECK (email LIKE '%@college.edu.in' OR email LIKE '%@admin.college.edu.in')
);

-- 3. Create Student Profiles Table
CREATE TABLE public.student_profiles (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    roll_number VARCHAR(50) UNIQUE NOT NULL,
    enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- 4. Create Teacher Profiles Table
CREATE TABLE public.teacher_profiles (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    department VARCHAR(100) NOT NULL,
    joining_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- 5. Create Classes Table
CREATE TABLE public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    teacher_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Create Class Enrollments Table
CREATE TABLE public.class_enrollments (
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (class_id, student_id)
);

-- 7. Create Attendance Table
CREATE TABLE public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
    marked_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_class_student_date UNIQUE (class_id, student_id, date)
);

-- 8. Create Assignments Table
CREATE TABLE public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ NOT NULL,
    max_marks NUMERIC(5, 2) NOT NULL CHECK (max_marks > 0),
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Create Assignment Submissions Table
CREATE TABLE public.assignment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    submission_text TEXT,
    file_url VARCHAR(1024),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    marks_obtained NUMERIC(5, 2) CHECK (marks_obtained >= 0),
    graded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    graded_at TIMESTAMPTZ,
    feedback TEXT,
    CONSTRAINT unique_assignment_student UNIQUE (assignment_id, student_id)
);

-- Indexes for performance (frequently queried lookups)
CREATE INDEX idx_attendance_student_date ON public.attendance(student_id, date);
CREATE INDEX idx_assignments_class_id ON public.assignments(class_id);
CREATE INDEX idx_submissions_student_assignment ON public.assignment_submissions(student_id, assignment_id);

-- Trigger function to automatically sync Supabase Auth users to public schema
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_role_id INT;
    v_role_name VARCHAR;
    v_first_name VARCHAR;
    v_last_name VARCHAR;
    v_roll_number VARCHAR;
    v_department VARCHAR;
BEGIN
    -- Extract role, default to 'student'
    v_role_name := COALESCE(new.raw_user_meta_data->>'role', 'student');
    v_first_name := COALESCE(new.raw_user_meta_data->>'first_name', 'First');
    v_last_name := COALESCE(new.raw_user_meta_data->>'last_name', 'Last');
    v_roll_number := new.raw_user_meta_data->>'roll_number';
    v_department := new.raw_user_meta_data->>'department';

    -- Find matching role ID
    SELECT id INTO v_role_id FROM public.roles WHERE name = v_role_name;
    IF v_role_id IS NULL THEN
        SELECT id INTO v_role_id FROM public.roles WHERE name = 'student';
        v_role_name := 'student';
    END IF;

    -- Insert into public.users
    INSERT INTO public.users (id, email, role_id, first_name, last_name)
    VALUES (new.id, new.email, v_role_id, v_first_name, v_last_name);

    -- Insert into corresponding profile table
    IF v_role_name = 'student' THEN
        INSERT INTO public.student_profiles (user_id, roll_number)
        VALUES (
            new.id, 
            COALESCE(v_roll_number, 'ROLL-' || UPPER(SUBSTRING(new.id::text FROM 1 FOR 8)))
        );
    ELSIF v_role_name = 'teacher' THEN
        INSERT INTO public.teacher_profiles (user_id, department)
        VALUES (
            new.id, 
            COALESCE(v_department, 'Computer Science')
        );
    END IF;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Re-throw error to abort signup transaction
        RAISE EXCEPTION 'Sync to public.users failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute handle_new_user on auth.users INSERT
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
