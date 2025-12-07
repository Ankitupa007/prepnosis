import { QuestionState } from '../constants/exam-patterns';

export interface Test {
  id: string;
  title: string;
  description: string;
  test_type: string;
  test_mode: string;
  exam_pattern: 'NEET_PG' | 'INICET';
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
  user_attempt?: UserAttempt;
}

export interface UserAttempt {
  id: string;
  is_completed: boolean;
  current_section: number;
  section_times: SectionTime[];
  started_at: string;
  submitted_at: string | null;
  total_score: number | null;
  correct_answers: number;
  incorrect_answers: number;
  unanswered: number;
  time_taken_minutes: number;
}

export interface SectionTime {
  section: number;
  start_time: string | null;
  remaining_seconds: number;
  is_submitted: boolean;
}

export interface GrandTest {
  id: string;
  title: string;
  description: string | null;
  test_type: 'grand_test';
  test_mode: 'regular' | 'exam';
  exam_pattern: 'NEET_PG' | 'INICET';
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
    current_section: number;
  } | null;
  user_ranking?: {
    rank: number;
    percentile: number;
    score: number;
  } | null;
}

export interface Question {
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
  subject_id: string;
  topic_id: string;
  subjects?: { name: string };
  topics?: { name: string };
}

export interface TestQuestion {
  id: string;
  question_id: string;
  question_order: number;
  marks: number;
  section_number: number;
  question: Question;
  user_answer: UserAnswerData | null;
}

export interface UserAnswerData {
  selected_option: number | null;
  is_marked_for_review: boolean;
  question_state?: QuestionState;
}

export interface UserAnswer {
  questionId: string;
  selectedOption: number | null;
  isCorrect: boolean;
  isMarkedForReview?: boolean;
  questionState?: QuestionState;
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

export interface SectionStats {
  section: number;
  total: number;
  answered: number;
  skipped: number;
  markedForReview: number;
  answeredAndMarked: number;
  notVisited: number;
}

export interface TestAnalysis {
  overall: {
    totalScore: number;
    maxScore: number;
    percentage: number;
    rank: number;
    percentile: number;
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    unanswered: number;
    accuracy: number;
    timeTaken: number;
  };
  sectionWise: {
    section: number;
    score: number;
    maxScore: number;
    correct: number;
    incorrect: number;
    unanswered: number;
    accuracy: number;
    timeTaken: number;
  }[];
  subjectWise: {
    subjectName: string;
    score: number;
    maxScore: number;
    correct: number;
    incorrect: number;
    unanswered: number;
    accuracy: number;
  }[];
}
