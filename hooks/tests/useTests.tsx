// lib/hooks/useTests.ts

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Test,
  UserTestAttempt,
  TestRanking,
  TestAttemptWithDetails,
  TestStats
} from '@/lib/types/test';
import { useAuth } from '@/lib/auth-context';

interface UseTestsReturn {
  // Tests
  tests: Test[];
  grandTests: Test[];
  customTests: Test[];
  isLoadingTests: boolean;
  testsError: Error | null;

  // Test operations
  createTest: (testData: Partial<Test>) => Promise<Test>;
  updateTest: (id: string, testData: Partial<Test>) => Promise<Test>;
  deleteTest: (id: string) => Promise<void>;

  // Test attempts
  startTest: (testId: string) => Promise<{ attemptId: string }>;
  submitTest: (attemptId: string, answers: any[]) => Promise<UserTestAttempt>;
  getUserAttempts: (testId?: string) => UserTestAttempt[];
  getUserAttemptForTest: (testId: string) => UserTestAttempt | undefined;

  // Rankings and stats
  getTestRankings: (testId: string) => TestRanking[];
  getTestStats: (testId: string) => TestStats | null;

  // Utility functions
  getTestById: (testId: string) => Test | undefined;
  refetchTests: () => void;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export function useTests(): UseTestsReturn {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all tests
  const {
    data: tests = [],
    isLoading: isLoadingTests,
    error: testsError,
    refetch: refetchTests
  } = useQuery({
    queryKey: ['tests'],
    queryFn: async () => {
      const response = await fetch('/api/tests');
      if (!response.ok) {
        throw new Error('Failed to fetch tests');
      }
      return response.json();
    },
    enabled: !!user,
  });

  // Fetch user test attempts
  const { data: userAttempts = [] } = useQuery({
    queryKey: ['user-attempts', user?.id],
    queryFn: async () => {
      const response = await fetch('/api/tests/attempts');
      if (!response.ok) {
        throw new Error('Failed to fetch user attempts');
      }
      return response.json();
    },
    enabled: !!user,
  });

  // Create test mutation
  const createTestMutation = useMutation({
    mutationFn: async (testData: Partial<Test>) => {
      const response = await fetch('/api/tests/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      if (!response.ok) {
        throw new Error('Failed to create test');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
    },
  });

  // Update test mutation
  const updateTestMutation = useMutation({
    mutationFn: async ({ id, testData }: { id: string; testData: Partial<Test> }) => {
      const response = await fetch(`/api/tests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      if (!response.ok) {
        throw new Error('Failed to update test');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
    },
  });

  // Delete test mutation
  const deleteTestMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/tests/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete test');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
    },
  });

  // Start test mutation
  const startTestMutation = useMutation({
    mutationFn: async (testId: string) => {
      const response = await fetch(`/api/tests/${testId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to start test');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-attempts'] });
    },
  });

  // Submit test mutation
  const submitTestMutation = useMutation({
    mutationFn: async ({ attemptId, answers }: { attemptId: string; answers: any[] }) => {
      const response = await fetch(`/api/tests/${attemptId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit test');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-attempts'] });
      queryClient.invalidateQueries({ queryKey: ['test-rankings'] });
    },
  });

  // Get test by ID
  const getTestById = (testId: string): Test | undefined => {
    return tests.find((test: Test) => test.id === testId);
  };

  // Get user attempt for a test
  const getUserAttemptForTest = (testId: string): UserTestAttempt | undefined => {
    return userAttempts.find((attempt: UserTestAttempt) => attempt.test_id === testId);
  };

  // Filter tests by type
  const grandTests = tests.filter((test: Test) => test.test_type === 'grand_test');
  const customTests = tests.filter((test: Test) => test.test_type === 'custom');

  // Get test rankings
  const getTestRankings = (testId: string): TestRanking[] => {
    // This would typically be a separate query, but for now return empty array
    // You can implement this as a separate useQuery hook
    return [];
  };

  // Get test stats
  const getTestStats = (testId: string): TestStats | null => {
    // This would typically be a separate query
    return null;
  };

  // Get user attempts (optionally filtered by test)
  const getUserAttempts = (testId?: string): UserTestAttempt[] => {
    if (testId) {
      return userAttempts.filter((attempt: UserTestAttempt) => attempt.test_id === testId);
    }
    return userAttempts;
  };

  return {
    // Tests data
    tests,
    grandTests,
    customTests,
    isLoadingTests,
    testsError,

    // Test operations
    createTest: createTestMutation.mutateAsync,
    updateTest: (id: string, testData: Partial<Test>) =>
      updateTestMutation.mutateAsync({ id, testData }),
    deleteTest: deleteTestMutation.mutateAsync,

    // Test attempts
    startTest: startTestMutation.mutateAsync,
    submitTest: (attemptId: string, answers: any[]) =>
      submitTestMutation.mutateAsync({ attemptId, answers }),
    getUserAttempts,

    // Rankings and stats
    getTestRankings,
    getTestStats,

    // Utility functions
    getTestById,
    getUserAttemptForTest,
    refetchTests,
    isCreating: createTestMutation.isPending,
    isUpdating: updateTestMutation.isPending,
    isDeleting: deleteTestMutation.isPending,
  };
}

// Hook for specific test details
export function useTestDetails(testId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['test-details', testId],
    queryFn: async () => {
      const response = await fetch(`/api/tests/${testId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch test details');
      }
      return response.json();
    },
    enabled: !!user && !!testId,
  });
}

// Hook for test attempt details
export function useTestAttempt(attemptId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['test-attempt', attemptId],
    queryFn: async () => {
      const response = await fetch(`/api/tests/attempts/${attemptId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch test attempt');
      }
      return response.json();
    },
    enabled: !!user && !!attemptId,
  });
}

// Hook for test rankings
export function useTestRankings(testId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['test-rankings', testId],
    queryFn: async () => {
      const response = await fetch(`/api/tests/grand-tests/rankings?testId=${testId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch test rankings');
      }
      return response.json();
    },
    enabled: !!user && !!testId,
  });
}

// Hook for user's ranking in a specific test
export function useUserTestRanking(testId: string, userId?: string) {
  const { user } = useAuth();
  const actualUserId = userId || user?.id;

  return useQuery({
    queryKey: ['user-test-ranking', testId, actualUserId],
    queryFn: async () => {
      const response = await fetch(`/api/tests/grand-tests/rankings?testId=${testId}&userId=${actualUserId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user ranking');
      }
      return response.json();
    },
    enabled: !!user && !!testId && !!actualUserId,
  });
}