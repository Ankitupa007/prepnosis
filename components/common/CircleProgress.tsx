'use client';

import React, { useEffect, useState } from 'react';
import clsx from 'clsx';

type CircleProgressProps = {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string; // Tailwind color class, like 'text-blue-500'
};

export const CircleProgress: React.FC<CircleProgressProps> = ({
  percentage,
  size = 120,
  strokeWidth = 10,
  color = 'text-blue-500',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setProgress(percentage);
    }, 100); // slight delay to trigger animation

    return () => clearTimeout(timeout);
  }, [percentage]);

  const offset = circumference - (progress / 100) * circumference;

  return (
    <div
      className="relative flex items-center justify-center transition-transform duration-300 hover:scale-105"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="transform -rotate-90 transition-all duration-500 ease-out"
      >
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200"
          fill="transparent"
        />
        {/* Foreground Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className={clsx(color, 'transition-all duration-700 ease-in-out')}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-sm font-semibold text-gray-800">
        {progress}%
      </span>
    </div>
  );
};
