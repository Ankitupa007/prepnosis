'use client';

import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionTimerProps {
    initialSeconds: number;
    onTimeUp: () => void;
    isPaused?: boolean;
    showWarningAt?: number; // seconds remaining to show warning
}

export const SectionTimer: React.FC<SectionTimerProps> = ({
    initialSeconds,
    onTimeUp,
    isPaused = false,
    showWarningAt = 300, // 5 minutes
}) => {
    const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);
    const [isWarning, setIsWarning] = useState(false);

    useEffect(() => {
        setRemainingSeconds(initialSeconds);
    }, [initialSeconds]);

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

    useEffect(() => {
        setIsWarning(remainingSeconds <= showWarningAt && remainingSeconds > 0);
    }, [remainingSeconds, showWarningAt]);

    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getProgressPercentage = (): number => {
        return (remainingSeconds / initialSeconds) * 100;
    };

    return (
        <div className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors',
            isWarning ? 'bg-orange-50 border-orange-300' : 'bg-card border-border'
        )}>
            {isWarning ? (
                <AlertTriangle className="w-5 h-5 text-orange-500" />
            ) : (
                <Clock className="w-5 h-5 text-muted-foreground" />
            )}

            <div className="flex flex-col">
                <span className={cn(
                    'text-lg font-mono font-bold',
                    isWarning ? 'text-orange-600' : 'text-foreground'
                )}>
                    {formatTime(remainingSeconds)}
                </span>

                {/* Progress bar */}
                <div className="w-24 h-1 bg-gray-200 rounded-full overflow-hidden mt-1">
                    <div
                        className={cn(
                            'h-full transition-all duration-1000',
                            isWarning ? 'bg-orange-500' : 'bg-primary'
                        )}
                        style={{ width: `${getProgressPercentage()}%` }}
                    />
                </div>
            </div>

            {isWarning && (
                <span className="text-xs text-orange-600 font-medium">
                    Hurry up!
                </span>
            )}
        </div>
    );
};
