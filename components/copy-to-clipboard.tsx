// components/CopyButton.tsx
'use client';

import React, { useState } from 'react';
import { Copy, Check, AlertCircle } from 'lucide-react';

type Status = 'idle' | 'success' | 'error';
type Size = 'sm' | 'md' | 'lg';
type Variant = 'default' | 'primary' | 'secondary' | 'outline' | 'ghost';

interface CopyButtonProps {
  text: string;
  className?: string;
  size?: Size;
  variant?: Variant;
  timeout?: number;
  disabled?: boolean;
  'aria-label'?: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  className = '',
  size = 'md',
  variant = 'default',
  timeout = 2000,
  disabled = false,
  'aria-label': ariaLabel = 'Copy to clipboard'
}) => {
  const [status, setStatus] = useState<Status>('idle');

  const copyToClipboard = async (): Promise<void> => {
    if (disabled) return;

    try {
      await navigator.clipboard.writeText(text);
      setStatus('success');
      setTimeout(() => setStatus('idle'), timeout);
    } catch (err) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), timeout);
    }
  };

  // Size variants
  const sizeClasses: Record<Size, string> = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3'
  };

  const iconSizes: Record<Size, string> = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  // Color variants
  const variantClasses: Record<Variant, string> = {
    default: 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300',
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
    outline: 'border-2 border-gray-300 hover:border-gray-400 bg-transparent text-gray-700',
    ghost: 'hover:bg-gray-100 text-gray-600'
  };

  // Status colors
  const statusClasses: Record<Status, string> = {
    idle: variantClasses[variant],
    success: 'bg-green-500 text-white border-green-500',
    error: 'bg-red-500 text-white border-red-500'
  };

  const getIcon = (): React.JSX.Element => {
    const iconClass = iconSizes[size];

    switch (status) {
      case 'success':
        return <Check className={iconClass} />;
      case 'error':
        return <AlertCircle className={iconClass} />;
      default:
        return <Copy className={iconClass} />;
    }
  };

  const getAriaLabel = (): string => {
    switch (status) {
      case 'success':
        return 'Copied to clipboard';
      case 'error':
        return 'Failed to copy';
      default:
        return ariaLabel;
    }
  };

  return (
    <button
      onClick={copyToClipboard}
      disabled={disabled || status === 'success' || status === 'error'}
      aria-label={getAriaLabel()}
      className={`
        inline-flex items-center justify-center rounded-md
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-50
        ${sizeClasses[size]}
        ${statusClasses[status]}
        ${status !== 'idle' ? 'transform scale-95' : 'hover:scale-105'}
        ${className}
      `.trim()}
    >
      {getIcon()}
    </button>
  );
};

export default CopyButton;
