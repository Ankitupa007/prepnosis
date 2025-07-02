"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  BookOpen,
  CheckCircle,
  ChevronRight,
  Clock,
  Eye,
  Filter,
  Play,
  Search,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

// Types based on your database schema
interface GrandTest {
  id: string;
  title: string;
  description: string | null;
  test_type: "grand_test";
  test_mode: "regular" | "exam";
  exam_pattern: "NEET_PG" | "INICET";
  total_questions: number;
  total_marks: number;
  duration_minutes: number;
  negative_marking: number;
  sections: any;
  is_active: boolean;
  created_by: string;
  created_at: string;
  total_participants?: number;
  user_attempt?: {
    id: string;
    total_score: number;
    correct_answers: number;
    incorrect_answers: number;
    unanswered: number;
    is_completed: boolean;
    submitted_at: string | null;
    time_taken_minutes: number;
  } | null;
  user_ranking?: {
    rank: number;
    percentile: number;
    score: number;
  } | null;
}

interface GrandTestsStats {
  tests_attempted: number;
  best_rank: number | null;
  average_score: number;
  total_participants: number;
  average_percentile: number;
}

const AllGrandTests = () => {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExamPattern, setSelectedExamPattern] = useState("all");

  // Fetch grand tests with user data
  const { data: grandTests = [], isLoading: testsLoading } = useQuery({
    queryKey: ["grand-tests", selectedFilter, selectedExamPattern],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedFilter !== "all") params.append("status", selectedFilter);
      if (selectedExamPattern !== "all")
        params.append("exam_pattern", selectedExamPattern);

      const response = await fetch(`/api/tests/grand-tests?${params}`);
      if (!response.ok) throw new Error("Failed to fetch grand tests");
      return response.json() as Promise<GrandTest[]>;
    },
  });

  // Fetch user stats - computed from the grand tests data
  const stats = React.useMemo(() => {
    if (!grandTests.length) return null;

    const attempted = grandTests.filter(
        (test) => test.user_attempt?.is_completed
    ).length;
    const rankings = grandTests
        .filter((test) => test.user_ranking)
        .map((test) => test.user_ranking!);

    const bestRank =
        rankings.length > 0 ? Math.min(...rankings.map((r) => r.rank)) : null;

    const avgPercentile =
        rankings.length > 0
            ? rankings.reduce((sum, r) => sum + r.percentile, 0) / rankings.length
            : 0;

    return {
      tests_attempted: attempted,
      best_rank: bestRank,
      average_score: avgPercentile,
      total_participants: grandTests.reduce(
          (sum, test) => sum + (test.total_participants || 0),
          0
      ),
      average_percentile: avgPercentile,
    };
  }, [grandTests]);

  const filteredTests = grandTests.filter((test) => {
    const matchesSearch =
        test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getTestStatus = (test: GrandTest) => {
    // Check if user has attempted the test
    if (test.user_attempt) {
      if (test.user_attempt.is_completed) return "completed";
      return "in_progress";
    }

    // All active tests are available to attempt
    return test.is_active ? "available" : "inactive";
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: {
        color: "bg-green-100 text-green-700 border-green-200",
        label: "Available",
        icon: Play,
      },
      completed: {
        color: "bg-purple-100 text-purple-700 border-purple-200",
        label: "Completed",
        icon: CheckCircle,
      },
      in_progress: {
        color: "bg-yellow-100 text-yellow-700 border-yellow-200",
        label: "In Progress",
        icon: Clock,
      },
      inactive: {
        color: "bg-gray-100 text-gray-600 border-gray-200",
        label: "Inactive",
        icon: Clock,
      },
    };

    const config =
        statusConfig[status as keyof typeof statusConfig] ||
        statusConfig.available;
    const Icon = config.icon;

    return (
        <Badge variant="outline" className={`${config.color}`}>
          <Icon className="w-3 h-3 mr-1" />
          {config.label}
        </Badge>
    );
  };

  const getDifficultyColor = (totalQuestions: number) => {
    if (totalQuestions <= 50) return "text-green-600";
    if (totalQuestions <= 150) return "text-yellow-600";
    return "text-red-600";
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank <= 10) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    if (rank <= 50) return "bg-green-100 text-green-800 border-green-300";
    if (rank <= 100) return "bg-blue-100 text-blue-800 border-blue-300";
    return "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getPercentileBadgeColor = (percentile: number) => {
    if (percentile >= 95)
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    if (percentile >= 90) return "bg-green-100 text-green-800 border-green-300";
    if (percentile >= 75) return "bg-blue-100 text-blue-800 border-blue-300";
    return "bg-gray-100 text-gray-800 border-gray-300";
  };

  const handleTestAction = async (
      test: GrandTest,
      action: "start" | "view" | "rankings" | "review"
  ) => {
    switch (action) {
      case "start":
        router.push(`/grand-tests/${test.id}/attempt`);
        break;
      case "view":
        router.push(`/grand-tests/${test.id}`);
        break;
      case "rankings":
        router.push(`/grand-tests/${test.id}/rankings`);
        break;
      case "review":
        router.push(`/grand-tests/${test.id}`);
        break;
    }
  };

  const getStatusColor = (status: any) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-700 border-green-200";
      case "completed":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "in_progress":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "inactive":
        return "bg-gray-100 text-gray-600 border-gray-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const getStatusText = (status: any) => {
    switch (status) {
      case "available":
        return "Available";
      case "completed":
        return "Completed";
      case "in_progress":
        return "In Progress";
      case "inactive":
        return "Inactive";
      default:
        return "Available";
    }
  };

  const getRankColor = (rank: number) => {
    if (rank <= 10) return "text-yellow-600 bg-yellow-50";
    if (rank <= 50) return "text-orange-600 bg-orange-50";
    if (rank <= 100) return "text-blue-600 bg-blue-50";
    return "text-gray-600 bg-gray-50";
  };

  const TestCard = ({ test }: { test: GrandTest }) => {
    const status = getTestStatus(test);
    const hasAttempted = !!test.user_attempt;
    const isCompleted = test.user_attempt?.is_completed;

    const handleAction = (action: string) => {
      console.log(`${action} clicked for test:`, test.id);
    };

    return (
        <div className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden">
          {/* Header Section */}
          <div className="p-6 pb-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        status
                    )}`}
                >
                  {getStatusText(status)}
                </span>
                  {hasAttempted && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600 border border-indigo-200">
                    <Target className="w-3 h-3 inline mr-1" />
                    Attempted
                  </span>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {test.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  {test.exam_pattern.replace("_", " ")}
                </span>
                  {test.negative_marking > 0 && (
                      <span className="text-red-500">
                    -{test.negative_marking} marking
                  </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4 py-4 border-t border-b border-gray-50">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {test.total_questions}
                </div>
                <div className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-1">
                  <Target className="w-3 h-3" />
                  Questions
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {test.duration_minutes}
                </div>
                <div className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-1">
                  <Clock className="w-3 h-3" />
                  Minutes
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {test.total_marks}
                </div>
                <div className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-1">
                  <Trophy className="w-3 h-3" />
                  Marks
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {test.total_participants || 0}
                </div>
                <div className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-1">
                  <Users className="w-3 h-3" />
                  Attempted
                </div>
              </div>
            </div>

            {/* Difficulty Info */}
            <div className="mt-4 p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Star className="w-4 h-4 text-amber-500" />
                  <span className="text-gray-600">
                  Difficulty:{" "}
                    <span className="font-medium">
                    {test.total_questions <= 50
                        ? "Easy"
                        : test.total_questions <= 150
                            ? "Medium"
                            : "Hard"}
                  </span>
                </span>
                </div>
                <div className="text-xs text-gray-500">
                  {test.sections.length} sections
                </div>
              </div>
            </div>
          </div>

          {/* Results Section for Completed Tests */}
          {isCompleted && test.user_attempt && (
              <div className="mx-6 mb-4 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border border-emerald-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {test.user_attempt.total_score}/{test.total_marks}
                      </div>
                      <div className="text-sm text-gray-600">Final Score</div>
                    </div>
                  </div>
                  {test.user_ranking && (
                      <div className="text-right">
                        <div
                            className={`text-lg font-bold ${
                                getRankColor(test.user_ranking.rank).split(" ")[0]
                            }`}
                        >
                          #{test.user_ranking.rank}
                        </div>
                        <div className="text-xs text-gray-500">
                          {test.user_ranking.percentile}th percentile
                        </div>
                      </div>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-3 text-center text-xs">
                  <div>
                    <div className="font-semibold text-emerald-600">
                      {test.user_attempt.correct_answers}
                    </div>
                    <div className="text-gray-500">Correct</div>
                  </div>
                  <div>
                    <div className="font-semibold text-red-500">
                      {test.user_attempt.incorrect_answers}
                    </div>
                    <div className="text-gray-500">Wrong</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-500">
                      {test.user_attempt.unanswered}
                    </div>
                    <div className="text-gray-500">Skipped</div>
                  </div>
                  <div>
                    <div className="font-semibold text-blue-600">
                      {test.user_attempt.time_taken_minutes}m
                    </div>
                    <div className="text-gray-500">Time</div>
                  </div>
                </div>
              </div>
          )}

          {/* Action Footer */}
          <div className="px-6 pb-6">
            <div className="flex items-center gap-3">
              {isCompleted ? (
                  <>
                    <button
                        onClick={() => router.push(`/grand-tests/${test.id}`)}
                        className="flex-1 bg-gray-900 text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Review Answers
                    </button>
                    <button
                        onClick={() => handleAction("rankings")}
                        className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-700"
                    >
                      <BarChart3 className="w-4 h-4" />
                      Rankings
                    </button>
                  </>
              ) : status === "available" ? (
                  <button
                      onClick={() => router.push(`/grand-tests/${test.id}`)}
                      className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Start Test
                  </button>
              ) : (
                  <button
                      onClick={() => router.push(`/grand-tests/${test.id}`)}
                      className="flex-1 bg-orange-300 text-white py-3 px-4 rounded-xl font-medium hover:bg-orange-500 transition-colors flex items-center justify-center gap-2"
                  >
                    <Clock className="w-4 h-4" />
                    Test in progress
                  </button>
              )}

              <button
                  onClick={() => handleAction("view")}
                  className="flex items-center justify-center p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-600"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
    );
  };

  const StatsCard = ({
                       title,
                       value,
                       icon: Icon,
                       color,
                       description,
                     }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    description?: string;
  }) => (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              {description && (
                  <p className="text-xs text-gray-500 mt-1">{description}</p>
              )}
            </div>
            <Icon
                className={`h-8 w-8 ${color
                    .replace("text-", "text-")
                    .replace("-600", "-500")}`}
            />
          </div>
        </CardContent>
      </Card>
  );

  if (testsLoading) {
    return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Grand Tests</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      <div className="grid grid-cols-4 gap-4">
                        {[...Array(4)].map((_, j) => (
                            <div key={j} className="h-4 bg-gray-200 rounded"></div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
            ))}
          </div>
        </div>
    );
  }

  return (
      <div className="space-y-6 px-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Grand Tests</h1>
            <p className="text-gray-600">
              Test your knowledge with comprehensive grand tests - Available anytime!
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                  title="Tests Attempted"
                  value={stats.tests_attempted}
                  icon={BookOpen}
                  color="text-blue-600"
              />
              <StatsCard
                  title="Best Rank"
                  value={stats.best_rank ? `#${stats.best_rank}` : "N/A"}
                  icon={Trophy}
                  color="text-yellow-600"
                  description={
                    stats.best_rank
                        ? "Your highest rank"
                        : "Complete a test to see rank"
                  }
              />
              <StatsCard
                  title="Average Percentile"
                  value={
                    stats.average_percentile
                        ? `${Math.round(stats.average_percentile)}%`
                        : "N/A"
                  }
                  icon={TrendingUp}
                  color="text-green-600"
                  description="Across all attempted tests"
              />
              <StatsCard
                  title="Total Participants"
                  value={stats.total_participants}
                  icon={Users}
                  color="text-purple-600"
                  description="Across all tests"
              />
            </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                  placeholder="Search tests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64"
              />
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <Select
                value={selectedExamPattern}
                onValueChange={setSelectedExamPattern}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Exam Pattern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Patterns</SelectItem>
                <SelectItem value="NEET_PG">NEET PG</SelectItem>
                <SelectItem value="INICET">INICET</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tests</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tests Grid */}
        <div className="space-y-4">
          {filteredTests.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No tests found
                  </h3>
                  <p className="text-gray-600">
                    {searchQuery ||
                    selectedFilter !== "all" ||
                    selectedExamPattern !== "all"
                        ? "Try adjusting your search or filters"
                        : "No grand tests are available at the moment"}
                  </p>
                </CardContent>
              </Card>
          ) : (
              filteredTests.map((test) => <TestCard key={test.id} test={test} />)
          )}
        </div>
      </div>
  );
};

export default AllGrandTests;