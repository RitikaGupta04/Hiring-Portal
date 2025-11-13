-- Fix RLS policies for testing
-- Run this in your Supabase SQL editor

-- Temporarily disable RLS for faculty_applications to allow submissions
ALTER TABLE faculty_applications DISABLE ROW LEVEL SECURITY;

-- Or create a more permissive policy for testing
-- DROP POLICY IF EXISTS "Users insert own apps" ON faculty_applications;
-- CREATE POLICY "Allow all inserts for testing" ON faculty_applications 
-- FOR INSERT WITH CHECK (true);

-- Allow all reads for admin dashboard
-- DROP POLICY IF EXISTS "Admins read all apps" ON faculty_applications;
-- CREATE POLICY "Allow all reads for testing" ON faculty_applications 
-- FOR SELECT USING (true);

-- For other tables, also disable RLS temporarily
ALTER TABLE application_scores DISABLE ROW LEVEL SECURITY;
ALTER TABLE ml_model_results DISABLE ROW LEVEL SECURITY;
ALTER TABLE application_documents DISABLE ROW LEVEL SECURITY;

-- Keep scoring_criteria readable
-- ALTER TABLE scoring_criteria DISABLE ROW LEVEL SECURITY;
