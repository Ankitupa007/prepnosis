// lib/store/testStore.js
import { create } from "zustand";

const useTestStore = create((set) => ({
  currentSection: 1,
  currentQuestion: 1,
  answers: {}, // { question_id: selected_answer }
  setCurrentSection: (section: any) => set({ currentSection: section }),
  setCurrentQuestion: (question: any) => set({ currentQuestion: question }),
  setAnswer: (questionId: any, answer: any) =>
    set((state: any) => ({
      answers: { ...state.answers, [questionId]: answer },
    })),
}));
export default useTestStore;
