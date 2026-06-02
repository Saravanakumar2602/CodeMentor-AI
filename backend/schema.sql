-- CODE MENTOR AI: DATABASE SCHEMA SETUP
-- Run this in your Supabase SQL Editor to set up the necessary tables, triggers, and Row Level Security.

-- 1. Create profiles table (stores additional user profile information mapped from auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Allow users to read their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Allow users to update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);


-- 2. Create chat_history table (stores code explanation histories)
CREATE TABLE IF NOT EXISTS public.chat_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    code_input TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for chat_history
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

-- Chat History RLS Policies
CREATE POLICY "Allow users to view their own chat history"
    ON public.chat_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own chat history"
    ON public.chat_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own chat history"
    ON public.chat_history FOR DELETE
    USING (auth.uid() = user_id);


-- 3. Automatic profiles sync trigger
-- This trigger automatically inserts a record into public.profiles when a user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (new.id, new.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
