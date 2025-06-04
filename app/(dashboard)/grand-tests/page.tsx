'use client';

import { useState } from 'react';
import { Calendar, Clock, Users, Trophy, BookOpen, TrendingUp, Star, Filter, Search, Play, BarChart3, Timer, Award, ChevronRight, Eye } from 'lucide-react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

// Types based on your database schema
interface GrandTest {
  id: string;
  title: string;
  description: string | null;
  test_type: 'grand_test';
  test_mode: 'regular' | 'exam';
  exam_pattern: 'NEET_PG' | 'INICET';
  total_questions: number;
  total_marks: number;
  duration_minutes: number;
  negative_marking: number;
  sections: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  scheduled_at: string | null;
  expires_at: string | null;
  registered_users?: number;
  max_users?: number;
  user_attempt?: {
    id: string;
    total_score: number;
    is_completed: boolean;
    submitted_at: string | null;
  } | null;
  user_ranking?: {
    rank: number;
    percentile: number;
  } | null;
}

interface GrandTestsStats {
  tests_attempted: number;
  best_rank: number | null;
  average_score: number;
  registered_count: number;
}

const GrandTestsPage = () => {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExamPattern, setSelectedExamPattern] = useState('all');

  // Fetch grand tests
  const { data: grandTests, isLoading: testsLoading } = useQuery({
    queryKey: ['grand-tests', selectedFilter, selectedExamPattern],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedFilter !== 'all') params.append('status', selectedFilter);
      if (selectedExamPattern !== 'all') params.append('exam_pattern', selectedExamPattern);

      const response = await fetch(`/api/tests/grand-tests`);
      if (!response.ok) throw new Error('Failed to fetch grand tests');
      return response.json() as Promise<GrandTest[]>;
    },
  });

  // Fetch user stats
  const { data: stats } = useQuery({
    queryKey: ['grand-tests-stats'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/performance');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json() as Promise<GrandTestsStats>;
    },
  });

  // const filteredTests = grandTests?.filter(test => {
  //   const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     test.description?.toLowerCase().includes(searchQuery.toLowerCase());
  //   return matchesSearch;
  // }) || [];

  const getTestStatus = (test: GrandTest) => {
    const now = new Date();
    const scheduledAt = test.scheduled_at ? new Date(test.scheduled_at) : null;
    const expiresAt = test.expires_at ? new Date(test.expires_at) : null;

    if (test.user_attempt?.is_completed) return 'completed';
    if (!scheduledAt) return 'registration_open';
    if (scheduledAt > now) return 'upcoming';
    if (expiresAt && expiresAt < now) return 'expired';
    return 'live';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      upcoming: { color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Upcoming', icon: Calendar },
      live: { color: 'bg-green-100 text-green-700 border-green-200', label: 'Live', icon: Play },
      completed: { color: 'bg-gray-100 text-gray-700 border-gray-200', label: 'Completed', icon: Trophy },
      registration_open: { color: 'bg-orange-100 text-orange-700 border-orange-200', label: 'Registration Open', icon: Users },
      expired: { color: 'bg-red-100 text-red-700 border-red-200', label: 'Expired', icon: Clock }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.upcoming;
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={`${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getDifficultyColor = (totalQuestions: number) => {
    if (totalQuestions <= 50) return 'text-green-600';
    if (totalQuestions <= 150) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };
  };

  const handleTestAction = async (test: GrandTest, action: 'register' | 'start' | 'view') => {
    switch (action) {
      case 'register':
        // TODO: Implement registration logic
        break;
      case 'start':
        router.push(`/dashboard/grand-tests/${test.id}/attempt`);
        break;
      case 'view':
        router.push(`/dashboard/grand-tests/${test.id}`);
        break;
    }
  };

  const TestCard = ({ test }: { test: GrandTest }) => {
    const status = getTestStatus(test);
    const scheduledDateTime = test.scheduled_at ? formatDateTime(test.scheduled_at) : null;
    const canStart = status === 'live' && !test.user_attempt?.is_completed;
    const canRegister = status === 'registration_open' || (status === 'upcoming' && !test.user_attempt);
    const isCompleted = test.user_attempt?.is_completed;

    return (
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{test.title}</h3>
                {getStatusBadge(status)}
              </div>
              {test.description && (
                <p className="text-gray-600 text-sm mb-3">{test.description}</p>
              )}
            </div>
          </div>

          {/* Test Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">{test.total_questions} Questions</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">{test.duration_minutes} mins</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Trophy className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">{test.total_marks} marks</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">{test.registered_users || 0} registered</span>
            </div>
          </div>

          {/* Schedule Info */}
          {scheduledDateTime && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Scheduled:</span>
                  <span className="font-medium text-gray-900">
                    {scheduledDateTime.date} at {scheduledDateTime.time}
                  </span>
                </div>
                <div className={`flex items-center gap-1 ${getDifficultyColor(test.total_questions)}`}>
                  <Star className="w-4 h-4" />
                  <span className="text-xs font-medium">
                    {test.total_questions <= 50 ? 'Easy' : test.total_questions <= 150 ? 'Medium' : 'Hard'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Results Section for Completed Tests */}
          {isCompleted && test.user_attempt && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3 mb-4 border border-yellow-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Your Result</p>
                    <p className="text-xs text-gray-600">
                      {test.user_ranking ? `Rank #${test.user_ranking.rank}` : ''} •
                      Score: {test.user_attempt.total_score}/{test.total_marks}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTestAction(test, 'view')}
                  className="text-blue-600 hover:text-blue-700"
                >
                  View Details <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={
                test.exam_pattern === 'NEET_PG'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-indigo-100 text-indigo-700'
              }>
                {test.exam_pattern.replace('_', ' ')}
              </Badge>
              {test.negative_marking > 0 && (
                <Badge variant="outline" className="text-xs">
                  -{test.negative_marking} Negative
                </Badge>
              )}
            </div>

            <div className="flex gap-2">
              {isCompleted ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/dashboard/grand-tests/${test.id}/results`)}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestAction(test, 'view')}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Review
                  </Button>
                </>
              ) : canStart ? (
                <Button
                  onClick={() => handleTestAction(test, 'start')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Test
                </Button>
              ) : canRegister ? (
                <Button onClick={() => handleTestAction(test, 'register')}>
                  <Users className="w-4 h-4 mr-2" />
                  Register
                </Button>
              ) : (
                <Button variant="outline" disabled>
                  <Timer className="w-4 h-4 mr-2" />
                  {status === 'upcoming' ? 'Registered' : 'Unavailable'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  function formatDistanceToNow(date: Date): React.ReactNode {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffSec = Math.round(diffMs / 1000);

    if (diffSec < 60) {
      return `${Math.abs(diffSec)} seconds${diffSec < 0 ? ' ago' : ''}`;
    }
    const diffMin = Math.round(diffSec / 60);
    if (Math.abs(diffMin) < 60) {
      return `${Math.abs(diffMin)} minute${Math.abs(diffMin) !== 1 ? 's' : ''}${diffMin < 0 ? ' ago' : ''}`;
    }
    const diffHr = Math.round(diffMin / 60);
    if (Math.abs(diffHr) < 24) {
      return `${Math.abs(diffHr)} hour${Math.abs(diffHr) !== 1 ? 's' : ''}${diffHr < 0 ? ' ago' : ''}`;
    }
    const diffDay = Math.round(diffHr / 24);
    return `${Math.abs(diffDay)} day${Math.abs(diffDay) !== 1 ? 's' : ''}${diffDay < 0 ? ' ago' : ''}`;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Grand Tests</h1>
          <p className="text-gray-600">Challenge yourself with comprehensive mock tests and compete with thousands of students</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats?.tests_attempted || 0}</p>
                  <p className="text-sm text-gray-600">Tests Attempted</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Trophy className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats?.best_rank || '-'}</p>
                  <p className="text-sm text-gray-600">Best Rank</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats?.average_score || 0}%</p>
                  <p className="text-sm text-gray-600">Avg. Score</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats?.registered_count || 0}</p>
                  <p className="text-sm text-gray-600">Registered</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search tests..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="registration_open">Open Registration</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Exam Pattern Filter */}
              <Select value={selectedExamPattern} onValueChange={setSelectedExamPattern}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Patterns</SelectItem>
                  <SelectItem value="NEET_PG">NEET PG</SelectItem>
                  <SelectItem value="INICET">INICET</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {grandTests && grandTests?.map((test: GrandTest) => (
            <Card key={test.id} className="hover:shadow-lg transition">
              <CardContent className="p-4">
                <CardTitle className="text-lg font-semibold mb-2">{test.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{test.description}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="secondary">{test.exam_pattern}</Badge>
                  <Badge>{test.total_questions} Qs</Badge>
                  <Badge>{test.total_marks} Marks</Badge>
                  <Badge>{test.duration_minutes} mins</Badge>
                  {test.scheduled_at && (
                    <Badge variant="outline">
                      Scheduled {formatDistanceToNow(new Date(test.scheduled_at))} from now
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GrandTestsPage;