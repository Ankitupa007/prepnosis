// Exam Pattern Configuration for NEET-PG and INICET

export type ExamPatternType = 'NEET_PG' | 'INICET';

export interface SectionConfig {
    sectionNumber: number;
    questionsCount: number;
    durationMinutes: number;
    durationSeconds: number;
}

export interface ExamPatternConfig {
    name: string;
    displayName: string;
    totalQuestions: number;
    totalSections: number;
    totalDurationMinutes: number;
    marksPerQuestion: number;
    negativeMarking: number;
    sections: SectionConfig[];
}

export const EXAM_PATTERNS: Record<ExamPatternType, ExamPatternConfig> = {
    NEET_PG: {
        name: 'NEET_PG',
        displayName: 'NEET-PG',
        totalQuestions: 200,
        totalSections: 5,
        totalDurationMinutes: 210,
        marksPerQuestion: 4,
        negativeMarking: -1,
        sections: [
            { sectionNumber: 1, questionsCount: 40, durationMinutes: 42, durationSeconds: 2520 },
            { sectionNumber: 2, questionsCount: 40, durationMinutes: 42, durationSeconds: 2520 },
            { sectionNumber: 3, questionsCount: 40, durationMinutes: 42, durationSeconds: 2520 },
            { sectionNumber: 4, questionsCount: 40, durationMinutes: 42, durationSeconds: 2520 },
            { sectionNumber: 5, questionsCount: 40, durationMinutes: 42, durationSeconds: 2520 },
        ],
    },
    INICET: {
        name: 'INICET',
        displayName: 'INICET',
        totalQuestions: 200,
        totalSections: 4,
        totalDurationMinutes: 180,
        marksPerQuestion: 1,
        negativeMarking: -0.33,
        sections: [
            { sectionNumber: 1, questionsCount: 50, durationMinutes: 45, durationSeconds: 2700 },
            { sectionNumber: 2, questionsCount: 50, durationMinutes: 45, durationSeconds: 2700 },
            { sectionNumber: 3, questionsCount: 50, durationMinutes: 45, durationSeconds: 2700 },
            { sectionNumber: 4, questionsCount: 50, durationMinutes: 45, durationSeconds: 2700 },
        ],
    },
};

export const getExamPatternConfig = (pattern: ExamPatternType): ExamPatternConfig => {
    return EXAM_PATTERNS[pattern];
};

export const getSectionConfig = (
    pattern: ExamPatternType,
    sectionNumber: number
): SectionConfig | undefined => {
    const config = EXAM_PATTERNS[pattern];
    return config.sections.find((s) => s.sectionNumber === sectionNumber);
};

export const calculateMarks = (
    pattern: ExamPatternType,
    correctAnswers: number,
    incorrectAnswers: number
): number => {
    const config = EXAM_PATTERNS[pattern];
    const positiveMarks = correctAnswers * config.marksPerQuestion;
    const negativeMarks = incorrectAnswers * Math.abs(config.negativeMarking);
    return positiveMarks - negativeMarks;
};

// Question state types
export type QuestionState =
    | 'not_visited'
    | 'skipped'
    | 'answered'
    | 'marked_for_review'
    | 'answered_and_marked'
    | 'correct'
    | 'wrong';

export const QUESTION_STATE_COLORS: Record<QuestionState, string> = {
    not_visited: 'bg-gray-200 text-gray-600 hover:bg-gray-300',
    skipped: 'bg-white text-gray-800 border-2 border-gray-300 hover:bg-gray-50',
    answered: 'bg-green-500 text-white hover:bg-green-600',
    marked_for_review: 'bg-orange-500 text-white hover:bg-orange-600',
    answered_and_marked: 'bg-purple-500 text-white hover:bg-purple-600',
    correct: 'bg-green-500 text-white hover:bg-green-600 ring-2 ring-green-600 ring-offset-1',
    wrong: 'bg-red-500 text-white hover:bg-red-600 ring-2 ring-red-600 ring-offset-1',
};

export const QUESTION_STATE_LABELS: Record<QuestionState, string> = {
    not_visited: 'Not Visited',
    skipped: 'Skipped',
    answered: 'Answered',
    marked_for_review: 'Marked for Review',
    answered_and_marked: 'Answered & Marked',
    correct: 'Correct',
    wrong: 'Wrong',
};
