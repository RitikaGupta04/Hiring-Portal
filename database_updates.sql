-- Enhanced Database Schema for Scoring and Ranking System
-- Run these SQL commands in your Supabase SQL editor

-- 1. Add scoring criteria table
CREATE TABLE IF NOT EXISTS scoring_criteria (
    id SERIAL PRIMARY KEY,
    criteria_name TEXT NOT NULL UNIQUE,
    weight DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    max_score INTEGER NOT NULL DEFAULT 100,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add scoring breakdown table
CREATE TABLE IF NOT EXISTS application_scores (
    id SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES faculty_applications(id) ON DELETE CASCADE,
    criteria_id INTEGER NOT NULL REFERENCES scoring_criteria(id),
    score DECIMAL(5,2) NOT NULL DEFAULT 0,
    max_possible_score DECIMAL(5,2) NOT NULL,
    weighted_score DECIMAL(5,2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(application_id, criteria_id)
);

-- 3. Add ML model results table
CREATE TABLE IF NOT EXISTS ml_model_results (
    id SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES faculty_applications(id) ON DELETE CASCADE,
    model_name TEXT NOT NULL,
    model_version TEXT NOT NULL,
    prediction_score DECIMAL(5,2) NOT NULL,
    confidence_level DECIMAL(5,2) NOT NULL,
    features_used JSONB,
    model_metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Add application documents table
CREATE TABLE IF NOT EXISTS application_documents (
    id SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES faculty_applications(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL, -- 'resume', 'cover_letter', 'teaching_statement', 'research_statement', 'publications'
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Insert default scoring criteria
INSERT INTO scoring_criteria (criteria_name, weight, max_score, description) VALUES
('Education & Qualifications', 0.20, 100, 'PhD, Masters, relevant degrees'),
('Research Experience', 0.25, 100, 'Publications, research projects, grants'),
('Teaching Experience', 0.20, 100, 'Teaching history, student feedback, courses taught'),
('Industry Experience', 0.15, 100, 'Professional experience, industry relevance'),
('Publications & Citations', 0.10, 100, 'Number and quality of publications'),
('Awards & Recognition', 0.05, 100, 'Academic awards, honors, recognition'),
('Communication Skills', 0.05, 100, 'Interview performance, presentation skills')
ON CONFLICT (criteria_name) DO NOTHING;

-- 6. Create scoring function
CREATE OR REPLACE FUNCTION calculate_application_score(application_id_param INTEGER)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    total_weighted_score DECIMAL(5,2) := 0;
    total_weight DECIMAL(5,2) := 0;
    criteria_record RECORD;
BEGIN
    -- Calculate weighted score for each criteria
    FOR criteria_record IN 
        SELECT sc.id, sc.weight, sc.max_score, 
               COALESCE(aps.score, 0) as actual_score
        FROM scoring_criteria sc
        LEFT JOIN application_scores aps ON sc.id = aps.criteria_id 
            AND aps.application_id = application_id_param
        WHERE sc.is_active = true
    LOOP
        total_weighted_score := total_weighted_score + 
            (criteria_record.actual_score * criteria_record.weight);
        total_weight := total_weight + criteria_record.weight;
    END LOOP;
    
    -- Return normalized score (0-100)
    IF total_weight > 0 THEN
        RETURN (total_weighted_score / total_weight);
    ELSE
        RETURN 0;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 7. Create ranking function
CREATE OR REPLACE FUNCTION update_application_rankings()
RETURNS VOID AS $$
BEGIN
    -- Update rankings based on scores within each department and position
    WITH ranked_applications AS (
        SELECT 
            id,
            department,
            position,
            score,
            ROW_NUMBER() OVER (
                PARTITION BY department, position 
                ORDER BY score DESC, created_at ASC
            ) as new_rank
        FROM faculty_applications
        WHERE score > 0
    )
    UPDATE faculty_applications 
    SET rank = ranked_applications.new_rank
    FROM ranked_applications
    WHERE faculty_applications.id = ranked_applications.id;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger to auto-calculate scores
CREATE OR REPLACE FUNCTION trigger_calculate_score()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate and update the main score
    UPDATE faculty_applications 
    SET score = calculate_application_score(NEW.application_id)
    WHERE id = NEW.application_id;
    
    -- Update rankings
    PERFORM update_application_rankings();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Create trigger
DROP TRIGGER IF EXISTS auto_calculate_score ON application_scores;
CREATE TRIGGER auto_calculate_score
    AFTER INSERT OR UPDATE OR DELETE ON application_scores
    FOR EACH ROW
    EXECUTE FUNCTION trigger_calculate_score();

-- 10. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_application_scores_app_id ON application_scores(application_id);
CREATE INDEX IF NOT EXISTS idx_application_scores_criteria_id ON application_scores(criteria_id);
CREATE INDEX IF NOT EXISTS idx_ml_model_results_app_id ON ml_model_results(application_id);
CREATE INDEX IF NOT EXISTS idx_application_documents_app_id ON application_documents(application_id);

-- 11. Add RLS policies for new tables
ALTER TABLE scoring_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_model_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_documents ENABLE ROW LEVEL SECURITY;

-- Policies for scoring_criteria (read-only for all authenticated users)
CREATE POLICY "Anyone can read scoring criteria" ON scoring_criteria FOR SELECT USING (true);

-- Policies for application_scores
CREATE POLICY "Users can read own scores" ON application_scores 
FOR SELECT USING (application_id IN (
    SELECT id FROM faculty_applications WHERE user_id = auth.uid()
));

-- Policies for ml_model_results
CREATE POLICY "Users can read own ml results" ON ml_model_results 
FOR SELECT USING (application_id IN (
    SELECT id FROM faculty_applications WHERE user_id = auth.uid()
));

-- Policies for application_documents
CREATE POLICY "Users can read own documents" ON application_documents 
FOR SELECT USING (application_id IN (
    SELECT id FROM faculty_applications WHERE user_id = auth.uid()
));
