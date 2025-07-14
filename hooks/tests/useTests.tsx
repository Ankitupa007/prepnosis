// lib/hooks/useTests.ts
import { deleteCustomTest, fetchUserTests } from '@/lib/actions/custom-test';
import { useAuth } from '@/lib/auth-context';
import {
  CustomTest, CustomTestsResponse,
  Test,
  UseCustomTestsReturn,
  UserTestAttempt
} from '@/lib/types/test';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Query keys factory
const testsKeys = {
  all: ['tests'] as const,
  user: (userId: string) => [...testsKeys.all, 'user', userId] as const,
  userAttempts: (userId: string) => ['user-attempts', userId] as const,
}


export function useCustomTests(): UseCustomTestsReturn {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's custom tests
  const {
    data: userCustomTestsData,
    isLoading: isLoadingCustomTests,
    error: customTestsError,
    refetch: refetchCustomTests
  } = useQuery({
    queryKey: testsKeys.user(user?.id || ''),
    queryFn: () => fetchUserTests(user!.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const customTests: CustomTest[] = userCustomTestsData?.tests || [];

  // Fetch user test attempts
  const { data: userAttempts = [] } = useQuery({
    queryKey: testsKeys.userAttempts(user?.id || ''),
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
  const createCustomTestMutation = useMutation({
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
      queryClient.invalidateQueries({ queryKey: testsKeys.user(user!.id) });
    },
  });

  // Update test mutation
  const updateCustomTestMutation = useMutation({
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
      queryClient.invalidateQueries({ queryKey: testsKeys.user(user!.id) });
    },
  });


  // Delete custom test mutation
  const deleteCustomTestMutation = useMutation({
    mutationFn: deleteCustomTest,
    onSuccess: (_, deletedTestId) => {
      // Optimistically update the cache
      queryClient.setQueryData(
        testsKeys.user(user!.id),
        (oldData: CustomTestsResponse | undefined) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            tests: oldData.tests.filter(test => test.id !== deletedTestId)
          }
        }
      )
    },
    onError: () => {
      // Invalidate and refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: testsKeys.user(user!.id) })
    }
  });

  // Start test mutation
  const startCustomTestMutation = useMutation({
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
      queryClient.invalidateQueries({ queryKey: testsKeys.userAttempts(user!.id) });
    },
  });

  // Submit test mutation
  const submitCustomTestMutation = useMutation({
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
      queryClient.invalidateQueries({ queryKey: testsKeys.userAttempts(user!.id) });
      queryClient.invalidateQueries({ queryKey: ['test-rankings'] });
      queryClient.invalidateQueries({ queryKey: testsKeys.user(user!.id) }); // Update custom tests too
    },
  });

  // Get custom test by ID
  const getCustomTestById = (testId: string): CustomTest | undefined => {
    return customTests.find((test: CustomTest) => test.id === testId);
  };

  // Get user attempt for a test
  const getUserAttemptForTest = (testId: string): UserTestAttempt | undefined => {
    return userAttempts.find((attempt: UserTestAttempt) => attempt.test_id === testId);
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
    customTests,
    isLoadingCustomTests,
    customTestsError,
    refetchCustomTests,
    // Test operations
    createCustomTest: createCustomTestMutation.mutateAsync,
    updateCustomTest: (id: string, testData: Partial<Test>) =>
    updateCustomTestMutation.mutateAsync({ id, testData }),
    deleteCustomTest: deleteCustomTestMutation.mutateAsync,

    // Test attempts
    startCustomTest: startCustomTestMutation.mutateAsync,
    submitCustomTest: (attemptId: string, answers: any[]) =>
      submitCustomTestMutation.mutateAsync({ attemptId, answers }),
    getUserAttempts,

    // Rankings and stats

    // Utility functions
    getCustomTestById,
    getUserAttemptForTest,
    isCreatingCustomTest: createCustomTestMutation.isPending,
    isUpdatingCustomTest: updateCustomTestMutation.isPending,
    isDeletingCustomTest: deleteCustomTestMutation.isPending,
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
      const response = await fetch(`/api/grand-tests/rankings?testId=${testId}`);
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
      const response = await fetch(`/api/grand-tests/rankings?testId=${testId}&userId=${actualUserId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user ranking');
      }
      return response.json();
    },
    enabled: !!user && !!testId && !!actualUserId,
  });
}