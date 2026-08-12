-- Migration 04: Create Missing Tables (marks and study_materials) and add semester column

-- 1. Create Marks Table
CREATE TABLE IF NOT EXISTS public.marks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    exam_type VARCHAR(100) NOT NULL,
    marks NUMERIC(5, 2) NOT NULL CHECK (marks >= 0),
    total_marks NUMERIC(5, 2) NOT NULL CHECK (total_marks > 0),
    date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT marks_limit CHECK (marks <= total_marks)
);

-- 2. Create Study Materials Table
CREATE TABLE IF NOT EXISTS public.study_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    file_url VARCHAR(1024) NOT NULL,
    file_type VARCHAR(50),
    upload_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Add semester column to classes table if it doesn't exist
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS semester INTEGER DEFAULT 1;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_marks_student_id ON public.marks(student_id);
CREATE INDEX IF NOT EXISTS idx_marks_class_id ON public.marks(class_id);
CREATE INDEX IF NOT EXISTS idx_study_materials_class_id ON public.study_materials(class_id);
