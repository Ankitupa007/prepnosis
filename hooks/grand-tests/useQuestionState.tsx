'use client';

import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QuestionState } from '@/lib/constants/exam-patterns';
import { toast } from 'sonner';

interface QuestionStateData {
    questionId: string;
    selectedOption: number | null;
    isMarkedForReview: boolean;
    isCorrect: boolean;
    sectionNumber: number;
}

interface UseQuestionStateProps {
    attemptId: string;
    testId: string;
    currentSection: number;
    initialStates?: Record<string, QuestionStateData>;
}

export const useQuestionState = ({
    attemptId,
    testId,
    currentSection,
    initialStates = {},
}: UseQuestionStateProps) => {
    const queryClient = useQueryClient();
    const [localStates, setLocalStates] = useState<Record<string, QuestionStateData>>(initialStates);
    const [pendingSaves, setPendingSaves] = useState<Set<string>>(new Set());

    // Sync initial states
    useEffect(() => {
        setLocalStates(initialStates);
    }, [initialStates]);

    // Mutation for saving answer
    const saveAnswerMutation = useMutation({
        mutationFn: async (answer: QuestionStateData) => {
            const response = await fetch(`/api/grand-tests/${testId}/answer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    attemptId,
                    answer,
                    currentSection,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save answer');
            }

            return response.json();
        },
        onSuccess: (data, variables) => {
            // Remove from pending saves
            setPendingSaves((prev) => {
                const newSet = new Set(prev);
                newSet.delete(variables.questionId);
                return newSet;
            });

            // Invalidate test query to refresh data
            queryClient.invalidateQueries({ queryKey: ['grandTest', testId] });
        },
        onError: (error, variables) => {
            console.error('Error saving answer:', error);
            toast.error('Failed to save answer');

            // Remove from pending saves
            setPendingSaves((prev) => {
                const newSet = new Set(prev);
                newSet.delete(variables.questionId);
                return newSet;
            });
        },
    });

    // Update question state locally and queue for save
    const updateQuestionState = useCallback(
        (questionId: string, update: Partial<QuestionStateData>) => {
            setLocalStates((prev) => {
                const current = prev[questionId] || {
                    questionId,
                    selectedOption: null,
                    isMarkedForReview: false,
                    isCorrect: false,
                    sectionNumber: currentSection,
                };

                const updated = { ...current, ...update };

                // Add to pending saves
                setPendingSaves((pendingSet) => new Set(pendingSet).add(questionId));

                // Debounced save
                setTimeout(() => {
                    saveAnswerMutation.mutate(updated);
                }, 500);

                return { ...prev, [questionId]: updated };
            });
        },
        [currentSection, saveAnswerMutation]
    );

    // Select answer
    const selectAnswer = useCallback(
        (questionId: string, selectedOption: number, correctOption: number) => {
            updateQuestionState(questionId, {
                selectedOption,
                isCorrect: selectedOption === correctOption,
            });
        },
        [updateQuestionState]
    );

    // Clear answer
    const clearAnswer = useCallback(
        (questionId: string) => {
            updateQuestionState(questionId, {
                selectedOption: null,
                isCorrect: false,
            });
        },
        [updateQuestionState]
    );

    // Toggle mark for review
    const toggleMarkForReview = useCallback(
        (questionId: string) => {
            setLocalStates((prev) => {
                const current = prev[questionId];
                if (!current) return prev;

                const updated = {
                    ...current,
                    isMarkedForReview: !current.isMarkedForReview,
                };

                // Save immediately
                saveAnswerMutation.mutate(updated);

                return { ...prev, [questionId]: updated };
            });
        },
        [saveAnswerMutation]
    );

    // Get question state
    const getQuestionState = useCallback(
        (questionId: string): QuestionState => {
            const state = localStates[questionId];

            if (!state) return 'not_visited';

            if (state.selectedOption === null && !state.isMarkedForReview) {
                return 'skipped';
            } else if (state.selectedOption !== null && !state.isMarkedForReview) {
                return 'answered';
            } else if (state.selectedOption === null && state.isMarkedForReview) {
                return 'marked_for_review';
            } else {
                return 'answered_and_marked';
            }
        },
        [localStates]
    );

    // Get all question states
    const getAllQuestionStates = useCallback((): Record<number, QuestionState> => {
        const states: Record<number, QuestionState> = {};
        Object.entries(localStates).forEach(([questionId, data], index) => {
            states[index] = getQuestionState(questionId);
        });
        return states;
    }, [localStates, getQuestionState]);

    return {
        localStates,
        selectAnswer,
        clearAnswer,
        toggleMarkForReview,
        getQuestionState,
        getAllQuestionStates,
        isSaving: saveAnswerMutation.isPending || pendingSaves.size > 0,
    };
};
