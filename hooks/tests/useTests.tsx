import { useAuth } from '@/lib/auth-context';
import { CustomTest, Test, UseCustomTestsReturn, UserTestAttempt } from '@/lib/types/test';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCustomTests, createCustomTest, updateCustomTest, deleteCustomTest, startCustomTest, submitCustomTest } from '@/app/data/custom-test-actions/custom-test-actions';
import { toast } from 'sonner';

// Query keys factory
export const testsKeys = {
    all: ['tests'] as const,
    user: (userId: string) => [...testsKeys.all, 'user', userId] as const,
    userAttempts: (userId: string) => ['user-attempts', userId] as const,
}

export function useCustomTests(): UseCustomTestsReturn {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // Fetch custom tests from server
    const { data, isLoading: isLoadingCustomTests, error: customTestsError, refetch: refetchCustomTests } = useQuery({
        queryKey: testsKeys.user(user?.id || ''),
        queryFn: () => getCustomTests(user?.id || ''),
        enabled: !!user,
    });

    const customTests = data?.tests || [];

    // Create test mutation
    const createCustomTestMutation = useMutation({
        mutationFn: createCustomTest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: testsKeys.user(user?.id || '') });
        },
    });

    // Update test mutation
    const updateCustomTestMutation = useMutation({
        mutationFn: updateCustomTest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: testsKeys.user(user?.id || '') });
        },
    });

    // Delete custom test mutation
    const deleteCustomTestMutation = useMutation({
        mutationFn: deleteCustomTest,
        onMutate: async (testId) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: testsKeys.user(user?.id || '') });

            // Snapshot the previous value
            const previousTests = queryClient.getQueryData<{ tests: CustomTest[] }>(testsKeys.user(user?.id || ''));

            // Optimistically update to the new value
            if (previousTests) {
                queryClient.setQueryData<{ tests: CustomTest[] }>(testsKeys.user(user?.id || ''), {
                    ...previousTests,
                    tests: previousTests.tests.filter((test) => test.id !== testId),
                });
            }

            // Return a context object with the snapshotted value
            return { previousTests };
        },
        onError: (err, newTodo, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousTests) {
                queryClient.setQueryData(testsKeys.user(user?.id || ''), context.previousTests);
            }
            toast.error("Failed to delete test");
        },
        onSettled: () => {
            // Always refetch after error or success:
            queryClient.invalidateQueries({ queryKey: testsKeys.user(user?.id || '') });
        },
    });

    // Start test mutation
    const startCustomTestMutation = useMutation({
        mutationFn: startCustomTest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: testsKeys.userAttempts(user!.id) });
        },
    });

    // Submit test mutation
    const submitCustomTestMutation = useMutation({
        mutationFn: submitCustomTest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: testsKeys.user(user?.id || '') });
            queryClient.invalidateQueries({ queryKey: testsKeys.userAttempts(user!.id) });
            queryClient.invalidateQueries({ queryKey: ['test-rankings'] });
        },
    });

    // Get custom test by ID
    const getCustomTestById = (testId: string): CustomTest | undefined => {
        return customTests.find((test: CustomTest) => test.id === testId);
    };

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