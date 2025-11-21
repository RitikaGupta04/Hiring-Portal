-- database_indexes.sql
-- Run this in Supabase SQL Editor to add performance indexes

-- ⚡ Index on faculty_applications for common queries
CREATE INDEX IF NOT EXISTS idx_faculty_applications_status 
  ON faculty_applications(status);

CREATE INDEX IF NOT EXISTS idx_faculty_applications_department 
  ON faculty_applications(department);

CREATE INDEX IF NOT EXISTS idx_faculty_applications_position 
  ON faculty_applications(position);

CREATE INDEX IF NOT EXISTS idx_faculty_applications_score 
  ON faculty_applications(score DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_faculty_applications_email 
  ON faculty_applications(email);

CREATE INDEX IF NOT EXISTS idx_faculty_applications_user_id 
  ON faculty_applications(user_id);

-- ⚡ Index on teaching_experiences for joins
CREATE INDEX IF NOT EXISTS idx_teaching_experiences_application_id 
  ON teaching_experiences(application_id);

CREATE INDEX IF NOT EXISTS idx_teaching_experiences_start_date 
  ON teaching_experiences(start_date DESC);

-- ⚡ Index on research_experiences for joins
CREATE INDEX IF NOT EXISTS idx_research_experiences_application_id 
  ON research_experiences(application_id);

CREATE INDEX IF NOT EXISTS idx_research_experiences_start_date 
  ON research_experiences(start_date DESC);

-- ⚡ Index on research_info for joins and papers
CREATE INDEX IF NOT EXISTS idx_research_info_application_id 
  ON research_info(application_id);

CREATE INDEX IF NOT EXISTS idx_research_info_papers 
  ON research_info(scopus_general_papers DESC, conference_papers DESC);

-- ⚡ Composite index for common filter combinations
CREATE INDEX IF NOT EXISTS idx_faculty_applications_dept_position_status 
  ON faculty_applications(department, position, status);

-- ⚡ Index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_faculty_applications_created_at 
  ON faculty_applications(created_at DESC);

-- ✅ Analyze tables to update statistics
ANALYZE faculty_applications;
ANALYZE teaching_experiences;
ANALYZE research_experiences;
ANALYZE research_info;

-- 📊 Check index usage (run after some time to verify indexes are being used)
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public'
-- ORDER BY idx_scan DESC;
