"use client";

import { QuestionNavigator } from '@/components/grand-tests/QuestionNavigator';
import { SectionTimer } from '@/components/grand-tests/SectionTimer';
import { getExamPatternConfig } from '@/lib/constants/exam-patterns';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth-context";
import { Award, BookOpen, ChevronLeft, ChevronRight, Eraser, Flag, Play, Trophy } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { CircleProgress } from "@/components/common/CircleProgress";
import SectionGuard from "@/components/grand-tests/SectionGuard";

interface Question {
  id: string;
  question_text: string;
  question_order: number;
  explanation: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  images: string[];
  correct_option: 1 | 2 | 3 | 4;
  subject_id: string;
  topic_id: string;
  difficulty_level: string;
}

interface TestQuestion {
  correct_option: number;
  id: string;
  question_id: string;
  question_order: number;
  marks: number;
  section_number?: number;
  question: Question;
  user_answer?: {
    selected_option: number | null;
    is_marked_for_review: boolean;
  };
}

interface Test {
  id: string;
  title: string;
  description: string;
  test_mode: "regular" | "exam";
  total_questions: number;
  total_marks: number;
  exam_pattern: 'NEET_PG' | 'INICET';
  user_attempt?: {
    id: string;
    started_at: string;
    submitted_at: string | null;
    is_completed: boolean;
    total_score: number | null;
    current_section: number;
    section_times: {
      section: number;
      start_time: string | null;
      remaining_seconds: number;
    }[];
  };
}

interface UserAnswer {
  questionId: string;
  selectedOption: number | null;
  isCorrect?: boolean;
  isMarkedForReview?: boolean;
}

export default function SectionPage({
  params,
}: {
  params: Promise<{ id: string; section: string }>;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const { id, section } = use(params);

  // State
  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [showReviewMode, setShowReviewMode] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(2520);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  // Fetch test data
  useEffect(() => {
    const fetchTest = async () => {
      try {
        const response = await fetch(`/api/grand-tests/${id}`);
        if (!response.ok) throw new Error("Failed to fetch test");

        const data = await response.json();
        setTest(data.test);

        // Filter questions for current section
        const sectionQuestions = data.questions.filter(
          (q: any) => q.section_number === Number(section)
        );
        setQuestions(sectionQuestions);
        setRemainingSeconds(data.remaining_seconds || 2520);

        // Strict section enforcement
        const currentSection = data.current_section || 1;
        const requestedSection = Number(section);
        const isCompleted = data.test.user_attempt?.is_completed;

        if (!isCompleted && requestedSection !== currentSection) {
          toast.warning(`You must complete Section ${currentSection} first`);
          router.replace(`/grand-tests/${id}/section/${currentSection}`);
          return;
        }

        // Sync local storage with server truth to prevent stale redirects
        if (!isCompleted) {
          localStorage.setItem(
            `grand_test_${id}_current_section`,
            currentSection.toString()
          );
        }

        // Initialize user answers
        const initialAnswers = sectionQuestions.map((q: TestQuestion) => ({
          questionId: q.question_id,
          selectedOption: q.user_answer?.selected_option ?? null,
          isCorrect: q.user_answer?.selected_option === q.question.correct_option,
          isMarkedForReview: q.user_answer?.is_marked_for_review || false,
        }));
        setUserAnswers(initialAnswers);

        // Check if test is already started
        if (data.test.user_attempt) {
          setTestStarted(true);
          setAttemptId(data.test.user_attempt.id);

          if (data.test.user_attempt.is_completed) {
            setTestCompleted(true);
            setShowReviewMode(true);
          }
        }
      } catch (error) {
        console.error("Error fetching test:", error);
        toast.error("Failed to load test");
        router.push("/grand-tests/");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchTest();
  }, [id, section, router]);

  // Prevent browser back button to previous sections
  useEffect(() => {
    if (!test || !test.user_attempt || testCompleted) return;

    const currentSection = test.user_attempt.current_section;
    if (!currentSection) return;

    const handlePopState = (e: PopStateEvent) => {
      // If user tries to go back and they're on the current section
      if (Number(section) === currentSection) {
        e.preventDefault();
        window.history.pushState(null, '', window.location.href);
        toast.error('You cannot navigate back to previous sections');
      }
    };

    // Push current state to prevent back navigation
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [test, section, testCompleted]);

  // Helper functions
  const getQuestionState = (index: number) => {
    const answer = userAnswers[index];
    if (!answer) return 'not_visited';

    if (showReviewMode) {
      if (answer.selectedOption !== null) {
        return answer.isCorrect ? 'correct' : 'wrong';
      }
      return 'skipped';
    }

    const hasAnswer = answer.selectedOption !== null;
    const isMarked = answer.isMarkedForReview || false;

    if (hasAnswer && isMarked) return 'answered_and_marked';
    if (hasAnswer) return 'answered';
    if (isMarked) return 'marked_for_review';
    if (index < currentQuestionIndex) return 'skipped';
    return 'not_visited';
  };

  const getAllQuestionStates = () => {
    const states: Record<number, any> = {};
    questions.forEach((_, index) => {
      states[index] = getQuestionState(index);
    });
    return states;
  };

  // Handlers
  const handleAnswerSelect = async (selectedOption: number | null) => {
    if (showReviewMode || testCompleted) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedOption === currentQuestion.question.correct_option;
    const currentAnswer = userAnswers[currentQuestionIndex];

    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentQuestionIndex] = {
      ...currentAnswer,
      selectedOption,
      isCorrect,
    };
    setUserAnswers(updatedAnswers);

    // Save to server
    try {
      await fetch(`/api/grand-tests/${id}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          answer: {
            questionId: currentQuestion.question_id,
            selectedOption,
            isCorrect,
            isMarkedForReview: currentAnswer.isMarkedForReview || false,
            sectionNumber: Number(section),
          },
          currentSection: Number(section),
        }),
      });
    } catch (error) {
      console.error("Error saving answer:", error);
      toast.error("Failed to save answer");
    }
  };

  const toggleMarkForReview = async () => {
    if (showReviewMode || testCompleted) return;

    const currentQuestion = questions[currentQuestionIndex];
    const currentAnswer = userAnswers[currentQuestionIndex];
    const newMarkedState = !currentAnswer.isMarkedForReview;

    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentQuestionIndex] = {
      ...currentAnswer,
      isMarkedForReview: newMarkedState,
    };
    setUserAnswers(updatedAnswers);

    // Save to server
    try {
      await fetch(`/api/grand-tests/${id}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          answer: {
            questionId: currentQuestion.question_id,
            selectedOption: currentAnswer.selectedOption,
            isCorrect: currentAnswer.isCorrect || false,
            isMarkedForReview: newMarkedState,
            sectionNumber: Number(section),
          },
          currentSection: Number(section),
        }),
      });
    } catch (error) {
      console.error("Error saving mark for review:", error);
    }
  };

  const clearResponse = () => {
    handleAnswerSelect(null);
  };

  const navigateToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const submitSection = async () => {
    if (!attemptId || !test || testCompleted) return;

    try {
      const response = await fetch(`/api/grand-tests/${test.id}/section-submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          sectionNumber: Number(section),
        }),
      });

      if (response.ok) {
        const data = await response.json();

        if (data.nextSection) {
          toast.success(`Section ${section} submitted! Moving to Section ${data.nextSection}`);
          // Update local storage before navigating to prevent guard from redirecting back
          localStorage.setItem(`grand_test_${test.id}_current_section`, data.nextSection.toString());
          router.push(`/grand-tests/${id}/section/${data.nextSection}`);
        } else {
          setShowSubmitDialog(true);
        }
      } else {
        throw new Error("Failed to submit section");
      }
    } catch (error) {
      console.error("Error submitting section:", error);
      toast.error("Failed to submit section");
    }
  };

  const submitTest = async () => {
    if (!attemptId || !test || testCompleted) return;

    try {
      const response = await fetch(`/api/grand-tests/${test.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          answers: userAnswers,
          sectionNumber: section,
        }),
      });

      if (response.ok) {
        setShowSubmitDialog(false);
        setTestCompleted(true);
        // Clear local storage on test completion
        localStorage.removeItem(`grand_test_${test.id}_current_section`);
        setShowReviewMode(true);
        toast.success("Test submitted successfully!");
      } else {
        throw new Error("Failed to submit test");
      }
    } catch (error) {
      console.error("Error submitting test:", error);
      toast.error("Failed to submit test");
    }
  };

  const startTest = async () => {
    if (!user || !test) return;
    setIsLoading(true);

    try {
      const response = await fetch(`/api/grand-tests/${test.id}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Test started successfully!");
        setAttemptId(data.attempt.id);
        setTestStarted(true);
        setIsLoading(false);
      } else {
        throw new Error("Failed to start test");
      }
    } catch (error) {
      console.error("Error starting test:", error);
      toast.error("Failed to start test");
      setIsLoading(false);
    }
  };

  const calculateResults = () => {
    const totalQuestions = userAnswers.length;
    const answeredQuestions = userAnswers.filter(a => a.selectedOption !== null).length;
    const correctAnswers = userAnswers.filter(a => a.isCorrect).length;
    const incorrectAnswers = answeredQuestions - correctAnswers;
    const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    return {
      totalQuestions,
      answeredQuestions,
      correctAnswers,
      incorrectAnswers,
      unanswered: totalQuestions - answeredQuestions,
      percentage,
    };
  };

  const toggleReviewMode = () => {
    setShowReviewMode(!showReviewMode);
    setCurrentQuestionIndex(0);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner text="Loading test" />
      </div>
    );
  }

  if (!test || questions.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Test Not Found</h1>
          <p className="text-foreground/70 mb-6">
            The test you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => router.push("/grand-tests")}>
            Back to Grand Tests
          </Button>
        </div>
      </div>
    );
  }

  // Test start screen
  if (!testStarted) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>{test.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground/70">{test.description}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-foreground/60">Total Questions</p>
                <p className="text-2xl font-bold">{test.total_questions}</p>
              </div>
              <div>
                <p className="text-sm text-foreground/60">Total Marks</p>
                <p className="text-2xl font-bold">{test.total_marks}</p>
              </div>
            </div>
            <Button onClick={startTest} className="w-full" size="lg">
              <Play className="w-5 h-5 mr-2" />
              Start Test
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = userAnswers[currentQuestionIndex];
  const examConfig = getExamPatternConfig(test.exam_pattern);
  const results = calculateResults();

  return (
    <div className="container mx-auto relative">
      {test && (
        <SectionGuard
          testId={test.id}
          currentSection={Number(section)}
          isCompleted={testCompleted}
        />
      )}
      {/* Completion Dialog */}
      {testCompleted && !showReviewMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <Card className="w-full max-w-2xl mx-6">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <Award className="h-6 w-6 text-yellow-500" />
                Test Completed!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <CircleProgress percentage={results.percentage} size={120} strokeWidth={10} />
              </div>
              <div className="flex justify-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{results.correctAnswers}</div>
                  <div className="text-sm text-green-600">Correct</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{results.incorrectAnswers}</div>
                  <div className="text-sm text-red-600">Incorrect</div>
                </div>
                {results.unanswered > 0 && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground/70">{results.unanswered}</div>
                    <div className="text-sm text-foreground/70">Unanswered</div>
                  </div>
                )}
              </div>
              <div className="grid gap-3">
                <Button onClick={toggleReviewMode} className="w-full">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Review Answers
                </Button>
                <Button onClick={() => router.push(`/grand-tests/${id}/results`)} variant="outline" className="w-full">
                  <Trophy className="h-4 w-4 mr-2" />
                  See Ranking
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Final Submit Dialog */}
      {showSubmitDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <Card className="max-w-sm w-full">
            <CardContent className="pt-6 text-center space-y-4">
              <Award className="mx-auto text-yellow-500" size={40} />
              <h2 className="text-2xl font-bold">All Sections Complete!</h2>
              <p className="text-foreground/70">
                You've completed all sections. Ready to submit your test?
              </p>
              <Button onClick={submitTest} className="w-full">
                Submit Test
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto py-4 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <SidebarTrigger variant="secondary" className="p-3 rounded-full w-10 h-10" />
            <div className="font-semibold">
              Section {section} of {examConfig.totalSections}
            </div>
          </div>

          {!testCompleted && (
            <SectionTimer
              initialSeconds={remainingSeconds}
              onTimeUp={submitSection}
              isPaused={testCompleted}
            />
          )}

          <div className="flex items-center gap-4">
            {!showReviewMode ? (
              <Button onClick={submitSection} disabled={testCompleted}>
                Submit Section
              </Button>
            ) : (
              <Button onClick={toggleReviewMode} variant="outline">
                See Results
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto mt-4">
        {/* Section Navigation (Review Mode) */}
        {testCompleted && showReviewMode && (
          <div className="px-6 mb-4">
            <p className="font-semibold mb-2">Sections</p>
            <div className="flex gap-2">
              {Array.from({ length: examConfig.totalSections }, (_, i) => i + 1).map((sec) => (
                <Button
                  key={sec}
                  onClick={() => router.push(`/grand-tests/${id}/section/${sec}`)}
                  variant={Number(section) === sec ? "default" : "outline"}
                  size="sm"
                >
                  {sec}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4">
          {/* Question Display - 2/3 width */}
          <div className="lg:col-span-2">
            <Card className="shadow-none border-none">
              <CardHeader>
                <CardTitle className="text-xl">
                  {currentQuestion.question_order}. {currentQuestion.question.question_text}
                </CardTitle>
                {currentQuestion.question.images && currentQuestion.question.images.length > 0 && (
                  <div className="w-full py-4">
                    <Image
                      src={currentQuestion.question.images[0]}
                      alt="Question"
                      width={800}
                      height={800}
                      className="rounded-2xl"
                    />
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Options */}
                <RadioGroup
                  value={currentAnswer?.selectedOption?.toString() || ""}
                  onValueChange={(value) => handleAnswerSelect(parseInt(value))}
                  disabled={showReviewMode}
                >
                  <div className="space-y-3">
                    {[
                      { value: "1", text: currentQuestion.question.option_a, label: "A" },
                      { value: "2", text: currentQuestion.question.option_b, label: "B" },
                      { value: "3", text: currentQuestion.question.option_c, label: "C" },
                      { value: "4", text: currentQuestion.question.option_d, label: "D" },
                    ].map((option) => {
                      const isSelected = currentAnswer?.selectedOption === parseInt(option.value);
                      const isCorrect = parseInt(option.value) === currentQuestion.question.correct_option;
                      const showResult = showReviewMode;

                      return (
                        <div
                          key={option.value}
                          className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors ${showResult
                            ? isCorrect
                              ? "bg-green-300/50 border-green-500"
                              : isSelected && !isCorrect
                                ? "bg-red-200 border-red-500"
                                : "border-gray-200"
                            : isSelected
                              ? "bg-[#6FCCCA]/30 border-[#6FCCCA]"
                              : "border-gray-200 hover:bg-secondary"
                            }`}
                        >
                          <RadioGroupItem value={option.value} id={option.value} />
                          <Label htmlFor={option.value} className="flex-1 cursor-pointer font-normal">
                            <span className="font-semibold mr-2">{option.label}.</span>
                            {option.text}
                          </Label>
                          {showResult && isCorrect && (
                            <span className="text-xs text-green-700 font-bold">✓ Correct</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </RadioGroup>

                {/* Actions */}
                {!showReviewMode && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearResponse}
                        disabled={currentAnswer?.selectedOption === null}
                      >
                        <Eraser className="w-4 h-4 mr-2" />
                        Clear Response
                      </Button>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="mark-review"
                          checked={currentAnswer?.isMarkedForReview || false}
                          onCheckedChange={toggleMarkForReview}
                        />
                        <label htmlFor="mark-review" className="text-sm font-medium cursor-pointer">
                          <Flag className="w-4 h-4 inline mr-1" />
                          Mark for Review
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Explanation */}
                {showReviewMode && currentQuestion.question.explanation && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Explanation:</h4>
                    <p className="text-blue-800 whitespace-pre-wrap">
                      {currentQuestion.question.explanation}
                    </p>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={previousQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  <Button
                    onClick={nextQuestion}
                    disabled={currentQuestionIndex === questions.length - 1}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Navigator - 1/3 width */}
          <div className="lg:col-span-1">
            <QuestionNavigator
              totalQuestions={questions.length}
              currentQuestionIndex={currentQuestionIndex}
              questionStates={getAllQuestionStates()}
              onNavigate={navigateToQuestion}
              disabled={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
