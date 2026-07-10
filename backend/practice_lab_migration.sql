-- ==========================================
-- AI PRACTICE LAB MIGRATION FOR CODEMENTOR AI V4
-- ==========================================
-- Run this script in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- to set up the necessary tables, indexes, and RLS policies for AI Practice Lab.

-- 1. Table: public.practice_questions
CREATE TABLE IF NOT EXISTS public.practice_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    question_type TEXT NOT NULL, -- coding, mcq, output_prediction, find_the_bug, fill_in_the_blank
    topic TEXT NOT NULL,
    difficulty_level TEXT NOT NULL, -- Beginner, Easy, Medium, Hard, Interview
    company TEXT, -- NULL if general
    programming_language TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    code_context TEXT,
    options JSONB NOT NULL DEFAULT '[]'::jsonb, -- Choices for MCQ
    correct_answer TEXT NOT NULL,
    hints JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array: [Hint 1, Hint 2, Hint 3, Final Solution]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Foreign Key Constraint referencing profiles
    CONSTRAINT fk_practice_questions_profiles 
        FOREIGN KEY (user_id) 
        REFERENCES public.profiles(id) 
        ON DELETE CASCADE
);

-- Indexing for user filter speed
CREATE INDEX IF NOT EXISTS practice_questions_user_id_created_at_idx 
    ON public.practice_questions (user_id, created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.practice_questions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for practice_questions
DROP POLICY IF EXISTS "Allow users to view their own practice questions" ON public.practice_questions;
CREATE POLICY "Allow users to view their own practice questions"
    ON public.practice_questions FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to insert their own practice questions" ON public.practice_questions;
CREATE POLICY "Allow users to insert their own practice questions"
    ON public.practice_questions FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to delete their own practice questions" ON public.practice_questions;
CREATE POLICY "Allow users to delete their own practice questions"
    ON public.practice_questions FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);


-- 2. Table: public.practice_attempts
CREATE TABLE IF NOT EXISTS public.practice_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    question_id UUID NOT NULL,
    user_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    hints_used INTEGER NOT NULL DEFAULT 0,
    evaluation JSONB NOT NULL DEFAULT '{}'::jsonb, -- detailed analysis: scores, logic, complexity, tips, strengths, weaknesses, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Foreign Key Constraints
    CONSTRAINT fk_practice_attempts_profiles 
        FOREIGN KEY (user_id) 
        REFERENCES public.profiles(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_practice_attempts_questions 
        FOREIGN KEY (question_id) 
        REFERENCES public.practice_questions(id) 
        ON DELETE CASCADE
);

-- Indexing for user filter speed
CREATE INDEX IF NOT EXISTS practice_attempts_user_id_created_at_idx 
    ON public.practice_attempts (user_id, created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.practice_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for practice_attempts
DROP POLICY IF EXISTS "Allow users to view their own practice attempts" ON public.practice_attempts;
CREATE POLICY "Allow users to view their own practice attempts"
    ON public.practice_attempts FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to insert their own practice attempts" ON public.practice_attempts;
CREATE POLICY "Allow users to insert their own practice attempts"
    ON public.practice_attempts FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to delete their own practice attempts" ON public.practice_attempts;
CREATE POLICY "Allow users to delete their own practice attempts"
    ON public.practice_attempts FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);


-- 3. Table: public.practice_statistics
CREATE TABLE IF NOT EXISTS public.practice_statistics (
    user_id UUID PRIMARY KEY,
    attempts_count INTEGER NOT NULL DEFAULT 0,
    correct_attempts_count INTEGER NOT NULL DEFAULT 0,
    streak INTEGER NOT NULL DEFAULT 0,
    last_practice_date TIMESTAMP WITH TIME ZONE,
    weak_topics JSONB NOT NULL DEFAULT '[]'::jsonb,
    practice_time_seconds INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Foreign Key Constraint referencing profiles
    CONSTRAINT fk_practice_statistics_profiles 
        FOREIGN KEY (user_id) 
        REFERENCES public.profiles(id) 
        ON DELETE CASCADE
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.practice_statistics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for practice_statistics
DROP POLICY IF EXISTS "Allow users to view their own practice statistics" ON public.practice_statistics;
CREATE POLICY "Allow users to view their own practice statistics"
    ON public.practice_statistics FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to insert their own practice statistics" ON public.practice_statistics;
CREATE POLICY "Allow users to insert their own practice statistics"
    ON public.practice_statistics FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to update their own practice statistics" ON public.practice_statistics;
CREATE POLICY "Allow users to update their own practice statistics"
    ON public.practice_statistics FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to delete their own practice statistics" ON public.practice_statistics;
CREATE POLICY "Allow users to delete their own practice statistics"
    ON public.practice_statistics FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
