export interface Test {
  id: string;
  title: string;
  description: string;
  test_type: string;
  test_mode: string;
  exam_pattern: string;
  total_questions: number;
  total_marks: number;
  duration_minutes: number;
  negative_marking: number | null;
  sections: number[];
  scheduled_at: string | null;
  expires_at: string | null;
  created_at: string;
  created_by: string;
  share_code: string | null;
  subjects: any[] | string;
  user_attempt?: {
    id: string;
    is_completed: boolean;
    section_times: {
      section: number;
      start_time: string | null;
      remaining_seconds: number;
    }[];
    current_section: number;
  };
}
export interface GrandTest {
  id: string;
  title: string;
  description: string | null;
  test_type: "grand_test";
  test_mode: "regular" | "exam";
  exam_pattern: "NEET_PG" | "INICET";
  total_questions: number;
  total_marks: number;
  duration_minutes: number;
  negative_marking: number;
  sections: any;
  is_active: boolean;
  created_by: string;
  created_at: string;
  total_participants?: number;
  user_attempt?: {
    id: string;
    total_score: number;
    correct_answers: number;
    incorrect_answers: number;
    unanswered: number;
    is_completed: boolean;
    submitted_at: string | null;
    time_taken_minutes: number;
  } | null;
  user_ranking?: {
    rank: number;
    percentile: number;
    score: number;
  } | null;
}
export interface TestQuestion {
  id: string;
  question_id: string;
  question_order: number;
  marks: number;
  section_number: number;
  question: {
    id: string;
    question_text: string;
    explanation: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    images: string[];
    correct_option: number;
    difficulty_level: string;
    subjects?: { name: string };
    topics?: { name: string };
  };
  user_answer: {
    selected_option: number | null;
    is_marked_for_review: boolean;
  } | null;
}

export interface UserAnswer {
  questionId: string;
  selectedOption: number | null;
  isCorrect: boolean;
}

export interface Results {
  total_score: number;
  correct_answers: number;
  incorrect_answers: number;
  unanswered: number;
  time_taken_minutes: number;
  total_questions: number;
  accuracy: number;
  current_section: number;
  next_section: number | null;
  message?: string;
}
