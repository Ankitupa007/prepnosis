'use client';

import React from 'react';
import { QuestionState, QUESTION_STATE_COLORS, QUESTION_STATE_LABELS } from '@/lib/constants/exam-patterns';
import { cn } from '@/lib/utils';

interface QuestionNavigatorProps {
    totalQuestions: number;
    currentQuestionIndex: number;
    questionStates: Record<number, QuestionState>;
    onNavigate: (index: number) => void;
    disabled?: boolean;
}

export const QuestionNavigator: React.FC<QuestionNavigatorProps> = ({
    totalQuestions,
    currentQuestionIndex,
    questionStates,
    onNavigate,
    disabled = false,
}) => {
    // Calculate statistics
    const stats = React.useMemo(() => {
        const counts = {
            answered: 0,
            skipped: 0,
            marked_for_review: 0,
            answered_and_marked: 0,
            not_visited: 0,
            correct: 0,
            wrong: 0,
        };

        for (let i = 0; i < totalQuestions; i++) {
            const state = questionStates[i] || 'not_visited';
            counts[state]++;
        }

        return counts;
    }, [questionStates, totalQuestions]);

    return (
        <div className="bg-card rounded-lg border p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Question Navigator</h3>
                <span className="text-xs text-muted-foreground">
                    {currentQuestionIndex + 1} of {totalQuestions}
                </span>
            </div>

            {/* Question Grid */}
            <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: totalQuestions }, (_, i) => {
                    const state = questionStates[i] || 'not_visited';
                    const isCurrent = i === currentQuestionIndex;

                    return (
                        <button
                            key={i}
                            onClick={() => !disabled && onNavigate(i)}
                            disabled={disabled}
                            className={cn(
                                'aspect-square rounded-md text-sm font-medium transition-all',
                                'flex items-center justify-center',
                                QUESTION_STATE_COLORS[state],
                                isCurrent && 'ring-2 ring-primary ring-offset-2',
                                disabled && 'opacity-50 cursor-not-allowed'
                            )}
                        >
                            {i + 1}
                        </button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="space-y-2 pt-2 border-t">
                <p className="text-xs font-medium text-muted-foreground">Legend</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-green-500" />
                        <span>Answered ({stats.answered})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-orange-500" />
                        <span>Marked ({stats.marked_for_review})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-purple-500" />
                        <span>Ans & Marked ({stats.answered_and_marked})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded border-2 border-gray-300 bg-white" />
                        <span>Skipped ({stats.skipped})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-gray-200" />
                        <span>Not Visited ({stats.not_visited})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-green-500 ring-2 ring-green-600 ring-offset-1" />
                        <span>Correct ({stats.correct})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-red-500 ring-2 ring-red-600 ring-offset-1" />
                        <span>Wrong ({stats.wrong})</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
