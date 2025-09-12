"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/lib/auth-context";
import { format, formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Image from "next/image";

interface Test {
  id: string;
  title: string;
  description: string;
  test_mode: "exam";
  total_questions: number;
  total_marks: number;
  exam_pattern: "NEET_PG" | "INICET";
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
          <h1 className="text-3xl sm:text-3xl font-bold text-foreground tracking-tight">
            Your Grand Tests
          </h1>
          <p className="mt-2 text-foreground/60">
            Explore all available grand tests and track your performance.
          </p>
          <Tabs defaultValue="grand-tests" className="w-full max-w-4xl py-6">
            <TabsList>
              <TabsTrigger value="grand-tests">Grand Tests</TabsTrigger>
              <TabsTrigger value="neetpg">NEET PG</TabsTrigger>
            </TabsList>
            <TabsContent value="grand-tests" className="max-w-7xl py-6">
              {loading ? (
                <div className="flex items-center justify-center min-h-screen">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="space-y-6">
                  {tests.length === 0 ? (
                    <Card className="p-6 bg-card text-center">
                      <p className="text-foreground/70">
                        No grand tests available.
                      </p>
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
                          <Card className="p-2 bg-card border-border shadow-none transition-all duration-300 rounded-b-none w-full max-w-7xl border-b-0">
                            <div className="flex flex-row gap-4">
                              {/* Image Section */}
                              <div className="relative w-full md:w-1/6">
                                <Badge
                                  variant={
                                    status.status === "completed"
                                      ? "default"
                                      : "secondary"
                                  }
                                  className={`absolute top-2 left-2 flex items-center gap-1 px-3 py-1 font-medium text-xs rounded-full
              ${status.status === "completed"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                      : "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400"
                                    }`}
                                >
                                  {status.status === "completed" ? (
                                    <CheckCircle className="h-3 w-3" />
                                  ) : (
                                    <Clock className="h-3 w-3" />
                                  )}
                                  {status.message}
                                </Badge>
                                <Image
                                  src="/images/gt.png"
                                  alt="Grand Test Image"
                                  width={400}
                                  height={400}
                                  className="rounded-xl w-full object-cover"
                                  priority
                                />
                              </div>

                              {/* Content Section */}
                              <div className="flex-1 space-y-4 w-full p-2">
                                {/* Header */}
                                <div className="space-y-2">
                                  <h2 className="md:text-xl font-bold text-foreground group-hover:text-[#66CCCF] transition-colors duration-300">
                                    {test.exam_pattern} | {test.title}
                                  </h2>
                                  <p className="text-muted-foreground text-sm line-clamp-2">
                                    {test.description ||
                                      "No description available"}
                                  </p>
                                </div>

                                {/* Test Stats */}
                                {/* <div className="flex gap-3 flex-wrap py-4 border-t border-border">
                                  <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary">
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
                                  <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary">
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
                                  <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary">
                                    <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                                      <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground">
                                        Pattern
                                      </p>
                                      <p className="font-semibold text-foreground text-xs">
                                        {test.exam_pattern}
                                      </p>
                                    </div>
                                  </div>
                                </div> */}

                                {/* Performance Section */}
                                {/* {test.attempts?.length > 0 && (
                            <div className="p-4 rounded-lg bg-gradient-to-r from-[#66CCCF]/10 to-[#66CCCF]/5 border border-[#66CCCF]/20">
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                  <TrendingUp className="h-4 w-4 text-[#66CCCF]" />
                                  Your Performance
                                </h3>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-[#66CCCF]/20 to-[#66CCCF]/10 border border-[#66CCCF]/30">
                                  <div className="p-2 rounded-full bg-[#66CCCF]/20">
                                    <Trophy className="h-5 w-5 text-[#66CCCF]" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">
                                      Score
                                    </p>
                                    <p className="text-lg font-bold text-[#66CCCF]">
                                      {test.attempts[0].score}%
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
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
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
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
                          )} */}

                                {/* Action Buttons */}
                                {/* Buttons */}
                                <div className="flex flex-col gap-3">
                                  {status.status === "available" && (
                                    <div className="flex flex-col md:flex-row gap-3">
                                      <Button
                                        size="lg"
                                        onClick={() =>
                                          router.push(`/grand-tests/${test.id}`)
                                        }
                                        className="w-full bg-[#66CCCF] hover:bg-[#66CCCF]/90 text-white font-semibold"
                                      >
                                        <PlayCircle className="h-5 w-5 mr-2" />
                                        Attempt Test
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={() =>
                                          router.push(
                                            `/grand-tests/${test.id}/`
                                          )
                                        }
                                        className="w-full border-[#66CCCF]/30 text-[#66CCCF] hover:bg-[#66CCCF]/10 hover:border-[#66CCCF]/50 transition-all duration-300"
                                      >
                                        <Info className="h-5 w-5" />
                                        Test Details
                                      </Button>
                                    </div>
                                  )}
                                  {status.status === "completed" && (
                                    <div className="flex flex-col md:flex-row gap-3">
                                      <Button
                                        size="lg"
                                        onClick={() =>
                                          router.push(
                                            `/grand-tests/${test.id}/section/1`
                                          )
                                        }
                                        className="w-full bg-[#66CCCF] hover:bg-[#66CCCF]/90 text-white font-semibold transition-all duration-300"
                                      >
                                        <BarChart3 className="h-5 w-5" />
                                        Analyze Test
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={() =>
                                          router.push(
                                            `/grand-tests/${test.id}/results`
                                          )
                                        }
                                        className="w-full border-[#66CCCF]/30 text-[#66CCCF] hover:bg-[#66CCCF]/10 hover:border-[#66CCCF]/50 transition-all duration-300"
                                      >
                                        <Trophy className="h-5 w-5" />
                                        Results
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Card>
                          <div className="border bg-card rounded-b-xl -top-5 px-4 py-1.5 border-border flex justify-between items-center">
                            <p className="text-xs text-foreground/60">
                              200 Questions | 800 Marks{" "}
                            </p>
                            <p className="text-xs text-foreground/60">
                              {format(
                                new Date(test.created_at),
                                "dd MMM, yyyy"
                              )}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              )}
            </TabsContent>
            <TabsContent value="neetpg">Change your password here.</TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </div>
  );
}
