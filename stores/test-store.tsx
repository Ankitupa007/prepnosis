import { create } from "zustand";
import {
  Test,
  TestQuestion,
  UserAnswer,
  Results,
} from "@/lib/types/grand-tests-types";

interface TestState {
  test: Test | null;
  questions: TestQuestion[];
  currentQuestionIndex: number;
  userAnswers: UserAnswer[];
  currentSection: number;
  remainingSeconds: number;
  testStarted: boolean;
  testCompleted: boolean;
  isSubmitted: boolean;
  showReviewMode: boolean;
  results: Results | null;
  attemptId: string | null;
  setTest: (test: Test) => void;
  setQuestions: (questions: TestQuestion[]) => void;
  setCurrentQuestionIndex: (index: number) => void;
  setUserAnswers: (answers: UserAnswer[]) => void;
  setCurrentSection: (section: number) => void;
  setRemainingSeconds: (seconds: number) => void;
  setTestStarted: (started: boolean) => void;
  setTestCompleted: (completed: boolean) => void;
  setIsSubmitted: (submitted: boolean) => void;
  setShowReviewMode: (review: boolean) => void;
  setResults: (results: Results) => void;
  setAttemptId: (id: string | null) => void;
}

const useTestStore = create<TestState>((set) => ({
  test: null,
  questions: [],
  currentQuestionIndex: 0,
  userAnswers: [],
  currentSection: 1,
  remainingSeconds: 60,
  testStarted: false,
  testCompleted: false,
  isSubmitted: false,
  showReviewMode: false,
  results: null,
  attemptId: null,
  setTest: (test) => set({ test }),
  setQuestions: (questions) => set({ questions }),
  setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),
  setUserAnswers: (answers) => set({ userAnswers: answers }),
  setCurrentSection: (section) => set({ currentSection: section }),
  setRemainingSeconds: (seconds) => set({ remainingSeconds: seconds }),
  setTestStarted: (started) => set({ testStarted: started }),
  setTestCompleted: (completed) => set({ testCompleted: completed }),
  setIsSubmitted: (submitted) => set({ isSubmitted: submitted }),
  setShowReviewMode: (review) => set({ showReviewMode: review }),
  setResults: (results) => set({ results }),
  setAttemptId: (id) => set({ attemptId: id }),
}));

export default useTestStore;
