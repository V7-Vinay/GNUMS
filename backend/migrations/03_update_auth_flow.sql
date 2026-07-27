-- Migration 03: Update Auth Flow to Request-Approval and Password Credentials

-- 1. Create Registration Requests Table
CREATE TABLE IF NOT EXISTS public.registration_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'teacher')),
    roll_number VARCHAR(50),
    department VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES public.users(id),
    rejection_reason TEXT,
    CONSTRAINT unique_pending_request UNIQUE (email, status)
);

-- 2. Modify Users Table
-- Remove institutional email check constraint
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS email_domain_check;

-- Add must_change_password column
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT TRUE;

-- Add temp_password_sent_at column
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS temp_password_sent_at TIMESTAMPTZ;
