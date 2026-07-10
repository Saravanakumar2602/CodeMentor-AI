-- ==========================================
-- CODE REVIEW MIGRATION FOR CODEMENTOR AI V2
-- ==========================================
-- Run this script in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- to set up the necessary tables, indexes, and RLS policies for AI Code Review.

CREATE TABLE IF NOT EXISTS public.code_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    code_input TEXT NOT NULL,
    overall_score INTEGER NOT NULL,
    readability_score INTEGER NOT NULL,
    performance_score INTEGER NOT NULL,
    maintainability_score INTEGER NOT NULL,
    security_score INTEGER NOT NULL,
    summary TEXT NOT NULL,
    suggestions JSONB NOT NULL DEFAULT '[]'::jsonb,
    refactored_code TEXT,
    interview_tips JSONB NOT NULL DEFAULT '[]'::jsonb,
    language TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Foreign Key Constraint referencing profiles
    CONSTRAINT fk_code_reviews_profiles 
        FOREIGN KEY (user_id) 
        REFERENCES public.profiles(id) 
        ON DELETE CASCADE
);

-- Indexing for user filter speed
CREATE INDEX IF NOT EXISTS code_reviews_user_id_created_at_idx 
    ON public.code_reviews (user_id, created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.code_reviews ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view their reviews
DROP POLICY IF EXISTS "Allow users to view their own code reviews" ON public.code_reviews;
CREATE POLICY "Allow users to view their own code reviews"
    ON public.code_reviews FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Allow authenticated users to insert reviews
DROP POLICY IF EXISTS "Allow users to insert their own code reviews" ON public.code_reviews;
CREATE POLICY "Allow users to insert their own code reviews"
    ON public.code_reviews FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to delete reviews
DROP POLICY IF EXISTS "Allow users to delete their own code reviews" ON public.code_reviews;
CREATE POLICY "Allow users to delete their own code reviews"
    ON public.code_reviews FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
