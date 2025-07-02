// components/common/LoadingSpinner.tsx

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  text
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-2', className)}>
      <Loader
        className={cn(
          'animate-spin',
          sizeClasses[size]
        )}
      />
      {text && (
        <p className="text-sm animate-pulse">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;