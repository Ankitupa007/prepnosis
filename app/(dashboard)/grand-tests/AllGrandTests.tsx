"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Clock,
  Trophy,
  PlayCircle,
  BarChart3,
  AlertTriangle,
  Target,
  ListTodo,
  RotateCcw,
  Timer,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/lib/auth-context";
import { format, formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface Test {
  id: string;
  title: string;
  description: string;
  test_mode: "exam";
  total_questions: number;
  total_marks: number;
  created_at: string;
  attempts: {
    id: string;
    score: number;
    total_questions: number;
    correct_answers: number;
    completed_at: string | null;
    time_taken: number;
  }[];
  _count: {
    attempts: number;
  };
}

export default function UserGrandTestsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserTests();
    }
  }, [user]);

  const fetchUserTests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/grand-tests/`);
      if (!response.ok) throw new Error("Failed to fetch tests");
      const { tests } = await response.json();
      setTests(tests);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tests");
    } finally {
      setLoading(false);
    }
  };

  const getTestStatus = (test: Test) => {
    const latestAttempt = test.attempts[0];
    if (latestAttempt?.completed_at) {
      return { status: "completed", message: "Completed", color: "green" };
    }
    return { status: "available", message: "Available", color: "blue" };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-5 w-5" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Your Grand Tests
          </h1>
          <p className="mt-2 text-foreground/60">
            Explore all available grand tests and track your performance.
          </p>
        </div>
        {loading ? (
          <div className="flex items-center justify-center min-h-screen">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-6">
            {tests.length === 0 ? (
              <Card className="p-6 bg-card shadow-lg text-center">
                <p className="text-foreground/70">No grand tests available.</p>
              </Card>
            ) : (
              tests.map((test, index) => {
                const status = getTestStatus(test);
                return (
                  <motion.div
                    key={test.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <Card className="group p-6 bg-card border-2 border-border hover:border-[#66CCCF]/40 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
                      <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
                        {/* Main Content */}
                        <div className="flex-1 space-y-4">
                          {/* Header Section */}
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <h2 className="text-xl font-bold text-foreground group-hover:text-[#66CCCF] transition-colors duration-300">
                                  {test.title}
                                </h2>
                                <p className="text-muted-foreground mt-1 line-clamp-2 text-sm leading-relaxed">
                                  {test.description}
                                </p>
                              </div>
                              <Badge
                                variant={
                                  status.status === "completed"
                                    ? "default"
                                    : "secondary"
                                }
                                className={`
              flex items-center gap-1 px-3 py-1 font-medium text-xs rounded-full
              ${
                status.status === "completed"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400"
              }
            `}
                              >
                                {status.status === "completed" ? (
                                  <CheckCircle className="h-3 w-3" />
                                ) : (
                                  <Clock className="h-3 w-3" />
                                )}
                                {status.message}
                              </Badge>
                            </div>
                          </div>

                          {/* Test Statistics */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 border-t border-border">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                                <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Questions
                                </p>
                                <p className="font-semibold text-foreground">
                                  {test.total_questions}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                                <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Total Marks
                                </p>
                                <p className="font-semibold text-foreground">
                                  {test.total_marks}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                              <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                                <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Created
                                </p>
                                <p className="font-semibold text-foreground text-xs">
                                  {formatDistanceToNow(
                                    new Date(test.created_at),
                                    { addSuffix: true }
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Latest Attempt - Enhanced with Score Prominence */}
                          {test.attempts.length > 0 && (
                            <div className="p-4 rounded-lg bg-gradient-to-r from-[#66CCCF]/10 to-[#66CCCF]/5 border border-[#66CCCF]/20">
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                  <TrendingUp className="h-4 w-4 text-[#66CCCF]" />
                                  Your Performance
                                </h3>
                                {/* {test.attempts[0].rank && (
                                  <Badge className="bg-[#66CCCF]/20 text-[#66CCCF] border-[#66CCCF]/30">
                                    Rank #{test.attempts[0].rank}
                                  </Badge>
                                )} */}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {/* Score - Most Prominent */}
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-[#66CCCF]/20 to-[#66CCCF]/10 border border-[#66CCCF]/30">
                                  <div className="p-2 rounded-full bg-[#66CCCF]/20">
                                    <Trophy className="h-5 w-5 text-[#66CCCF]" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">
                                      Score
                                    </p>
                                    <p className="text-xl font-bold text-[#66CCCF]">
                                      {test.attempts[0].score}%
                                    </p>
                                  </div>
                                </div>

                                {/* Correct Answers */}
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                                  <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">
                                      Correct
                                    </p>
                                    <p className="font-semibold text-foreground">
                                      {test.attempts[0].correct_answers}/
                                      {test.total_questions}
                                    </p>
                                  </div>
                                </div>

                                {/* Time Taken */}
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                                  <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                                    <Timer className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">
                                      Time
                                    </p>
                                    <p className="font-semibold text-foreground">
                                      {test.attempts[0].time_taken}m
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3 min-w-[200px]">
                          {status.status === "available" && (
                            <Button
                              size="lg"
                              onClick={() =>
                                router.push(`/grand-tests/${test.id}`)
                              }
                              className="bg-[#66CCCF] hover:bg-[#66CCCF]/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                            >
                              <PlayCircle className="h-5 w-5 mr-2" />
                              Start Test
                            </Button>
                          )}

                          {status.status === "completed" && (
                            <div className="space-y-3">
                              <Button
                                size="lg"
                                onClick={() =>
                                  router.push(`/grand-tests/${test.id}/`)
                                }
                                className="w-full bg-[#66CCCF] hover:bg-[#66CCCF]/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                              >
                                <BarChart3 className="h-5 w-5 mr-2" />
                                View Analysis
                              </Button>

                              <Button
                                variant="outline"
                                size="lg"
                                onClick={() =>
                                  router.push(`/grand-tests/${test.id}/results`)
                                }
                                className="w-full border-[#66CCCF]/30 text-[#66CCCF] hover:bg-[#66CCCF]/10 hover:border-[#66CCCF]/50 transition-all duration-300"
                              >
                                <Trophy className="h-5 w-5 mr-2" />
                                View Results
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
