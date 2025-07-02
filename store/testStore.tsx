// lib/stores/test-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Question {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: number;
  explanation: string | null;
  section_number: number;
  marks: number;
  images: any[];
}

export interface Answer {
  question_id: string;
  selected_option: number | null;
  is_marked_for_review: boolean;
  time_taken_seconds: number;
}

export interface SectionTime {
  section: number;
  start_time: number;
  end_time: number | null;
  time_spent: number;
}

export interface TestState {
  // Test data
  test_id: string | null;
  attempt_id: string | null;
  questions: Question[];
  answers: Record<string, Answer>;

  // Navigation
  current_section: number;
  current_question_index: number;

  // Timer
  section_start_time: number | null;
  section_time_remaining: number; // in seconds
  section_times: SectionTime[];

  // Test state
  is_test_started: boolean;
  is_test_completed: boolean;
  is_section_locked: boolean;

  // Actions
  initializeTest: (
    testId: string,
    attemptId: string,
    questions: Question[]
  ) => void;
  setAnswer: (questionId: string, selectedOption: number | null) => void;
  toggleMarkForReview: (questionId: string) => void;
  navigateToQuestion: (index: number) => void;
  moveToNextSection: () => void;
  setTimeRemaining: (seconds: number) => void;
  startSectionTimer: () => void;
  endSection: () => void;
  submitTest: () => void;
  resetTest: () => void;

  // Getters
  getCurrentQuestion: () => Question | null;
  getSectionQuestions: (section: number) => Question[];
  getAnsweredCount: (section: number) => number;
  getMarkedForReviewCount: (section: number) => number;
  getUnansweredCount: (section: number) => number;
}

export const useTestStore = create<TestState>()(
  persist(
    (set, get) => ({
      // Initial state
      test_id: null,
      attempt_id: null,
      questions: [],
      answers: {},
      current_section: 1,
      current_question_index: 0,
      section_start_time: null,
      section_time_remaining: 42 * 60, // 42 minutes in seconds
      section_times: [],
      is_test_started: false,
      is_test_completed: false,
      is_section_locked: false,

      // Actions
      initializeTest: (testId, attemptId, questions) => {
        set({
          test_id: testId,
          attempt_id: attemptId,
          questions,
          current_section: 1,
          current_question_index: 0,
          section_time_remaining: 42 * 60,
          is_test_started: true,
          section_start_time: Date.now(),
        });
      },

      setAnswer: (questionId, selectedOption) => {
        const state = get();
        set({
          answers: {
            ...state.answers,
            [questionId]: {
              ...state.answers[questionId],
              question_id: questionId,
              selected_option: selectedOption,
              is_marked_for_review:
                state.answers[questionId]?.is_marked_for_review || false,
              time_taken_seconds:
                state.answers[questionId]?.time_taken_seconds || 0,
            },
          },
        });
      },

      toggleMarkForReview: (questionId) => {
        const state = get();
        set({
          answers: {
            ...state.answers,
            [questionId]: {
              ...state.answers[questionId],
              question_id: questionId,
              selected_option:
                state.answers[questionId]?.selected_option || null,
              is_marked_for_review:
                !state.answers[questionId]?.is_marked_for_review,
              time_taken_seconds:
                state.answers[questionId]?.time_taken_seconds || 0,
            },
          },
        });
      },

      navigateToQuestion: (index) => {
        const state = get();
        const sectionQuestions = state.getSectionQuestions(
          state.current_section
        );
        if (index >= 0 && index < sectionQuestions.length) {
          set({ current_question_index: index });
        }
      },

      moveToNextSection: () => {
        const state = get();
        if (state.current_section < 5) {
          set({
            current_section: state.current_section + 1,
            current_question_index: 0,
            section_time_remaining: 42 * 60,
            section_start_time: Date.now(),
          });
        } else {
          state.submitTest();
        }
      },

      setTimeRemaining: (seconds) => {
        set({ section_time_remaining: seconds });
      },

      startSectionTimer: () => {
        set({ section_start_time: Date.now() });
      },

      endSection: () => {
        const state = get();
        const newSectionTimes = [...state.section_times];
        const currentSectionTime = newSectionTimes.find(
          (st) => st.section === state.current_section
        );

        if (currentSectionTime && state.section_start_time) {
          currentSectionTime.end_time = Date.now();
          currentSectionTime.time_spent =
            currentSectionTime.end_time - state.section_start_time;
        } else if (state.section_start_time) {
          newSectionTimes.push({
            section: state.current_section,
            start_time: state.section_start_time,
            end_time: Date.now(),
            time_spent: Date.now() - state.section_start_time,
          });
        }

        set({
          section_times: newSectionTimes,
          is_section_locked: true,
        });
      },

      submitTest: () => {
        set({
          is_test_completed: true,
          is_section_locked: true,
        });
      },

      resetTest: () => {
        set({
          test_id: null,
          attempt_id: null,
          questions: [],
          answers: {},
          current_section: 1,
          current_question_index: 0,
          section_start_time: null,
          section_time_remaining: 42 * 60,
          section_times: [],
          is_test_started: false,
          is_test_completed: false,
          is_section_locked: false,
        });
      },

      // Getters
      getCurrentQuestion: () => {
        const state = get();
        const sectionQuestions = state.getSectionQuestions(
          state.current_section
        );
        return sectionQuestions[state.current_question_index] || null;
      },

      getSectionQuestions: (section) => {
        const state = get();
        return state.questions.filter((q) => q.section_number === section);
      },

      getAnsweredCount: (section) => {
        const state = get();
        const sectionQuestions = state.getSectionQuestions(section);
        return sectionQuestions.filter(
          (q) =>
            state.answers[q.id]?.selected_option !== null &&
            state.answers[q.id]?.selected_option !== undefined
        ).length;
      },

      getMarkedForReviewCount: (section) => {
        const state = get();
        const sectionQuestions = state.getSectionQuestions(section);
        return sectionQuestions.filter(
          (q) => state.answers[q.id]?.is_marked_for_review === true
        ).length;
      },

      getUnansweredCount: (section) => {
        const state = get();
        const sectionQuestions = state.getSectionQuestions(section);
        return sectionQuestions.filter(
          (q) => !state.answers[q.id]?.selected_option
        ).length;
      },
    }),
    {
      name: "neet-test-storage",
      partialize: (state) => ({
        test_id: state.test_id,
        attempt_id: state.attempt_id,
        questions: state.questions,
        answers: state.answers,
        current_section: state.current_section,
        current_question_index: state.current_question_index,
        section_start_time: state.section_start_time,
        section_time_remaining: state.section_time_remaining,
        section_times: state.section_times,
        is_test_started: state.is_test_started,
        is_test_completed: state.is_test_completed,
      }),
    }
  )
);
