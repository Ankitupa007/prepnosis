'use client';

import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Eraser, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuestionDisplayProps {
  question: {
    id: string;
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    images?: string[];
    correct_option?: number;
    explanation?: string;
  };
  selectedOption: number | null;
  isMarkedForReview: boolean;
  onSelectOption: (option: number) => void;
  onClearResponse: () => void;
  onToggleMarkForReview: () => void;
  showExplanation?: boolean;
  disabled?: boolean;
}

export const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  selectedOption,
  isMarkedForReview,
  onSelectOption,
  onClearResponse,
  onToggleMarkForReview,
  showExplanation = false,
  disabled = false,
}) => {
  const options = [
    { value: 1, label: 'A', text: question.option_a },
    { value: 2, label: 'B', text: question.option_b },
    { value: 3, label: 'C', text: question.option_c },
    { value: 4, label: 'D', text: question.option_d },
  ];

  const getOptionClassName = (optionValue: number) => {
    if (!showExplanation) return '';
    
    if (optionValue === question.correct_option) {
      return 'border-green-500 bg-green-50';
    }
    
    if (selectedOption === optionValue && optionValue !== question.correct_option) {
      return 'border-red-500 bg-red-50';
    }
    
    return '';
  };

  return (
    <div className="space-y-6">
      {/* Question Text */}
      <div className="prose max-w-none">
        <p className="text-lg leading-relaxed whitespace-pre-wrap">
          {question.question_text}
        </p>
      </div>

      {/* Images */}
      {question.images && question.images.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {question.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Question image ${index + 1}`}
              className="rounded-lg border"
            />
          ))}
        </div>
      )}

      {/* Options */}
      <RadioGroup
        value={selectedOption?.toString() || ''}
        onValueChange={(value) => !disabled && onSelectOption(parseInt(value))}
        disabled={disabled}
        className="space-y-3"
      >
        {options.map((option) => (
          <div
            key={option.value}
            className={cn(
              'flex items-start space-x-3 p-4 rounded-lg border-2 transition-colors',
              selectedOption === option.value && !showExplanation && 'border-primary bg-primary/5',
              getOptionClassName(option.value),
              disabled && 'opacity-60'
            )}
          >
            <RadioGroupItem
              value={option.value.toString()}
              id={`option-${option.value}`}
              className="mt-1"
            />
            <Label
              htmlFor={`option-${option.value}`}
              className="flex-1 cursor-pointer font-normal"
            >
              <span className="font-semibold mr-2">{option.label}.</span>
              {option.text}
            </Label>
            {showExplanation && option.value === question.correct_option && (
              <span className="text-green-600 font-semibold text-sm">✓ Correct</span>
            )}
          </div>
        ))}
      </RadioGroup>

      {/* Actions */}
      {!disabled && (
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onClearResponse}
              disabled={selectedOption === null}
            >
              <Eraser className="w-4 h-4 mr-2" />
              Clear Response
            </Button>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="mark-review"
                checked={isMarkedForReview}
                onCheckedChange={onToggleMarkForReview}
              />
              <label
                htmlFor="mark-review"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                <Flag className="w-4 h-4 inline mr-1" />
                Mark for Review
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Explanation */}
      {showExplanation && question.explanation && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Explanation:</h4>
          <p className="text-blue-800 whitespace-pre-wrap">{question.explanation}</p>
        </div>
      )}
    </div>
  );
};
