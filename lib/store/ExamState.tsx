import { create } from 'zustand';
import { TestQuestion } from '../types/test';

interface ExamState {
  questions: TestQuestion[];
  currentQuestionIndex: number;
  answers: Record<number, number | null>; // question_id -> option_id
  marked: Set<number>;
  timeLeft: number; // seconds
  startTime: number;
  initializeExam: (questions: TestQuestion[], duration: number) => void;
  selectAnswer: (qid: number, oid: number) => void;
  toggleMark: (qid: number) => void;
  next: () => void;
  prev: () => void;
  jumpTo: (index: number) => void;
}

export const useExamStore = create<ExamState>((set) => ({
  questions: [],
  currentQuestionIndex: 0,
  answers: {},
  marked: new Set(),
  timeLeft: 0,
  startTime: Date.now(),

  initializeExam: (questions, duration) =>
    set({
      questions,
      timeLeft: duration * 60,
      answers: Object.fromEntries(questions.map((q) => [q.id, null])),
      marked: new Set(),
    }),
  selectAnswer: (qid, oid) =>
    set((s) => ({ answers: { ...s.answers, [qid]: oid } })),
  toggleMark: (qid) =>
    set((s) => {
      const marked = new Set(s.marked);
      marked.has(qid) ? marked.delete(qid) : marked.add(qid);
      return { marked };
    }),
  next: () => set((s) => ({ currentQuestionIndex: s.currentQuestionIndex + 1 })),
  prev: () => set((s) => ({ currentQuestionIndex: s.currentQuestionIndex - 1 })),
  jumpTo: (index) => set(() => ({ currentQuestionIndex: index })),
}));
