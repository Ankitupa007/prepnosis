// components/CopyButton.tsx
'use client';

import React, { useState } from 'react';
import { Copy, Check, AlertCircle, Loader } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

type Status = 'idle' | 'success' | 'error';

interface CopyButtonProps {
  text: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  timeout?: number;
  disabled?: boolean;
  'aria-label'?: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  className = '',
  size = 'md',
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
      toast.success(`copied!`)
      setTimeout(() => setStatus('idle'), timeout);
    } catch (err) {
      setStatus('error');
      console.log(err);
      setTimeout(() => setStatus('idle'), timeout);
    }
  };

  const getIcon = () => {
    const iconClass = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';

    switch (status) {
      case 'success':
        return <Check className={`${iconClass} text-gray-100`} />;
      case 'error':
        return <AlertCircle className={`${iconClass} text-destructive`} />;
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

  const buttonSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'sm';

  return (
    <Button
      variant="ghost"
      size={buttonSize}
      onClick={copyToClipboard}
      disabled={disabled || status !== 'idle'}
      aria-label={getAriaLabel()}
      className={`
        h-auto rounded-full p-2
        hover:bg-accent hover:text-accent-foreground
        transition-all duration-200 ease-in-out
        disabled:cursor-not-allowed disabled:opacity-70
        ${status === 'success' ? 'bg-primary/50 hover:bg-primary/20' : ''}
        ${status === 'error' ? 'bg-destructive/10 hover:bg-destructive/20' : ''}
        ${className}
      `.trim()}
    >
      {getIcon()}
    </Button>
  );
};

export default CopyButton;