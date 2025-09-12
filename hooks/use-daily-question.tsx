import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {getDailyQuestion, submitDailyQuestion} from "@/app/data/dashboard/get-daily-question";

export const useDailyQuestion = () =>
    useQuery({
        queryKey: ['daily-question'],
        queryFn: async () => await getDailyQuestion(),
        staleTime: 1000 * 60 * 60 * 24, // 24 hours: Data is fresh for 24 hours
        gcTime: 1000 * 60 * 60 * 24, // 24 hours: Cache persists for 24 hours
        refetchOnWindowFocus: false, // Prevent refetching on window focus to respect 24-hour cache
        refetchOnMount: false, // Prevent refetching on mount to respect cache
        refetchInterval: 1000 * 60 * 60 * 24, // Auto-refetch every 24 hours
    });

export const useSubmitDailyQuestion = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { selected_option: number }) => {
            await submitDailyQuestion(data)
        },
        onSuccess: () => {
            // Invalidate and refetch the daily question query to update the UI with server data
            queryClient.invalidateQueries({ queryKey: ['daily-question'] });
        },
        onError: (error) => {
            console.error('Mutation error:', error);
        },
    });
};