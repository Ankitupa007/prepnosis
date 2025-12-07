// app/grand-tests/[id]/page.tsx
"use client";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import SubjectIcons from "@/components/common/SubjectIcons";
import CopyButton from "@/components/copy-to-clipboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import UserHeader from "@/components/user-header";
import { useAuth } from "@/lib/auth-context";
import {
  ArrowRight,
  CheckSquare,
  ClipboardPlus,
  Play,
  Trophy,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import { Test } from "@/lib/types/grand-tests-types";

export default function GrandTestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [test, setTest] = useState<Test | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const { id } = use(params);

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
        setTestCompleted(data.test?.user_attempt?.is_completed || false);

        console.log("Fetched test data:", data);
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
  }, [id, router]);

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
        const currentSection = data.attempt.current_section || 1;
        toast.success("Test started successfully!");
        setAttemptId(data.attempt.id);
        setTestStarted(true);
        router.push(`/grand-tests/${id}/section/${currentSection}`);
      } else {
        throw new Error("Failed to start test");
      }
    } catch (error) {
      console.error("Error starting test:", error);
      toast.error("Failed to start test");
    } finally {
      setIsLoading(false);
    }
  };

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

  if (!test) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Test Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The test you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => router.push("/custom-test/create")}>
            Create New Test
          </Button>
        </div>
      </div>
    );
  }

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
                    <div className="text-xs text-gray-600">Questions</div>
                  </div>
                  <div className="text-center p-3 bg-secondary rounded-xl">
                    <div
                      className="text-lg font-bold"
                      style={{ color: "#6FCCCA" }}
                    >
                      {test.total_marks}
                    </div>
                    <div className="text-xs text-gray-600">Points</div>
                  </div>
                </div>
              </div>
              <div className="px-6 pb-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    Mode
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full font-medium bg-[#66cccf] text-foreground">
                    Exam
                  </span>
                </div>
              </div>
              <p></p>
              <div className="p-6 pt-0">
                {test.user_attempt ? (
                  <>
                    {!testCompleted && test.user_attempt.current_section && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Current Progress:</strong> Section {test.user_attempt.current_section}
                        </p>
                      </div>
                    )}
                    <button
                      onClick={startTest}
                      className="w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 group bg-[#6FCCCA] hover:bg-[#6FCCCA]/70"
                      disabled={testCompleted}
                    >
                      Continue test
                      <ArrowRight className="w-5 h-5 transition-transform" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={startTest}
                    className="w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 group bg-[#6FCCCA] hover:bg-[#6FCCCA]/70"
                    disabled={testCompleted}
                  >
                    <Play className="w-5 h-5 transition-transform" />
                    Start Test
                  </button>
                )}
              </div>
              <div className="h-1" style={{ backgroundColor: "#6" }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto relative">
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
                <div className=""></div>
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
                    <div className="text-xs text-gray-600">Questions</div>
                  </div>
                  <div className="text-center p-3 bg-secondary rounded-xl">
                    <div
                      className="text-lg font-bold"
                      style={{ color: "#6FCCCA" }}
                    >
                      {test.total_marks}
                    </div>
                    <div className="text-xs text-gray-600">Points</div>
                  </div>
                </div>
              </div>
              <div className="px-6 pb-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    Mode
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full font-medium bg-[#66cccf] text-background">
                    Exam
                  </span>
                </div>
              </div>
              <p></p>
              <div className="p-6 pt-0">
                {testCompleted ? (
                  <div className="flex flex-col gap-4">
                    <button
                      onClick={() =>
                        router.push(`/grand-tests/${id}/analysis`)
                      }
                      className="w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 group bg-[#6FCCCA] hover:bg-[#6FCCCA]/70"
                    >
                      <CheckSquare className="w-5 h-5 transition-transform" />
                      View Analysis
                    </button>
                    <button
                      onClick={() => router.push(`/grand-tests/${id}/results`)}
                      className="w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 group bg-[#6FCCCA] hover:bg-[#6FCCCA]/70"
                    >
                      <Trophy className="w-5 h-5 transition-transform" />
                      View Leaderboard
                    </button>
                    <button
                      onClick={() => router.push(`/grand-tests/`)}
                      className="text-primary flex w-full justify-center items-center gap-2 py-2"
                    >
                      {/* <ArrowLeft className="w-4 h-4 transition-transform" /> */}
                      See more Grand Tests
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={startTest}
                    className="w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 group bg-[#6FCCCA] hover:bg-[#6FCCCA]/70"
                  >
                    <Play className="w-5 h-5 transition-transform" />
                    Start Test
                  </button>
                )}
              </div>
              <div className="h-1" style={{ backgroundColor: "#6" }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
