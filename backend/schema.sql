-- ==========================================
-- CODE MENTOR AI: PRODUCTION SUPABASE SETUP
-- ==========================================
-- This file contains the complete database schema, triggers, Row Level Security (RLS)
-- policies, indexes, and storage bucket definitions for CodeMentor AI.
--
-- Instructions:
-- Run this entire script in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query).
--
-- Table of Contents:
-- 1. ENVIRONMENT VARIABLES REQUIRED
-- 2. SUPABASE PROJECT CONFIGURATION
-- 3. SCHEMA DEFINITIONS (Tables & Foreign Keys)
-- 4. PERFORMANCE INDEXES
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- 6. AUTOMATIC PROFILE CREATION TRIGGER
-- 7. STORAGE CONSIDERATIONS (Bucket Setup & Policies)
-- ==========================================


-- ==========================================
-- 1. ENVIRONMENT VARIABLES REQUIRED
-- ==========================================
/*
Below are the environment variables needed for both the Backend (FastAPI) and Frontend (Vite).
Ensure they are configured in your deployment environment (Vercel, Render, Docker, etc.) or .env files.

Backend Configuration (.env):
----------------------------------------
# Supabase URL (API -> Project URL)
SUPABASE_URL=https://<your-project-id>.supabase.co

# Supabase Service Role Key (API -> service_role key)
# IMPORTANT: Keep this secret; it bypasses RLS and is used by the backend service.
SUPABASE_KEY=ey...

# Supabase JWT Secret (API -> JWT Settings -> JWT Secret)
# Used by FastAPI to verify and decode user JWTs locally without API roundtrips.
SUPABASE_JWT_SECRET=your_jwt_secret_here

Frontend Configuration (.env):
----------------------------------------
# Supabase URL (API -> Project URL)
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co

# Supabase Anon Public Key (API -> anon public key)
# Safe to expose in frontend client code.
VITE_SUPABASE_ANON_KEY=ey...
*/


-- ==========================================
-- 2. SUPABASE PROJECT CONFIGURATION
-- ==========================================
/*
In the Supabase Dashboard, apply these settings:

1. Authentication Settings (Authentication -> Providers):
   - Email Provider: Enabled.
   - Confirm Email: Enabled (Highly recommended for production) or Disabled (for easier testing).
   - Secure Passwords: Enabled.

2. JWT Configuration (Project Settings -> API):
   - JWT Expiry: 3600 seconds (1 hour). High expiry limits pose security risks if tokens are leaked.

3. Database Connections (Project Settings -> Database):
   - Connection Pooling: Enabled (transaction mode on port 6543) for high-performance scale.
*/


-- ==========================================
-- 3. SCHEMA DEFINITIONS (Tables & Foreign Keys)
-- ==========================================

-- Enable extension for generating UUIDs (should be enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: public.profiles
-- Stores additional user profile details.
-- Keyed directly to the Supabase Auth schema auth.users table.
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Foreign Key Constraint referencing auth.users directly
    CONSTRAINT fk_profiles_auth_users 
        FOREIGN KEY (id) 
        REFERENCES auth.users(id) 
        ON DELETE CASCADE
);

-- Table: public.chat_history
-- Stores user explanation history records.
-- Links back to profiles using a foreign key constraint.
CREATE TABLE IF NOT EXISTS public.chat_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    code_input TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    language TEXT, -- Optional, saved for syntax highlighting context in frontend
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Foreign Key Constraint referencing public.profiles
    CONSTRAINT fk_chat_history_profiles 
        FOREIGN KEY (user_id) 
        REFERENCES public.profiles(id) 
        ON DELETE CASCADE
);


-- ==========================================
-- 4. PERFORMANCE INDEXES
-- ==========================================

-- Index on profiles email for fast authentication/lookup checks
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles (email);

-- Composite index for chat history to optimize retrieving a user's chats ordered by date (newest first).
-- Matches typical query: SELECT * FROM chat_history WHERE user_id = X ORDER BY created_at DESC;
CREATE INDEX IF NOT EXISTS chat_history_user_id_created_at_idx 
    ON public.chat_history (user_id, created_at DESC);


-- ==========================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on both tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

-- --- Profiles RLS Policies ---

CREATE POLICY "Allow users to read their own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Allow users to update their own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- --- Chat History RLS Policies ---

CREATE POLICY "Allow users to view their own chat history"
    ON public.chat_history FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own chat history"
    ON public.chat_history FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Delete policy allows users to manage/clear their history from frontend
CREATE POLICY "Allow users to delete their own chat history"
    ON public.chat_history FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Note: No UPDATE policy is created for chat_history as it functions as an immutable audit log of explanations.


-- ==========================================
-- 6. AUTOMATIC PROFILE CREATION TRIGGER
-- ==========================================

-- Create handle_new_user function to copy newly signed-up users from auth.users to public.profiles.
-- Utilizes ON CONFLICT to prevent user signup failure if a profile row was manually created.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, avatar_url)
    VALUES (
        new.id,
        new.email,
        coalesce(
            new.raw_user_meta_data->>'avatar_url',
            new.raw_user_meta_data->>'avatar_url_google', -- Google OAuth avatar field fallback
            null
        )
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
        updated_at = now();
        
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Prevent registration failure in case of edge failures (failsafe fallback)
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();


-- ==========================================
-- 7. STORAGE CONSIDERATIONS (Bucket Setup & Policies)
-- ==========================================

-- Create bucket 'avatars' for profile image assets (e.g. avatar uploads).
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects (usually enabled by default in Supabase storage schema)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- --- Storage RLS Policies ---

-- Policy 1: Allow public read-only access to all avatars
CREATE POLICY "Public Read Access for Avatars"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

-- Policy 2: Allow authenticated users to upload an avatar to their own folder structure (avatars/<user_id>/filename)
CREATE POLICY "Allow User Upload Own Avatar"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Policy 3: Allow authenticated users to update their own avatar in their folder structure
CREATE POLICY "Allow User Update Own Avatar"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Policy 4: Allow authenticated users to delete their own avatar in their folder structure
CREATE POLICY "Allow User Delete Own Avatar"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
