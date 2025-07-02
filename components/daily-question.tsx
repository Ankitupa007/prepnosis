'use client';
import { useDailyQuestion } from '@/hooks/use-daily-quesstion';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import BookmarkButton from './bookmark-button';
import LoadingSpinner from './common/LoadingSpinner';

export function DailyQuestionCard() {
  const { data, isLoading, error, refetch } = useDailyQuestion();
  const [selected, setSelected] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (data?.selected_option) {
      setSelected(data.selected_option);
      setIsSubmitted(true);
      setIsCorrect(data.is_correct);
    }
  }, [data]);

  const handleOptionSelect = async (value: number) => {
    if (isSubmitted || isSubmitting) return;

    setSelected(value);
    setIsSubmitting(true);

    // Immediately show the result based on correct answer
    const correctAnswer = data.correct_option;
    const userIsCorrect = value === correctAnswer;
    setIsCorrect(userIsCorrect);
    setIsSubmitted(true);

    // Submit in background without blocking UI
    try {
      fetch('/api/daily-question/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ selected_option: value }),
      }).then(() => {
        refetch();
      });
    } catch (error) {
      console.error('Failed to submit answer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (

      <div className='py-8'>
        <LoadingSpinner text='loading Clinical Question' />
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center p-8">
          <XCircle className="h-6 w-6 text-destructive mr-2" />
          <span className="text-muted-foreground">No question found.</span>
        </CardContent>
      </Card>
    );
  }

  const getOptionVariant = (value: number) => {
    if (!isSubmitted) return 'default';
    const isCorrectOption = value === data.correct_option;
    const isUserSelected = value === selected;

    if (isCorrectOption) return 'correct';
    if (isUserSelected && !isCorrectOption) return 'incorrect';
    return 'disabled';
  };

  const getOptionIcon = (value: number) => {
    if (!isSubmitted) return null;
    const isCorrectOption = value === data.correct_option;
    const isUserSelected = value === selected;

    if (isCorrectOption) return <span className='text-xs text-green-700 dark:text-green-300 font-bold'>correct</span>;
    if (isUserSelected && !isCorrectOption) return <span className='text-xs text-red-600 dark:text-red-300 font-bold'>incorrect</span>;
    return null;
  };

  return (
    <main className='container mx-auto py-6 lg:px-8'>
      <Card className="mx-auto shadow-none border-none grid grid-cols-1 md:grid-cols-2">
        <CardHeader className="pb-4">
          <span className='w-32 text-sm font-medium flex justify-center py-1 text-background bg-primary rounded-lg my-2'>#clinical-question</span>
          <CardTitle className="flex-shrink-0 text-lg font-semibold leading-relaxed">
            {data.question_text}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 pt-6">
          <RadioGroup
            value={selected?.toString()}
            onValueChange={(value) => handleOptionSelect(parseInt(value))}
            disabled={isSubmitted}
            className="space-y-3"
          >
            {['A', 'B', 'C', 'D', 'E'].map((label, index) => {
              const opt = data[`option_${label.toLowerCase()}`];
              if (!opt) return null;
              const value = index + 1;
              const variant = getOptionVariant(value);
              const icon = getOptionIcon(value);

              return (
                <div key={label} className="space-y-2">
                  <Label
                    htmlFor={`option-${value}`}
                    className={cn(
                      "flex justify-between items-center space-x-3 py-4  rounded-lg border transition-colors",
                      {
                        "bg-background shadow  border-none hover:bg-secondary": variant === 'default',
                        "bg-green-300/50 dark:bg-green-600/50 border-none": variant === 'correct',
                        "bg-red-200 dark:bg-red-600/30 border-none": variant === 'incorrect',
                        "cursor-not-allowed bg-background shadow  border-none hover:bg-secondary'": variant === 'disabled',
                      }
                    )}
                  >
                    <div className='flex items-center space-x-3 py-1 px-3 rounded-lg w-full'>
                      <RadioGroupItem
                        value={value.toString()}
                        id={`option-${value}`}
                        className={cn({
                          "border-green-500 text-green-600": variant === 'correct',
                          "border-red-500 text-red-600": variant === 'incorrect',
                        })}
                      />
                      <span className="font-medium text-sm px-2 py-1 rounded">
                        {label}
                      </span>
                      <span className="flex-1">{opt}</span>
                      {icon}
                    </div>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </CardContent>
        <CardFooter className='text-sm text-foreground/60 font-semibold'>
          {isSubmitted && ("You have already answered this question. Wait for the next day for next question")}
        </CardFooter>
      </Card>
    </main>
  );
}