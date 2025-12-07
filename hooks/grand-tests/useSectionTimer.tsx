'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSectionConfig } from '@/lib/constants/exam-patterns';

interface UseSectionTimerProps {
    examPattern: 'NEET_PG' | 'INICET';
    sectionNumber: number;
    initialSeconds: number;
    onTimeUp: () => void;
    isPaused?: boolean;
}

export const useSectionTimer = ({
    examPattern,
    sectionNumber,
    initialSeconds,
    onTimeUp,
    isPaused = false,
}: UseSectionTimerProps) => {
    const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);
    const [isWarning, setIsWarning] = useState(false);

    // Reset timer when initial seconds change
    useEffect(() => {
        setRemainingSeconds(initialSeconds);
    }, [initialSeconds]);

    // Timer countdown
    useEffect(() => {
        if (isPaused || remainingSeconds <= 0) return;

        const timer = setInterval(() => {
            setRemainingSeconds((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onTimeUp();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isPaused, remainingSeconds, onTimeUp]);

    // Warning state (5 minutes remaining)
    useEffect(() => {
        setIsWarning(remainingSeconds <= 300 && remainingSeconds > 0);
    }, [remainingSeconds]);

    // Format time as MM:SS
    const formatTime = useCallback((seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, []);

    // Get progress percentage
    const getProgressPercentage = useCallback((): number => {
        const sectionConfig = getSectionConfig(examPattern, sectionNumber);
        const totalSeconds = sectionConfig?.durationSeconds || initialSeconds;
        return (remainingSeconds / totalSeconds) * 100;
    }, [examPattern, sectionNumber, initialSeconds, remainingSeconds]);

    return {
        remainingSeconds,
        isWarning,
        formatTime: formatTime(remainingSeconds),
        progressPercentage: getProgressPercentage(),
    };
};
