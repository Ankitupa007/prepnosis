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
  CheckCircle,
  Timer,
  Info,
  Filter,
  Search,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/lib/auth-context";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [filter, setFilter] = useState<"all" | "completed" | "available">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [patternFilter, setPatternFilter] = useState<"all" | "NEET_PG" | "INICET">("all");

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

  const filteredTests = tests.filter((test) => {
    const status = getTestStatus(test).status;
    const matchesFilter =
      filter === "all" ||
      (filter === "completed" && status === "completed") ||
      (filter === "available" && status === "available");

    const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPattern = patternFilter === "all" || test.exam_pattern === patternFilter;

    return matchesFilter && matchesSearch && matchesPattern;
  });

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
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Grand Tests
            </h1>
            <p className="mt-1 text-foreground/60">
              Practice with full-length exams to assess your preparation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-card border rounded-lg p-1 flex items-center">
              <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-9">
                  <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
                  <TabsTrigger value="available" className="text-xs sm:text-sm">Available</TabsTrigger>
                  <TabsTrigger value="completed" className="text-xs sm:text-sm">Completed</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center bg-card p-4 rounded-xl border shadow-sm">
          <div className="relative w-full sm:w-auto sm:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tests..."
              className="pl-9 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={patternFilter} onValueChange={(v) => setPatternFilter(v as any)}>
            <SelectTrigger className="w-full sm:w-[180px] bg-background">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Exam Pattern" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Patterns</SelectItem>
              <SelectItem value="NEET_PG">NEET PG</SelectItem>
              <SelectItem value="INICET">INICET</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tests Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredTests.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="bg-secondary/50 p-6 rounded-full mb-4">
                  <BookOpen className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold">No tests found</h3>
                <p className="text-muted-foreground mt-2">
                  Try adjusting your filters or search query.
                </p>
                <Button
                  variant="link"
                  onClick={() => {
                    setFilter("all");
                    setSearchQuery("");
                    setPatternFilter("all");
                  }}
                  className="mt-4"
                >
                  Clear all filters
                </Button>
              </motion.div>
            ) : (
              filteredTests.map((test, index) => {
                const status = getTestStatus(test);
                const latestAttempt = test.attempts[0];
                const isCompleted = status.status === "completed";

                return (
                  <motion.div
                    key={test.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="overflow-hidden border-border hover:border-[#66CCCF]/50 transition-all duration-300 hover:shadow-md group h-full flex flex-col">
                      <div className="flex flex-col sm:flex-row h-full">
                        {/* Left Side: Image & Basic Info */}
                        <div className="sm:w-1/3 bg-secondary/30 relative flex flex-col">
                          <div className="relative aspect-video sm:aspect-square w-full overflow-hidden">
                            <Image
                              src="/images/gt.png"
                              alt="Grand Test"
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent sm:hidden" />
                            <Badge
                              className={`absolute top-3 left-3 z-10 backdrop-blur-md border-0 ${isCompleted
                                  ? "bg-green-500/90 text-white"
                                  : "bg-blue-500/90 text-white"
                                }`}
                            >
                              {isCompleted ? (
                                <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Completed</span>
                              ) : (
                                <span className="flex items-center gap-1"><PlayCircle className="h-3 w-3" /> Available</span>
                              )}
                            </Badge>
                          </div>
                          <div className="p-4 flex-1 flex flex-col justify-between sm:hidden">
                            {/* Mobile specific content if needed */}
                          </div>
                        </div>

                        {/* Right Side: Content */}
                        <div className="flex-1 flex flex-col p-5">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <Badge variant="outline" className="mb-2 text-xs font-normal text-muted-foreground border-muted-foreground/30">
                                {test.exam_pattern}
                              </Badge>
                              <h3 className="text-lg font-bold line-clamp-1 group-hover:text-[#66CCCF] transition-colors">
                                {test.title}
                              </h3>
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                            {test.description || "Comprehensive grand test to evaluate your readiness."}
                          </p>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-3 gap-2 mb-4">
                            <div className="bg-secondary/50 rounded-lg p-2 text-center">
                              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                                <BookOpen className="h-3 w-3" />
                                <span className="text-[10px] uppercase font-bold">Ques</span>
                              </div>
                              <span className="text-sm font-semibold">{test.total_questions}</span>
                            </div>
                            <div className="bg-secondary/50 rounded-lg p-2 text-center">
                              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                                <Target className="h-3 w-3" />
                                <span className="text-[10px] uppercase font-bold">Marks</span>
                              </div>
                              <span className="text-sm font-semibold">{test.total_marks}</span>
                            </div>
                            <div className="bg-secondary/50 rounded-lg p-2 text-center">
                              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                                <Clock className="h-3 w-3" />
                                <span className="text-[10px] uppercase font-bold">Time</span>
                              </div>
                              <span className="text-sm font-semibold">200m</span>
                            </div>
                          </div>

                          {/* Completed Stats Overlay */}
                          {isCompleted && latestAttempt && (
                            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/30 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Trophy className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium text-green-700 dark:text-green-400">Your Score</span>
                              </div>
                              <span className="text-lg font-bold text-green-700 dark:text-green-400">
                                {latestAttempt.score} <span className="text-xs font-normal opacity-70">/ {test.total_marks}</span>
                              </span>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2 mt-auto">
                            {isCompleted ? (
                              <>
                                <Button
                                  className="flex-1 bg-[#66CCCF] hover:bg-[#66CCCF]/90 text-white"
                                  onClick={() => router.push(`/grand-tests/${test.id}/analysis`)}
                                >
                                  <BarChart3 className="h-4 w-4 mr-2" />
                                  Analysis
                                </Button>
                                <Button
                                  variant="outline"
                                  className="flex-1 border-[#66CCCF]/30 text-[#66CCCF] hover:bg-[#66CCCF]/10"
                                  onClick={() => router.push(`/grand-tests/${test.id}/results`)}
                                >
                                  <Trophy className="h-4 w-4 mr-2" />
                                  Rank
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  className="flex-1 bg-[#66CCCF] hover:bg-[#66CCCF]/90 text-white"
                                  onClick={() => router.push(`/grand-tests/${test.id}`)}
                                >
                                  <PlayCircle className="h-4 w-4 mr-2" />
                                  Start Test
                                </Button>
                                <Button
                                  variant="outline"
                                  className="px-3"
                                  onClick={() => router.push(`/grand-tests/${test.id}`)}
                                >
                                  <Info className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
