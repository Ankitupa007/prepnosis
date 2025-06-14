// lib/types/test.ts

export type TestType = 'custom' | 'grand_test';
export type TestMode = 'regular' | 'exam';
export type ExamPattern = 'NEET_PG' | 'INICET';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type ChoiceType = 'single' | 'multiple';

export interface Test {
  id: string
  title: string
  description?: string
  test_type: 'custom' | 'grand_test'
  test_mode: 'regular' | 'exam'
  exam_pattern: 'NEET_PG' | 'INICET'
  total_questions: number
  total_marks: number
  duration_minutes: number
  negative_marking: number
  sections?: any
  is_active: boolean
  created_by: string
  created_at: string
  scheduled_at?: string
  expires_at?: string
  share_code?: string
  is_shareable: boolean
  shared_at?: string
  share_expires_at?: string
}
export interface TestSection {
  id: string;
  name: string;
  questions: number;
  duration: number;
  marks: number;
  order: number;
}

export interface Question {
  id: string
  question_text: string
  explanation?: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: number
  choice_type: 'single' | 'multiple'
  subject_id: string
  topic_id: string
  difficulty_level: 'easy' | 'medium' | 'hard'
  exam_types: string[]
  is_active: boolean
  created_at: string
}

export interface TestQuestion {
  id: string;
  test_id: string;
  question_id: string;
  section_number: number;
  question_order: number;
  marks: number;
  question?: Question;
}

export interface UserTestAttempt {
  id: string;
  user_id: string;
  test_id: string;
  started_at: string;
  submitted_at?: string;
  total_score: number;
  correct_answers: number;
  incorrect_answers: number;
  unanswered: number;
  time_taken_minutes: number;
  is_completed: boolean;
  section_times?: Record<string, number>;
  created_at: string;
}

export interface UserAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_option?: 1 | 2 | 3 | 4;
  is_correct?: boolean;
  marks_awarded: number;
  time_taken_seconds: number;
  is_marked_for_review: boolean;
  answered_at: string;
}

export interface TestRanking {
  id: string;
  test_id: string;
  user_id: string;
  attempt_id: string;
  rank: number;
  score: number;
  percentile: number;
  total_participants: number;
  created_at: string;
}

export interface TestAttemptWithDetails extends UserTestAttempt {
  test: Test;
  answers: UserAnswer[];
  ranking?: TestRanking;
}

export interface TestStats {
  total_attempts: number;
  average_score: number;
  highest_score: number;
  average_time: number;
  completion_rate: number;
}

export interface SubjectPerformance {
  subject_id: string;
  subject_name: string;
  total_questions_attempted: number;
  correct_answers: number;
  accuracy_percentage: number;
  average_time_per_question: number;
  strength_level: 'weak' | 'beginner' | 'intermediate' | 'strong';
}

export interface TopicPerformance {
  topic_id: string;
  topic_name: string;
  subject_id: string;
  subject_name: string;
  total_questions_attempted: number;
  correct_answers: number;
  accuracy_percentage: number;
  strength_level: 'weak' | 'beginner' | 'intermediate' | 'strong';
}


export interface SubjectPolygonData {
  subject: {
    id: string;
    name: string;
    weightage: number;
    icon_name: string;
  };
  accuracyMetrics: {
    overall: number;
    topicBased: number;
    testBased: number;
    strength: number;
    consistency: number;
    activity: number;
  };
  stats: {
    questionsAttempted: number;
    topicsStudied: number;
    testQuestions: number;
    strengthDistribution: {
      weak: number;
      beginner: number;
      intermediate: number;
      strong: number;
    };
  };
  polygon: Array<{
    x: number;
    y: number;
    value: number;
    label: string;
  }>;
}

export interface TestCardProps {
  test: CustomTest
  onStart: () => void
  onView: () => void
  onDelete: () => void
  bestScore: number | null
  isDeleting: boolean
}


export interface TestAttempt {
  id: string
  score: number
  total_questions: number
  correct_answers: number
  completed_at: string
  time_taken: number
}

export interface CustomTest {
  id: string
  title: string
  description: string
  test_mode: 'regular' | 'exam'
  total_questions: number
  total_marks: number
  created_at: string
  share_code: string
  attempts: TestAttempt[]
  subjects: Array<{
    id: string
    name: string
  }>
  _count: {
    attempts: number
  }
}
export interface CustomTestsResponse {
  tests: CustomTest[]
}

export interface UseCustomTestsReturn {
  // Tests
  customTests: CustomTest[];//User's custom tests
  isLoadingCustomTests: boolean; // New: Loading state for user custom tests
  customTestsError: Error | null; // New: Error state for user custom tests

  // Test operations
  createCustomTest: (testData: Partial<Test>) => Promise<Test>;
  updateCustomTest: (id: string, testData: Partial<Test>) => Promise<Test>;
  deleteCustomTest: (id: string) => Promise<void>; // New: Delete custom test

  // Test attempts
  startCustomTest: (testId: string) => Promise<{ attemptId: string }>;
  submitCustomTest: (attemptId: string, answers: any[]) => Promise<UserTestAttempt>;
  getUserAttempts: (testId?: string) => UserTestAttempt[];
  getUserAttemptForTest: (testId: string) => UserTestAttempt | undefined;

  // Rankings and stats

  // Utility functions
  getCustomTestById: (testId: string) => CustomTest | undefined; // New: Get custom test by ID
  refetchCustomTests: () => void; // New: Refetch user custom tests
  isCreatingCustomTest: boolean;
  isUpdatingCustomTest: boolean;
  isDeletingCustomTest: boolean; // New: Deleting custom test state
}