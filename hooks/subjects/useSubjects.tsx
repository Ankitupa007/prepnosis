import { useAuth } from "@/lib/auth-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
interface UseSubjectsReturn {
  subjects: any[];
  isLoadingSubjects: boolean;
  subjectsError: Error | null;
  refetchSubjects: () => void;
}
export function useSubjects(): UseSubjectsReturn {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all tests
  const {
    data: subjects = [],
    isLoading: isLoadingSubjects,
    error: subjectsError,
    refetch: refetchSubjects
  } = useQuery({
    queryKey: ['tests'],
    queryFn: async () => {
      const response = await fetch('/api/subjects');
      if (!response.ok) {
        throw new Error('Failed to fetch tests');
      }
      return response.json();
    },
    enabled: !!user,
  });
  return { subjects, isLoadingSubjects, subjectsError, refetchSubjects };
}