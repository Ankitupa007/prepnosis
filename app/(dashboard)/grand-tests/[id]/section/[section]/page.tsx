// app/grand-tests/[id]/page.tsx

"use client";
import BookmarkButton from "@/components/bookmark-button";
import { CircleProgress } from "@/components/common/CircleProgress";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import SubjectIcons from "@/components/common/SubjectIcons";
import CopyButton from "@/components/copy-to-clipboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SidebarTrigger } from "@/components/ui/sidebar";
import UserHeader from "@/components/user-header";
import { useAuth } from "@/lib/auth-context";
import {
  Award,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ClipboardPlus,
  Play,
  Trophy,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";

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
  subjects?: {
    id: string;
    name: string;
  };
  topics?: {
    id: string;
    name: string;
  };
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
  subjects: string[] | "all";
  share_code?: string;
  user_attempt?: {
    id: string;
    started_at: string;
    submitted_at: string | null;
    is_completed: boolean;
    total_score: number | null;
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
}

export default function SectionPage({
  params,
}: {
  params: Promise<{ id: string; section: 1 | 2 | 3 | 4 | 5 }>;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [isSubmitted, setSubmitted] = useState(false);
  const [showSubmitTestModel, setShowSubmitTestModel] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showReviewMode, setShowReviewMode] = useState(false);
  const [currentSection, setCurrentSection] = useState(1);
  const [remainingSeconds, setRemainingSeconds] = useState(2520); // 42 minutes
  const [isStarting, setIsStarting] = useState(false); // New state for startTest loading
  const { id, section } = use(params);

  // Timer logic
  useEffect(() => {
    if (!testStarted || testCompleted || !remainingSeconds) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          submitSection();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testStarted, testCompleted, currentSection]);

  function splitIntoSections(array: TestQuestion[], numSections: number) {
    const result = [];
    const sectionSize = Math.ceil(array.length / numSections);
    for (let i = 0; i < array.length; i += sectionSize) {
      result.push(array.slice(i, i + sectionSize));
    }
    return result;
  }

  // Fetch test data
  useEffect(() => {
    const fetchTest = async () => {
      try {
        const response = await fetch(`/api/grand-tests/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch test");
        }
        const data = await response.json();
        setTest(data.test);
        if (data.current_section) {
          const sections = splitIntoSections(data.questions, 5);
          console.log(sections[section - 1]);
          // setQuestions(data.questions);
          setQuestions(sections[section - 1]);
          setCurrentSection(data.current_section || section);
          //   setCurrentQuestionIndex(sections[section - 1][0].question_order);
          console.log(sections[section - 1][0].question_order);
        }
        setRemainingSeconds(data.remaining_seconds || 2520);

        console.log("Fetched test data:", data);

        if (data.test.user_attempt?.is_completed) {
          setTestCompleted(true);
          setTestStarted(true);
          setShowReviewMode(true);
          setShowExplanation(true);
          setAttemptId(data.test.user_attempt.id);

          const initialAnswers = data.questions.map((q: TestQuestion) => ({
            questionId: q.question_id,
            selectedOption: q.user_answer?.selected_option ?? null,
            isCorrect:
              q.user_answer?.selected_option !== null
                ? q.user_answer?.selected_option === q.question.correct_option
                : false,
          }));
          setUserAnswers(initialAnswers);
        } else {
          const initialAnswers = data.questions.map((q: TestQuestion) => ({
            questionId: q.question_id,
            selectedOption: q.user_answer?.selected_option ?? null,
            isCorrect:
              q.user_answer?.selected_option !== null
                ? q.user_answer?.selected_option === q.question.correct_option
                : false,
          }));
          setUserAnswers(initialAnswers);
          if (data.test.user_attempt) {
            setTestStarted(true);
            setAttemptId(data.test.user_attempt.id);
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

    if (id) {
      fetchTest();
    }
  }, [id, router, section]);

  // Navigation handler
  const navigateToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    setShowExplanation(showReviewMode);
  };

  // Start test
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
        setIsLoading(false);
        setAttemptId(data.attempt.id);
        setTestStarted(true);
      } else {
        throw new Error("Failed to start test");
      }
    } catch (error) {
      console.error("Error starting test:", error);
      toast.error("Failed to start test");
    }
  };

  // Handle answer selection
  const handleAnswerSelect = async (selectedOption: number | null) => {
    if (showReviewMode || testCompleted) return;
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect =
      selectedOption === currentQuestion.question.correct_option;

    const updatedAnswers = userAnswers.map((answer) =>
      answer.questionId === currentQuestion.question_id
        ? { ...answer, selectedOption, isCorrect }
        : answer
    );
    setUserAnswers(updatedAnswers);
    console.log(currentQuestion.question_id);
    try {
      await fetch(`/api/grand-tests/${id}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          currentSection,
          answers: [
            {
              questionId: currentQuestion.question_id,
              selectedOption,
              isCorrect,
            },
          ],
        }),
      });
    } catch (error) {
      console.error("Error saving answer:", error);
      toast.error("Failed to save answer");
    }
  };

  // Navigate to next question
  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowExplanation(showReviewMode);
    }
  };

  // Navigate to previous question (within current section)
  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowExplanation(showReviewMode);
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
        const data = await response.json();
        console.log(data);
        setShowSubmitTestModel(false);
        setTestCompleted(true);
        setSubmitted(true);
        setShowReviewMode(true);
        setShowExplanation(true);

        toast.success("Test submitted successfully!");
      } else {
        throw new Error("Failed to submit section");
      }
    } catch (error) {
      console.error("Error submitting section:", error);
      toast.error("Failed to submit section");
    }
  };

  // Submit current section
  const submitSection = async () => {
    if (!attemptId || !test || testCompleted) return;
    if (section < 6) {
      try {
        const response = await fetch(
          `/api/grand-tests/${test.id}/section-submit`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              attemptId,
              answers: userAnswers,
              sectionNumber: section,
            }),
          }
        );
        if (response.ok) {
          const data = await response.json();
          console.log(data);
          setRemainingSeconds(2520);
          if (section < 5) {
            router.push(`/grand-tests/${id}/section/${Number(section) + 1}`);
          } else {
            setShowSubmitTestModel(true);
          }
        } else {
          throw new Error("Failed to submit section");
        }
      } catch (error) {
        console.error("Error submitting section:", error);
        toast.error("Failed to submit section");
      }
    }
  };

  // Calculate results
  const calculateResults = () => {
    const totalQuestions = userAnswers.length;
    const answeredQuestions = userAnswers.filter(
      (a) => a.selectedOption !== null
    ).length;
    const correctAnswers = userAnswers.filter((a) => a.isCorrect).length;
    const incorrectAnswers = answeredQuestions - correctAnswers;
    const percentage =
      totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : 0;

    return {
      totalQuestions,
      answeredQuestions,
      correctAnswers,
      incorrectAnswers,
      unanswered: totalQuestions - answeredQuestions,
      percentage,
    };
  };

  // Toggle review mode
  const toggleReviewMode = () => {
    setShowReviewMode(!showReviewMode);
    setCurrentQuestionIndex(0);
    setShowExplanation(!showReviewMode);
  };

  // Format timer
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const renderBoldText = (text: string) => {
    const boldText = text.replace(
      /\*(.*?)\*/g,
      '<strong class="font-bold">$1</strong>'
    );
    return <span dangerouslySetInnerHTML={{ __html: boldText }} />;
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if user is not typing in an input field
      const target = event.target as HTMLElement;
      const isInputField =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.contentEditable === "true";

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

    // Add event listener
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup function
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentQuestionIndex, questions.length, test?.test_mode, testCompleted]);

  if (isLoading) {
    return (
      <div className="container mx-auto">
        <UserHeader text="Start Test" />
        <div className=" min-h-[70vh] flex items-center justify-center">
          <LoadingSpinner text="Loading test" />
        </div>
      </div>
    );
  }

  if (!test || questions.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Test Not Found
          </h1>
          <p className="text-foreground/70 mb-6">
            The test you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => router.push("/custom-test/create")}>
            Create New Test
          </Button>
        </div>
      </div>
    );
  }

  // Show loading spinner while starting the test

  // Test start screen (only shown if test is not completed)

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
                    <h2 className="text-xl font-semibold leading-tight">
                      {test.title}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {test.description}
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-6 pb-4 space-y-3">
                <div className="">
                  <div className="flex flex-wrap py-4 gap-3">
                    {Array.isArray(test.subjects) ? (
                      test.subjects.map((s: any) => (
                        <Badge
                          variant={"secondary"}
                          key={s.id}
                          className="text-xs rounded-full items-center justify-center py-1 flex gap-2"
                        >
                          <SubjectIcons subjectName={s.name} styles="w-3 h-3" />
                          {s.name}
                        </Badge>
                      ))
                    ) : test.subjects === "all" ? (
                      <Badge
                        variant="secondary"
                        className="text-xs rounded-full items-center justify-center py-1 flex gap-2"
                      >
                        All Subjects
                      </Badge>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="px-6 pb-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-secondary rounded-xl">
                    <div
                      className="text-lg font-bold"
                      style={{ color: "#6FCCCA" }}
                    >
                      {test.total_questions}
                    </div>
                    <div className="text-xs text-foreground/70">Questions</div>
                  </div>
                  <div className="text-center p-3 bg-secondary rounded-xl">
                    <div
                      className="text-lg font-bold"
                      style={{ color: "#6FCCCA" }}
                    >
                      {test.total_marks}
                    </div>
                    <div className="text-xs text-foreground/70">Points</div>
                  </div>
                </div>
                <div className="flex justify-between items-center text-center p-3 bg-secondary rounded-xl">
                  <div className="text-xs text-gray-400">Share</div>
                  <div
                    className="text-sm font-bold"
                    style={{ color: "#6FCCCA" }}
                  >
                    {test.share_code || "N/A"}
                  </div>
                  <CopyButton text={test.share_code || ""} />
                </div>
              </div>
              <div className="px-6 pb-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Mode
                  </span>
                  <span
                    className="text-xs px-3 py-1 rounded-full font-medium"
                    style={{
                      backgroundColor:
                        test.test_mode === "regular" ? "#6FCCCA20" : "#f3f4f6",
                      color:
                        test.test_mode === "regular" ? "#6FCCCA" : "#6b7280",
                    }}
                  >
                    {test.test_mode === "regular" ? "Regular" : "Exam"}
                  </span>
                </div>
              </div>
              <p></p>
              <div className="p-6 pt-0">
                <button
                  onClick={startTest}
                  className="w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 group bg-[#6FCCCA] hover:bg-[#6FCCCA]/70"
                  disabled={testCompleted || isStarting}
                >
                  <Play className="w-5 h-5 transition-transform" />
                  Start Test
                </button>
              </div>
              <div className="h-1" style={{ backgroundColor: "#6" }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Test taking interface
  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = userAnswers.find(
    (a) => a.questionId === currentQuestion.question_id
  );
  const shouldShowExplanation =
    showReviewMode || (test.test_mode === "regular" && showExplanation);

  const results = calculateResults();

  return (
    <div className="container mx-auto relative">
      {testCompleted && !showReviewMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full mx-auto px-6 fluency-2xl max-w-2xl">
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
                  <CircleProgress
                    percentage={results.percentage}
                    size={120}
                    strokeWidth={10}
                  />
                </div>
                <div className="flex justify-center gap-4">
                  <div className="flex items-center space-x-2">
                    <div className="text-sm text-green-600">
                      {results.correctAnswers}
                    </div>
                    <div className="text-sm text-green-600">Correct</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-sm text-red-600">
                      {results.incorrectAnswers}
                    </div>
                    <div className="text-sm text-red-600">Incorrect</div>
                  </div>
                  {results.unanswered > 0 && (
                    <div className="flex items-center space-x-2">
                      <div className="text-sm text-foreground/70">
                        {results.unanswered}
                      </div>
                      <div className="text-sm text-foreground/70">
                        Unanswered
                      </div>
                    </div>
                  )}
                </div>
                <div className="grid md:grid-cols-1 gap-4">
                  <button
                    onClick={toggleReviewMode}
                    className="flex-1 pushable bg-[#31afad]"
                  >
                    <div className="front bg-[#6FCCCA] py-2">
                      <p className="flex justify-center items-center text-base font-semibold">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Review Answers
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={() => router.push(`/grand-tests/${id}/results`)}
                    className="flex-1 pushable bg-[#c9c99c]"
                  >
                    <div className="front bg-[#ecec7c] py-2 text-black">
                      <p className="flex justify-center items-center text-black text-base font-semibold">
                        <Trophy className="h-4 w-4 mr-2" />
                        See Ranking
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-8 text-center">
            <Award className="mx-auto mb-4 text-yellow-500" size={40} />
            <h2 className="text-2xl font-bold mb-2">Test Submitted!</h2>
            <p className="text-gray-700 mb-6">
              Your test has been submitted successfully.
              <br />
              What would you like to do next?
            </p>
            <div className="flex flex-col gap-3">
              <Button
                className="w-full"
                onClick={() => {
                  setShowReviewMode(false);
                  setSubmitted(false);
                }}
              >
                See Results
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => {
                  setShowReviewMode(true);
                  setSubmitted(false);
                }}
              >
                Review Explanations
              </Button>
            </div>
          </div>
        </div>
      )}

      {!showReviewMode && showSubmitTestModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-8 text-center">
            <Award className="mx-auto mb-4 text-yellow-500" size={40} />
            <h2 className="text-2xl font-bold mb-2">Test Submitted!</h2>
            <p className="text-gray-700 mb-6">
              Test is completed
              <br />
              Please submit your test
            </p>
            <div className="flex flex-col gap-3">
              <Button className="w-full" onClick={submitTest}>
                Submit Test
              </Button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-background/80 backdrop-blur-sm border-border border-b sticky top-0 z-10">
        <div className="container mx-auto py-4 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <SidebarTrigger
              variant={"secondary"}
              className="p-3 rounded-full w-10 h-10"
            />
            <div className="font-semibold">
              Section {section} : {formatTime(remainingSeconds)}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {!showReviewMode ? (
              <button
                onClick={submitSection}
                className="text-[#6FCCCA] bg-transparent shadow-none p-0"
                disabled={testCompleted}
              >
                Submit Section
              </button>
            ) : (
              <button onClick={toggleReviewMode} className="text-[#6FCCCA]">
                See results
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto mt-4">
        {testCompleted && showReviewMode && (
          <div className="px-6">
            <p className="font-semibold">Sections</p>
            <div className="flex items-center justify-start gap-2 mt-4">
              {[1, 2, 3, 4, 5].map((sec) => (
                <button
                  key={sec}
                  onClick={() =>
                    router.push(`/grand-tests/${id}/section/${sec}`)
                  }
                  className={`px-3 py-2 rounded-md text-xs font-semibold transition ${
                    Number(section) === sec
                      ? "bg-primary text-background"
                      : "bg-secondary text-foreground hover:bg-gray-300"
                  }`}
                >
                  {sec}
                </button>
              ))}
            </div>
          </div>
        )}
        <section className="flex gap-2">
          {/* Progress Header */}
          <div className="py-2 px-6 w-1/2 max-w-2xl mx-auto">
            <div className="">
              <div className="border-none shadow-none w-full mx-auto max-w-4xl">
                <div>
                  <div className="flex items-center gap-2 w-full mx-auto flex-wrap py-4 max-w-2xl">
                    {questions.map((_, index) => {
                      const answer = userAnswers[_.question_order - 1];
                      const isAnswered = answer?.selectedOption !== null;
                      const isCurrent = index === currentQuestionIndex;
                      const isCorrect = answer?.isCorrect || false;

                      const getButtonStyle = () => {
                        if (isCurrent) {
                          if (isAnswered && isCorrect && showReviewMode) {
                            return "bg-green-300/50 dark:bg-green-600/50 p-1 border-[#66cccf] border-2";
                          } else if (
                            isAnswered &&
                            !isCorrect &&
                            showReviewMode
                          ) {
                            return "bg-red-200/60 dark:bg-red-600/30 p-1 border-red-300";
                          } else if (isAnswered) {
                            return "bg-[#6FCCCA] p-1 border-[#6FCCCA]";
                          } else {
                            return "border-[#66cccf] p-1 border-2";
                          }
                        }

                        // Show correct/incorrect colors only in review modes
                        if (
                          (test.test_mode === "exam" && testCompleted) ||
                          (test.test_mode === "regular" && isAnswered)
                        ) {
                          if (isAnswered) {
                            return isCorrect
                              ? "bg-green-300/60 border-none"
                              : "bg-red-300/60 border-none";
                          }
                        }
                        // Default answered/unanswered colors
                        return isAnswered
                          ? "bg-[#6FCCCA] border-[#6FCCCA]"
                          : "bg-secondary border-none";
                      };

                      return (
                        <button
                          key={index}
                          onClick={() => navigateToQuestion(index)}
                          className={`w-10 h-10 flex flex-shrink-0 justify-center font-bold items-center text-xs rounded-full border-2 transition-colors  ${getButtonStyle()}`}
                        >
                          {_.question_order}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="mx-auto flex justify-center w-full max-w-4xl px-2">
            {/* Question Panel */}
            <div className="max-w-2xl w-full">
              <Card className="shadow-none border-none">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between gap-3 pt-0">
                    <p className="flex-1 text-xl font-semibold">
                      {currentQuestion.question_order}.{" "}
                      {currentQuestion.question.question_text}
                    </p>
                    {/* Add bookmark button here */}
                    {/* <div className="flex-shrink-0">
                    <BookmarkButton
                      questionId={currentQuestion.question.id}
                      size="sm"
                      variant="ghost"
                    />
                  </div> */}
                  </CardTitle>
                  {currentQuestion.question.images && (
                    <div className="w-full py-4">
                      <Image
                        src={`${currentQuestion.question.images[0]}`}
                        alt="QuestionImage"
                        width={800}
                        height={800}
                        className="rounded-2xl"
                      />
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Answer Options */}
                  <RadioGroup
                    value={currentAnswer?.selectedOption?.toString() || ""}
                    onValueChange={(value) =>
                      handleAnswerSelect(parseInt(value))
                    }
                    disabled={shouldShowExplanation || showReviewMode}
                  >
                    <div className="space-y-3">
                      {[
                        {
                          value: "1",
                          text: currentQuestion.question.option_a,
                          label: "A",
                        },
                        {
                          value: "2",
                          text: currentQuestion.question.option_b,
                          label: "B",
                        },
                        {
                          value: "3",
                          text: currentQuestion.question.option_c,
                          label: "C",
                        },
                        {
                          value: "4",
                          text: currentQuestion.question.option_d,
                          label: "D",
                        },
                      ].map((option) => {
                        const isSelected =
                          currentAnswer?.selectedOption ===
                          parseInt(option.value);
                        const isCorrect =
                          parseInt(option.value) ===
                          currentQuestion.question.correct_option;
                        const showResult = shouldShowExplanation;
                        const isDisabled = showReviewMode;

                        return (
                          <div key={option.value} className="pushable relative">
                            <Label
                              id={`label-${option.value}`}
                              htmlFor={option.value}
                              className={`front text-sm flex justify-between items-center space-x-3 py-4 rounded-lg border relative ${
                                showResult
                                  ? isCorrect
                                    ? "bg-green-300/50 dark:bg-green-600/50 border-none"
                                    : isSelected && !isCorrect
                                    ? "bg-red-200 dark:bg-red-600/30 border-none"
                                    : "border-none bg-background shadow"
                                  : isSelected
                                  ? "bg-[#6FCCCA]/30 border-none"
                                  : "bg-background shadow border-none hover:bg-secondary"
                              } ${
                                isDisabled
                                  ? "cursor-not-allowed opacity-75"
                                  : ""
                              }`}
                            >
                              <div className="flex items-center space-x-3 py-1 px-3 rounded-lg w-full">
                                <RadioGroupItem
                                  value={option.value}
                                  id={option.value}
                                  disabled={isDisabled}
                                  className="text-gray-500"
                                />
                                <p className="font-medium px-2 py-1 rounded">
                                  {option.label}
                                </p>
                                <span className="flex-1">{option.text}</span>
                                {showResult && isCorrect && (
                                  <span className="text-xs text-green-700 dark:text-green-300 font-bold">
                                    correct
                                  </span>
                                )}
                                {showResult && isSelected && !isCorrect && (
                                  <span className="text-xs text-red-600 dark:text-red-300 font-bold">
                                    incorrect
                                  </span>
                                )}
                              </div>
                            </Label>
                          </div>
                        );
                      })}
                    </div>

                    {/* Clear Selection Button */}
                    {!shouldShowExplanation && !showReviewMode && (
                      <div className="flex justify-start">
                        <button
                          type="button"
                          onClick={() => handleAnswerSelect(null)}
                          className="text-primary"
                        >
                          Clear Selection
                        </button>
                      </div>
                    )}
                  </RadioGroup>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-4 border-t">
                    <div className="flex gap-2">
                      <button
                        onClick={previousQuestion}
                        className="flex items-center text-[#6FCCCA] bg-transparent shadow-none p-0 font-bold disabled:text-gray-400 disabled:cursor-not-allowed"
                        disabled={currentQuestionIndex === 0}
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Previous
                      </button>
                    </div>
                    <div className="flex gap-2">
                      {showReviewMode ? (
                        <button
                          onClick={nextQuestion}
                          className="flex items-center text-[#6FCCCA] bg-transparent shadow-none p-0 font-bold disabled:text-gray-400 disabled:cursor-not-allowed"
                          disabled={
                            currentQuestionIndex === questions.length - 1
                          }
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </button>
                      ) : currentQuestionIndex === questions.length - 1 ? (
                        <Button
                          onClick={submitTest}
                          className="bg-[#6FCCCA] hover:bg-[#6FCCCA]/60 font-bold text-white"
                        >
                          Submit Test
                        </Button>
                      ) : (
                        <button
                          onClick={nextQuestion}
                          className="flex items-center text-[#6FCCCA] bg-transparent shadow-none p-0 font-bold "
                          disabled={
                            currentQuestionIndex === questions.length - 1 &&
                            test.test_mode === "regular"
                          }
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </button>
                      )}
                    </div>
                  </div>
                  {/* Explanation */}
                  {shouldShowExplanation && (
                    <div className="mt-6 py-4 border-none rounded-lg w-full">
                      <h4 className="font-medium text-sm uppercase text-foreground/30  mb-2">
                        Explanation
                      </h4>
                      <p className=" py-4 leading-relaxed whitespace-pre-wrap text-foreground/70 w-full break-words">
                        {renderBoldText(currentQuestion.question.explanation)}
                      </p>
                      <div className="flex flex-col items-start gap-2 mt-2 text-foreground/70">
                        <p className="text-xs font-bold">
                          {/* {currentQuestion.question.subjects.name} */}
                        </p>
                        {/* <span className="text-sm">•</span> */}
                        <span className="text-xs">
                          {/* {currentQuestion.question.topics.name} */}
                        </span>
                      </div>
                      <p className="text-xs py-4 text-foreground/50 flex items-center gap-2">
                        {currentQuestion.question_id}{" "}
                        <CopyButton
                          text={currentQuestion.question_id}
                          size="sm"
                        />
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
