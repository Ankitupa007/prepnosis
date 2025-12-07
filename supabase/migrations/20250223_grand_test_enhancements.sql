-- Migration: Grand Test Enhancements for NEET-PG and INICET Support
-- Description: Add indexes and columns for improved performance and question state management

-- Add section_number to user_grand_tests_answers for faster section-wise queries
ALTER TABLE public.user_grand_tests_answers 
ADD COLUMN IF NOT EXISTS section_number integer DEFAULT 1;

-- Add question_state enum for better state tracking
DO $$ BEGIN
    CREATE TYPE question_state AS ENUM (
        'not_visited',
        'skipped', 
        'answered',
        'marked_for_review',
        'answered_and_marked'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add question_state column to user_grand_tests_answers
ALTER TABLE public.user_grand_tests_answers 
ADD COLUMN IF NOT EXISTS question_state question_state DEFAULT 'not_visited';

-- Create composite index for faster attempt + section queries
CREATE INDEX IF NOT EXISTS idx_grand_answers_attempt_section 
ON public.user_grand_tests_answers(attempt_id, section_number);

-- Create index for faster test + section queries on questions
CREATE INDEX IF NOT EXISTS idx_grand_questions_test_section 
ON public.grand_tests_questions(test_id, section_number);

-- Create index for faster user + test queries on attempts
CREATE INDEX IF NOT EXISTS idx_grand_attempts_user_test 
ON public.user_grand_tests_attempts(user_id, test_id);

-- Create index for faster ranking queries
CREATE INDEX IF NOT EXISTS idx_test_rankings_test_rank 
ON public.test_rankings(test_id, rank);

-- Add unique constraint to prevent duplicate answers for same question in attempt
CREATE UNIQUE INDEX IF NOT EXISTS idx_grand_answers_unique_attempt_question 
ON public.user_grand_tests_answers(attempt_id, question_id);

-- Update existing records to set section_number based on question
UPDATE public.user_grand_tests_answers ua
SET section_number = q.section_number
FROM public.grand_tests_questions q
WHERE ua.question_id = q.id
AND ua.section_number IS NULL;

-- Function to automatically update question_state based on answer data
CREATE OR REPLACE FUNCTION update_question_state()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.selected_option IS NULL AND NEW.is_marked_for_review = false THEN
        NEW.question_state := 'skipped';
    ELSIF NEW.selected_option IS NOT NULL AND NEW.is_marked_for_review = false THEN
        NEW.question_state := 'answered';
    ELSIF NEW.selected_option IS NULL AND NEW.is_marked_for_review = true THEN
        NEW.question_state := 'marked_for_review';
    ELSIF NEW.selected_option IS NOT NULL AND NEW.is_marked_for_review = true THEN
        NEW.question_state := 'answered_and_marked';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update question_state
DROP TRIGGER IF EXISTS trigger_update_question_state ON public.user_grand_tests_answers;
CREATE TRIGGER trigger_update_question_state
    BEFORE INSERT OR UPDATE ON public.user_grand_tests_answers
    FOR EACH ROW
    EXECUTE FUNCTION update_question_state();

-- Add comment for documentation
COMMENT ON COLUMN public.user_grand_tests_answers.question_state IS 
'Tracks the state of each question: not_visited, skipped, answered, marked_for_review, answered_and_marked';

COMMENT ON COLUMN public.user_grand_tests_answers.section_number IS 
'Denormalized section number for faster section-wise queries';
