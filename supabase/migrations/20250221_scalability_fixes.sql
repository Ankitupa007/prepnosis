-- Function to get random questions with per-subject distribution
-- This avoids fetching thousands of rows to the application server

CREATE OR REPLACE FUNCTION get_random_questions_v2(
  p_subject_ids uuid[],
  p_counts integer[],
  p_exam_type text DEFAULT NULL
)
RETURNS SETOF questions
LANGUAGE plpgsql
AS $$
DECLARE
  v_subject_id uuid;
  v_count integer;
  i integer;
BEGIN
  -- Iterate through each subject and its corresponding count
  FOR i IN 1 .. array_length(p_subject_ids, 1)
  LOOP
    v_subject_id := p_subject_ids[i];
    v_count := p_counts[i];

    RETURN QUERY
    (
      SELECT *
      FROM questions
      WHERE subject_id = v_subject_id
        AND is_active = true
        AND (p_exam_type IS NULL OR p_exam_type = ANY(exam_types))
      ORDER BY random()
      LIMIT v_count
    );
  END LOOP;
END;
$$;
