"use client";
import { CircleProgress } from "@/components/common/CircleProgress";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import SubjectIcons from "@/components/common/SubjectIcons";
import CopyButton from "@/components/copy-to-clipboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SidebarTrigger } from "@/components/ui/sidebar";
import UserHeader from "@/components/user-header";
import BookmarkButton from "@/components/bookmark-button";
import { Award, BookOpen, ChevronLeft, ChevronRight, ClipboardPlus, FileText, Play, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface Question {
    id: string;
    question_text: string;
    explanation: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_option: 1 | 2 | 3 | 4;
    subject_id: string;
    subjects: { id: string; name: string } | null;
    topics: { id: string; name: string } | null;
    topic_id: string;
    difficulty_level: string;
}

interface TestQuestion {
    id: string;
    question_id: string;
    question_order: number;
    marks: number;
    questions: Question | null;
}

interface Test {
    id: string;
    title: string;
    description: string;
    test_mode: "regular" | "exam";
    total_questions: number;
    total_marks: number;
    subjects: { id: string; name: string }[] | null;
    share_code?: string;
    user_attempt?: {
        id: string;
        is_completed: boolean;
        total_score: number;
        correct_answers: number;
        incorrect_answers: number;
        unanswered: number;
        user_answers?: {
            question_id: string;
            selected_option: number;
            is_correct: boolean;
        }[];
    };
}

interface UserAnswer {
    questionId: string;
    selectedOption: number | null;
    isCorrect?: boolean;
}

export default function CustomTestPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { user } = useAuth();
    const [test, setTest] = useState<Test | null>(null);
    const [questions, setQuestions] = useState<TestQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [isStarting, setIsStarting] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [testStarted, setTestStarted] = useState(false);
    const [testCompleted, setTestCompleted] = useState(false);
    const [isSubmitted, setSubmitted] = useState(false);
    const [attemptId, setAttemptId] = useState<string | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [showReviewMode, setShowReviewMode] = useState(false);
    const { id } = use(params);
    const queryClient = useQueryClient();

    const renderBoldText = (text: string) => {
        const boldText = text.replace(/\*(.*?)\*/g, '<strong className="font-bold text-[#6FCCCA]">$1</strong>');
        return <span dangerouslySetInnerHTML={{ __html: boldText }} />;
    };

    // Fetch test data
    useEffect(() => {
        const fetchTest = async () => {
            setIsFetching(true);
            try {
                const response = await fetch(`/api/tests/${id}`, { cache: 'no-store' });
                if (!response.ok) {
                    throw new Error(`Failed to fetch test: ${response.status}`);
                }
                const data = await response.json();
                if (!data.test || !data.questions) {
                    throw new Error("Invalid test data");
                }
                setTest(data.test);
                setQuestions(data.questions);

                // Initialize user answers
                const initialAnswers = data.questions.map((q: TestQuestion) => ({
                    questionId: q.question_id,
                    selectedOption: null,
                    isCorrect: false,
                }));
                setUserAnswers(initialAnswers);

                // Check if test is already started or completed
                if (data.test.user_attempt) {
                    setAttemptId(data.test.user_attempt.id);
                    if (data.test.user_attempt.is_completed) {
                        setTestCompleted(true);
                        // Populate user answers from the attempt
                        if (data.test.user_attempt.user_answers) {
                            const fetchedAnswers = data.test.user_attempt.user_answers;
                            const mappedAnswers = initialAnswers.map((ans: UserAnswer) => {
                                const found = fetchedAnswers.find((fa: any) => fa.question_id === ans.questionId);
                                return found ? { ...ans, selectedOption: found.selected_option, isCorrect: found.is_correct } : ans;
                            });
                            setUserAnswers(mappedAnswers);
                        }
                    } else {
                        setTestStarted(true);
                    }
                }
            } catch (error) {
                console.error("Error fetching test:", error);
                toast.error(`Failed to load test: ${error instanceof Error ? error.message : "Unknown error"}`);
                router.push("/custom-test/create");
            } finally {
                setIsFetching(false);
            }
        };

        if (id) {
            fetchTest();
        }
    }, [id, router]);

    // Check if current question is answered
    const isCurrentQuestionAnswered = () => {
        if (test?.test_mode === "exam") {
            return false; // In exam mode, never consider questions as "locked"
        }
        const currentQuestion = questions[currentQuestionIndex];
        const currentAnswer = userAnswers.find((a) => a.questionId === currentQuestion.question_id);
        return currentAnswer?.selectedOption !== null;
    };

    // Navigation handler
    const navigateToQuestion = (index: number) => {
        setCurrentQuestionIndex(index);
        const targetQuestion = questions[index];
        const targetAnswer = userAnswers.find((a) => a.questionId === targetQuestion.question_id);
        const isAnswered = targetAnswer?.selectedOption !== null;

        if (test?.test_mode === "regular" && isAnswered) {
            setShowExplanation(true);
        } else if (test?.test_mode === "regular" && !isAnswered && showReviewMode) {
            setShowExplanation(true);
        } else {
            setShowExplanation(false);
        }
    };

    // Start test attempt
    const startTest = () => {
        setTestStarted(true);
        toast.success("Test started!");
    };

    // Handle answer selection
    const handleAnswerSelect = (selectedOption: number) => {
        if (test?.test_mode === "regular" && isCurrentQuestionAnswered()) {
            return;
        }

        const currentQuestion = questions[currentQuestionIndex];
        const isCorrect = selectedOption === currentQuestion.questions?.correct_option;

        const updatedAnswers = userAnswers.map((answer) =>
            answer.questionId === currentQuestion.question_id
                ? { ...answer, selectedOption, isCorrect }
                : answer
        );
        setUserAnswers(updatedAnswers);

        if (test?.test_mode === "regular") {
            setShowExplanation(true);
        }
    };

    // Navigate to next question
    const nextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            navigateToQuestion(currentQuestionIndex + 1);
        }
    };

    // Navigate to previous question
    const previousQuestion = () => {
        if (currentQuestionIndex > 0) {
            navigateToQuestion(currentQuestionIndex - 1);
        }
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement;
            const isInputField =
                target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.contentEditable === "true";
            if (isInputField) return;

            switch (event.key) {
                case "ArrowLeft":
                    event.preventDefault();
                    previousQuestion();
                    break;
                case "ArrowRight":
                    event.preventDefault();
                    nextQuestion();
                    break;
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [currentQuestionIndex, questions.length]);

    // Submit test
    const submitTest = () => {
        setIsSubmitting(true);
        // Simulate a short delay for better UX
        setTimeout(() => {
            setTestCompleted(true);
            setSubmitted(true);
            setShowReviewMode(true);
            setShowExplanation(true);
            setIsSubmitting(false);
            toast.success("Test submitted successfully!");
        }, 500);
    };

    // Calculate results
    const calculateResults = () => {
        const totalQuestions = userAnswers.length;
        const answeredQuestions = userAnswers.filter((a) => a.selectedOption !== null).length;
        const correctAnswers = userAnswers.filter((a) => a.isCorrect).length;
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

    const retakeTest = () => {
        setCurrentQuestionIndex(0);
        setTestStarted(false);
        setTestCompleted(false);
        setAttemptId(null);
        setShowExplanation(false);
        setShowReviewMode(false);
        const resetAnswers = userAnswers.map((answer) => ({
            ...answer,
            selectedOption: null,
            isCorrect: false,
        }));
        setUserAnswers(resetAnswers);
    };

    // Toggle review mode
    const toggleReviewMode = () => {
        setShowReviewMode(!showReviewMode);
        setCurrentQuestionIndex(0);
    };

    if (isFetching) {
        return (
            <div className="container mx-auto">
                <UserHeader text="Start Test" />
                <div className="min-h-[70vh] flex items-center justify-center">
                    <LoadingSpinner text="Loading test" />
                </div>
            </div>
        );
    }

    if (!test || questions.length === 0) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="max-w-2xl mx-auto text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Test Not Found</h1>
                    <p className="text-gray-600 mb-6">The test you&apos;re looking for doesn&apos;t exist or has been removed.</p>
                    <Button onClick={() => router.push("/custom-test/create")}>Create New Test</Button>
                </div>
            </div>
        );
    }

    // Test start screen
    if (!testStarted && !testCompleted) {
        return (
            <div className="container mx-auto">
                <UserHeader text="Start Test" />
                <div className="max-w-2xl mx-auto py-4">
                    <div className="max-w-2xl mx-auto p-6">
                        <div className="bg-card rounded-2xl border border-border overflow-hidden transition-all duration-300">
                            <div className="p-6 pb-4">
                                <div className="flex flex-col justify-center items-center gap-3 mb-3 w-full">
                                    <div className="h-12 rounded-xl flex items-center justify-center w-full py-2">
                                        <ClipboardPlus className="w-10 h-10 text-[#6FCCCA]" />
                                    </div>
                                    <div className="flex justify-center flex-col items-center">
                                        <h2 className="text-xl font-semibold leading-tight">{test.title}</h2>
                                        <p className="text-sm text-gray-500 mt-1">{test.description}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 pb-4 space-y-3">
                                <div className="flex flex-wrap py-4 gap-3">
                                    {test.subjects && test.subjects.length > 0 ? (
                                        test.subjects.map((s) => (
                                            <Badge
                                                variant="secondary"
                                                key={s.id}
                                                className="text-xs rounded-full items-center justify-center py-1 flex gap-2"
                                            >
                                                <SubjectIcons subjectName={s.name} styles="w-3 h-3" />
                                                {s.name}
                                            </Badge>
                                        ))
                                    ) : (
                                        <Badge
                                            variant="secondary"
                                            className="text-xs rounded-full items-center justify-center py-1 flex gap-2"
                                        >
                                            No Subjects
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <div className="px-6 pb-4 space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="text-center p-3 bg-secondary rounded-xl">
                                        <div className="text-lg font-bold" style={{ color: "#6FCCCA" }}>
                                            {test.total_questions}
                                        </div>
                                        <div className="text-xs text-gray-600">Questions</div>
                                    </div>
                                    <div className="text-center p-3 bg-secondary rounded-xl">
                                        <div className="text-lg font-bold" style={{ color: "#6FCCCA" }}>
                                            {test.total_marks}
                                        </div>
                                        <div className="text-xs text-gray-600">Points</div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-center p-3 bg-secondary rounded-xl">
                                    <div className="text-xs text-gray-400">Share</div>
                                    <div className="text-sm font-bold" style={{ color: "#6FCCCA" }}>
                                        {test.share_code || "N/A"}
                                    </div>
                                    <CopyButton text={test.share_code || ""} />
                                </div>
                            </div>
                            <div className="px-6 pb-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">Mode</span>
                                    <span
                                        className="text-xs px-3 py-1 rounded-full font-medium"
                                        style={{
                                            backgroundColor: test.test_mode === "regular" ? "#6FCCCA20" : "#f3f4f6",
                                            color: test.test_mode === "regular" ? "#6FCCCA" : "#6b7280",
                                        }}
                                    >
                                        {test.test_mode === "regular" ? "Regular" : "Exam"}
                                    </span>
                                </div>
                            </div>
                            <div className="p-6 pt-4 w-full">
                                <button onClick={startTest} disabled={isStarting} className="pushable bg-[#31AFAD] w-full disabled:opacity-70 disabled:cursor-not-allowed">
                                    <span className="front text-background bg-[#6FCCCA] py-2 flex justify-center items-center">
                                        {isStarting ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                <span>Starting...</span>
                                            </div>
                                        ) : (
                                            <p className="flex items-center text-lg font-medium justify-center gap-4">
                                                <Play className="w-4 h-4" />
                                                Start Test
                                            </p>
                                        )}
                                    </span>
                                </button>
                            </div>
                            <div className="h-1" style={{ backgroundColor: "#6FCCCA" }}></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const currentAnswer = userAnswers.find((a) => a.questionId === currentQuestion.question_id);
    const shouldShowExplanation =
        (test.test_mode === "regular" && showExplanation) || (test.test_mode === "exam" && showReviewMode);
    const isAnswered = isCurrentQuestionAnswered();
    const results = calculateResults();

    return (
        <div className="container w-full mx-auto relative min-h-screen">
            {testCompleted && !showReviewMode && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-full mx-auto px-6 max-w-2xl">
                        <Card>
                            <CardHeader className="text-center">
                                <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                                    <Award className="h-6 w-6 text-yellow-500" />
                                    Test Completed!
                                </CardTitle>
                                <CardDescription>{test.title}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 mx-auto w-full">
                                <div className="text-center w-full mx-auto flex justify-center items-center">
                                    <CircleProgress percentage={results.percentage} size={120} strokeWidth={10} />
                                </div>
                                <div className="flex justify-center gap-4">
                                    <div className="flex items-center space-x-2">
                                        <div className="text-sm text-green-600">{results.correctAnswers}</div>
                                        <div className="text-sm text-green-600">Correct</div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="text-sm text-red-600">{results.incorrectAnswers}</div>
                                        <div className="text-sm text-red-600">Incorrect</div>
                                    </div>
                                    {results.unanswered > 0 && (
                                        <div className="flex items-center space-x-2">
                                            <div className="text-sm text-gray-600">{results.unanswered}</div>
                                            <div className="text-sm text-gray-600">Unanswered</div>
                                        </div>
                                    )}
                                </div>
                                <div className="grid md:grid-cols-1 gap-4">
                                    <button onClick={toggleReviewMode} className="flex-1 pushable bg-[#31afad]" disabled={!test.user_attempt?.is_completed && userAnswers.every(a => a.selectedOption === null)}>
                                        <div className="front bg-[#6FCCCA] py-2">
                                            <p className="flex justify-center items-center text-background text-base font-semibold">
                                                <BookOpen className="h-4 w-4 mr-2" />
                                                Review Answers
                                            </p>
                                        </div>
                                    </button>
                                    <button onClick={() => router.push("/custom-test")} className="flex-1 pushable bg-[#c9c99c]">
                                        <div className="front bg-[#ecec7c] py-2 text-foreground">
                                            <p className="flex justify-center items-center text-black text-base font-semibold">
                                                <ClipboardPlus className="h-4 w-4 mr-2" />
                                                More Custom Tests
                                            </p>
                                        </div>
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
            {isSubmitted && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6">
                    <div className="bg-background rounded-lg shadow-lg max-w-sm w-full p-8 text-center">
                        <Award className="mx-auto mb-4 text-yellow-500" size={40} />
                        <h2 className="text-2xl font-bold mb-2">Test Submitted!</h2>
                        <p className="text-foreground/50 mb-6">
                            Your test has been submitted successfully.
                            <br />
                            What would you like to do next?
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => {
                                    setShowReviewMode(false);
                                    setSubmitted(false);
                                }}
                                className="flex-1 pushable bg-[#31afad]"
                            >
                                <div className="front bg-[#6FCCCA] py-2">
                                    <p className="flex justify-center text-background items-center text-base font-semibold">
                                        <BookOpen className="h-4 w-4 mr-2" />
                                        Check Result
                                    </p>
                                </div>
                            </button>
                            <button
                                onClick={() => {
                                    setShowReviewMode(true);
                                    setSubmitted(false);
                                }}
                                className="flex-1 pushable bg-[#c9c99c]"
                            >
                                <div className="front bg-[#ecec7c] py-2 text-foreground">
                                    <p className="flex justify-center items-center text-black text-base font-semibold">
                                        <FileText className="h-4 w-4 mr-2" />
                                        Review Explanations
                                    </p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <header className="bg-background/80 backdrop-blur-sm border-border border-b sticky top-0 z-10">
                <div className="container mx-auto py-4 px-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <SidebarTrigger variant="secondary" className="p-3 rounded-full w-10 h-10" />
                        <div className="hidden md:block"></div>
                    </div>
                    <div className="flex items-center gap-4">
                        {!showReviewMode ? (
                            <button
                                onClick={submitTest}
                                disabled={isSubmitting}
                                className="text-[#6FCCCA] bg-transparent font-semibold shadow-none p-0 flex items-center gap-2 disabled:opacity-70"
                            >
                                {isSubmitting && <div className="w-3 h-3 border-2 border-[#6FCCCA] border-t-transparent rounded-full animate-spin" />}
                                {isSubmitting ? "Submitting..." : "Submit Test"}
                            </button>
                        ) : (
                            <button onClick={toggleReviewMode} className="text-[#6FCCCA]">
                                See Results
                            </button>
                        )}
                    </div>
                </div>
            </header>
            <div className="max-w-4xl mx-auto mt-4 w-full">
                <div className="mx-auto flex justify-start w-full max-w-2xl px-6 py-6">
                    <div className="border-none shadow-none w-full mx-auto max-w-4xl">
                        <div className="flex items-center gap-2 flex-wrap max-w-4xl">
                            {questions.map((_, index) => {
                                const answer = userAnswers[index];
                                const isAnswered = answer?.selectedOption !== null;
                                const isCurrent = index === currentQuestionIndex;
                                const isCorrect = answer?.isCorrect || false;

                                const getButtonStyle = () => {
                                    if (isCurrent) {
                                        if (isAnswered && isCorrect && test.test_mode === "regular") {
                                            return "bg-green-500 p-1 border-green-500";
                                        } else if (isAnswered && !isCorrect && test.test_mode === "regular") {
                                            return "bg-red-300 p-1 border-red-300";
                                        } else if (isAnswered && test.test_mode === "exam") {
                                            return "bg-[#6FCCCA] p-1 border-[#6FCCCA]";
                                        } else {
                                            return "bg-gray-300 p-1 border-gray-300 dark:bg-gray-700 dark:border-gray-700";
                                        }
                                    }
                                    if ((test.test_mode === "exam" && testCompleted) || (test.test_mode === "regular" && isAnswered)) {
                                        return isAnswered
                                            ? isCorrect
                                                ? "bg-green-500 border-green-500"
                                                : "bg-red-300 border-red-300"
                                            : "bg-border border-border";
                                    }
                                    return isAnswered ? "bg-[#6FCCCA] border-[#6FCCCA]" : "bg-border border-border hover:border-border/40";
                                };

                                return (
                                    <button
                                        key={index}
                                        onClick={() => navigateToQuestion(index)}
                                        className={`w-2 h-2 text-xs rounded-full border-2 transition-colors ${getButtonStyle()}`}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>
                <div className="mx-auto flex justify-center w-full max-w-4xl px-2 pb-24"> {/* Added pb-24 for sticky bar padding */}
                    <div className="max-w-2xl w-full">
                        <Card className="shadow-none border-none">
                            <CardHeader>
                                <CardTitle className="flex items-start justify-between gap-3 pt-0">
                                    <p className="flex-1 text-xl font-semibold">
                                        {currentQuestionIndex + 1}. {currentQuestion.questions?.question_text || "Question not loaded"}
                                    </p>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <RadioGroup
                                    value={currentAnswer?.selectedOption?.toString() || ""}
                                    onValueChange={(value) => handleAnswerSelect(parseInt(value))}
                                    disabled={shouldShowExplanation || showReviewMode || (test?.test_mode === "regular" && isAnswered)}
                                >
                                    <div className="space-y-3">
                                        {[
                                            { value: "1", text: currentQuestion.questions?.option_a || "", label: "A" },
                                            { value: "2", text: currentQuestion.questions?.option_b || "", label: "B" },
                                            { value: "3", text: currentQuestion.questions?.option_c || "", label: "C" },
                                            { value: "4", text: currentQuestion.questions?.option_d || "", label: "D" },
                                        ].map((option) => {
                                            const isSelected = currentAnswer?.selectedOption === parseInt(option.value);
                                            const isCorrect = parseInt(option.value) === currentQuestion.questions?.correct_option;
                                            const showResult = shouldShowExplanation;
                                            const isDisabled =
                                                (test?.test_mode === "regular" && isAnswered && !showResult) || showReviewMode;

                                            return (
                                                <div key={option.value} className="pushable relative">
                                                    <Label
                                                        id={`label-${option.value}`}
                                                        htmlFor={option.value}
                                                        className={`front text-sm flex justify-between items-center space-x-3 py-4 rounded-lg border relative ${showResult
                                                            ? isCorrect
                                                                ? "bg-green-300/50 dark:bg-green-600/50 border-none"
                                                                : isSelected && !isCorrect
                                                                    ? "bg-red-200 dark:bg-red-600/30 border-none"
                                                                    : "border-none bg-background shadow"
                                                            : isSelected
                                                                ? "bg-[#6FCCCA]/30 border-none"
                                                                : "bg-background shadow border-none hover:bg-secondary"
                                                            } ${isDisabled ? "cursor-not-allowed opacity-75" : ""}`}
                                                    >
                                                        <div className="flex items-center space-x-3 py-1 px-3 rounded-lg w-full">
                                                            <RadioGroupItem
                                                                value={option.value}
                                                                id={option.value}
                                                                disabled={isDisabled}
                                                                className="text-gray-500"
                                                            />
                                                            <p className="font-medium px-2 py-1 rounded">{option.label}</p>
                                                            <span className="flex-1">{option.text}</span>
                                                            {showResult && isCorrect && (
                                                                <span className="text-xs text-green-700 dark:text-green-300 font-bold">correct</span>
                                                            )}
                                                            {showResult && isSelected && !isCorrect && (
                                                                <span className="text-xs text-red-600 dark:text-red-300 font-bold">incorrect</span>
                                                            )}
                                                        </div>
                                                    </Label>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </RadioGroup>
                                {shouldShowExplanation && currentQuestion.questions?.explanation && (
                                    <div className="mt-6 py-4 border-none rounded-lg w-full">
                                        <h4 className="font-medium text-sm uppercase text-foreground/30 mb-2">Explanation</h4>
                                        <p className="py-4 leading-relaxed whitespace-pre-wrap text-foreground/70 w-full break-words">
                                            {renderBoldText(currentQuestion.questions.explanation)}
                                        </p>
                                        <div className="flex flex-col items-start gap-2 mt-2 text-foreground/70">
                                            <p className="text-xs font-bold">{currentQuestion.questions.subjects?.name || "Unknown Subject"}</p>
                                            <span className="text-xs">{currentQuestion.questions.topics?.name || "Unknown Topic"}</span>
                                        </div>
                                        <p className="text-xs py-4 text-foreground/50 flex items-center gap-2">
                                            {currentQuestion.question_id} <CopyButton text={currentQuestion.question_id} size="sm" />
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div >
            {/* Sticky Bottom Navigation */}
            <div className="fixed bottom-0 w-full right-0 bg-background/80 backdrop-blur-md border-t border-border py-4 px-6" >
                <div className="mx-auto flex items-center justify-between">
                    <button
                        onClick={previousQuestion}
                        className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        disabled={currentQuestionIndex === 0}
                    >
                        <ChevronLeft className="w-4 h-4" />
                        PREVIOUS
                    </button>

                    <div className="flex items-center gap-6">
                        <div className="rounded-full overflow-hidden border border-border/50 bg-card/50">
                            <BookmarkButton
                                questionId={currentQuestion.questions?.id || ""}
                                showText
                                size="sm"
                                variant="ghost"
                            />
                        </div>
                    </div>

                    <div className="flex items-center">
                        {currentQuestionIndex === questions.length - 1 ? (
                            <Button
                                onClick={submitTest}
                                disabled={isSubmitting}
                                className="bg-[#6FCCCA] hover:bg-[#6FCCCA]/90 text-white text-xs font-bold h-9 px-6 rounded-full shadow-lg shadow-[#6FCCCA]/20 transition-all active:scale-95 flex items-center gap-2"
                            >
                                {isSubmitting && <Loader2 className="w-3 h-3 animate-spin" />}
                                FINISH TEST
                            </Button>
                        ) : (
                            <button
                                onClick={nextQuestion}
                                className="flex items-center gap-2 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                            >
                                NEXT
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}