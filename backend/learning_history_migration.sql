-- ==========================================
-- LEARNING PATH MIGRATION FOR CODEMENTOR AI V3
-- ==========================================
-- Run this script in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- to set up the necessary tables, indexes, and RLS policies for AI Learning Path.

CREATE TABLE IF NOT EXISTS public.learning_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    code_input TEXT NOT NULL,
    language TEXT,
    difficulty_level TEXT NOT NULL,
    estimated_learning_time TEXT NOT NULL,
    interview_readiness_score INTEGER NOT NULL,
    mentor_advice TEXT NOT NULL,
    concepts_detected JSONB NOT NULL DEFAULT '[]'::jsonb,
    prerequisites JSONB NOT NULL DEFAULT '[]'::jsonb,
    knowledge_gaps JSONB NOT NULL DEFAULT '[]'::jsonb,
    recommended_next_topics JSONB NOT NULL DEFAULT '[]'::jsonb,
    practice_plan JSONB NOT NULL DEFAULT '[]'::jsonb,
    suggested_resources JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Foreign Key Constraint referencing profiles
    CONSTRAINT fk_learning_history_profiles 
        FOREIGN KEY (user_id) 
        REFERENCES public.profiles(id) 
        ON DELETE CASCADE
);

-- Indexing for user filter speed
CREATE INDEX IF NOT EXISTS learning_history_user_id_created_at_idx 
    ON public.learning_history (user_id, created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.learning_history ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view their learning history entries
DROP POLICY IF EXISTS "Allow users to view their own learning history" ON public.learning_history;
CREATE POLICY "Allow users to view their own learning history"
    ON public.learning_history FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Allow authenticated users to insert learning history entries
DROP POLICY IF EXISTS "Allow users to insert their own learning history" ON public.learning_history;
CREATE POLICY "Allow users to insert their own learning history"
    ON public.learning_history FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to delete learning history entries
DROP POLICY IF EXISTS "Allow users to delete their own learning history" ON public.learning_history;
CREATE POLICY "Allow users to delete their own learning history"
    ON public.learning_history FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
