// hooks/useDailyQuestion.ts
import { useQuery } from '@tanstack/react-query';

export const useDailyQuestion = () =>
  useQuery({
    queryKey: ['daily-question'],
    queryFn: async () => {
      const res = await fetch('/api/daily-question');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    staleTime: 1000 * 60 * 60 * 24, // 24h
  });
