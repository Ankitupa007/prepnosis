import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface BookmarkIdsResponse {
    questionIds: string[];
    total: number;
}

// Lightweight hook for bookmark IDs (used everywhere)
export const useBookmarkIds = (userId?: string) => {
    return useQuery({
        queryKey: ['bookmark-ids', userId],
        queryFn: async () => {
            const response = await fetch('/api/bookmarks/ids');
            if (!response.ok) {
                throw new Error('Failed to fetch bookmark IDs');
            }
            const data = await response.json() as BookmarkIdsResponse;

            // Sync to localStorage as a Set for O(1) lookups
            if (userId && typeof window !== 'undefined') {
                localStorage.setItem(`bookmark-ids-${userId}`, JSON.stringify(data.questionIds));
            }

            return new Set(data.questionIds);
        },
        enabled: !!userId,
        staleTime: 1000 * 60 * 10, // 10 minutes (longer since IDs change less frequently)
        initialData: () => {
            // Load from localStorage for instant availability
            if (userId && typeof window !== 'undefined') {
                const stored = localStorage.getItem(`bookmark-ids-${userId}`);
                if (stored) {
                    try {
                        const ids = JSON.parse(stored) as string[];
                        return new Set(ids);
                    } catch {
                        return new Set<string>();
                    }
                }
            }
            return new Set<string>();
        }
    });
};

// Helper hook for checking if a question is bookmarked
export const useIsBookmarked = (questionId: string, userId?: string) => {
    const { data: bookmarkIds } = useBookmarkIds(userId);
    return bookmarkIds?.has(questionId) ?? false;
};

// Mutation for toggling bookmarks
export const useToggleBookmark = (userId?: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ questionId, isBookmarked }: { questionId: string; isBookmarked: boolean }) => {
            if (isBookmarked) {
                // Remove bookmark
                const response = await fetch(`/api/bookmarks/${questionId}`, {
                    method: 'DELETE',
                });
                if (!response.ok) throw new Error('Failed to remove bookmark');
                return { action: 'removed', questionId };
            } else {
                // Add bookmark
                const response = await fetch('/api/bookmarks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ questionId }),
                });
                if (!response.ok && response.status !== 409) throw new Error('Failed to add bookmark');
                return { action: 'added', questionId };
            }
        },
        onMutate: async ({ questionId, isBookmarked }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['bookmark-ids', userId] });

            // Snapshot previous value
            const previousIds = queryClient.getQueryData<Set<string>>(['bookmark-ids', userId]);

            // Optimistically update the Set
            const currentIds = previousIds ? new Set(previousIds) : new Set<string>();

            if (isBookmarked) {
                currentIds.delete(questionId);
            } else {
                currentIds.add(questionId);
            }

            // Update cache
            queryClient.setQueryData<Set<string>>(['bookmark-ids', userId], currentIds);

            // Update localStorage immediately
            if (userId && typeof window !== 'undefined') {
                localStorage.setItem(`bookmark-ids-${userId}`, JSON.stringify([...currentIds]));
            }

            return { previousIds };
        },
        onError: (err, variables, context) => {
            toast.error('Failed to update bookmark');

            // Revert on error
            if (context?.previousIds) {
                queryClient.setQueryData(['bookmark-ids', userId], context.previousIds);

                // Revert localStorage
                if (userId && typeof window !== 'undefined') {
                    localStorage.setItem(`bookmark-ids-${userId}`, JSON.stringify([...context.previousIds]));
                }
            }
        },
        onSuccess: (data) => {
            if (data.action === 'added') {
                toast.success('Question bookmarked');
            } else {
                toast.success('Bookmark removed');
            }
        },
        onSettled: () => {
            // Refetch to sync with server
            queryClient.invalidateQueries({ queryKey: ['bookmark-ids', userId] });
            // Also invalidate full bookmarks data (for bookmarks page)
            queryClient.invalidateQueries({ queryKey: ['bookmarks', userId] });
        },
    });
};

// Keep the full bookmarks query for the bookmarks page
interface Bookmark {
    id: string;
    question_id: string;
    notes?: string;
    created_at: string;
}

interface BookmarksResponse {
    allBookmarks: Bookmark[];
    bookmarks: any[];
    total: number;
}

export const useBookmarksQuery = (userId?: string) => {
    return useQuery({
        queryKey: ['bookmarks', userId],
        queryFn: async () => {
            const response = await fetch('/api/bookmarks');
            if (!response.ok) {
                throw new Error('Failed to fetch bookmarks');
            }
            return response.json() as Promise<BookmarksResponse>;
        },
        enabled: !!userId,
        staleTime: 1000 * 60 * 5,
    });
};
