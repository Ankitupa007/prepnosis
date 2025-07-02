export interface Question {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: number;
  explanation: string;
  section_number: number;
}

export interface Test {
  id: string;
  title: string;
  description: string;
  total_questions: number;
  total_marks: number;
  duration_minutes: number;
}

export interface Attempt {
  id: string;
  total_score: number;
  correct_answers: number;
  incorrect_answers: number;
  unanswered: number;
}

export interface Ranking {
  rank: number;
  percentile: number;
}
