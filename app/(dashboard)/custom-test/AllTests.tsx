"use client";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ShareCodeInput from "@/components/share-code-input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { useCustomTests } from "@/hooks/tests/useTests";
import { CustomTest, TestAttempt } from "@/lib/types/test";
import { useQueryClient } from "@tanstack/react-query";
import { BookOpen, ClipboardPlus, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import TestCard from "./TestCard";

export default function AllTests() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const [deletingTestId, setDeletingTestId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const {
    customTestsError,
    customTests,
    isDeletingCustomTest,
    deleteCustomTest,
    refetchCustomTests,
    isLoadingCustomTests,
  } = useCustomTests();
  const tests: CustomTest[] = customTests || [];

  // Track when data has been initially loaded
  useEffect(() => {
    if (
      !isLoadingCustomTests &&
      (customTests !== undefined || customTestsError)
    ) {
      setHasInitiallyLoaded(true);
    }
  }, [isLoadingCustomTests, customTests, customTestsError]);

  // Handle error state
  useEffect(() => {
    if (customTestsError) {
      console.error("Error fetching tests:", customTestsError);
      toast.error("Failed to load tests");
    }
  }, [customTestsError]);

  // Filter and search tests with useMemo for performance
  const filteredTests = useMemo(() => {
    let filtered = tests;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (test) =>
          test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          test.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (filterBy !== "all") {
      if (filterBy === "attempted") {
        filtered = filtered.filter((test) => test._count.attempts > 0);
      } else if (filterBy === "not_attempted") {
        filtered = filtered.filter((test) => test._count.attempts === 0);
      } else if (filterBy === "regular") {
        filtered = filtered.filter((test) => test.test_mode === "regular");
      } else if (filterBy === "exam") {
        filtered = filtered.filter((test) => test.test_mode === "exam");
      }
    }

    // Sort by most recent
    return filtered.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [tests, searchTerm, filterBy]);

  const [testToDelete, setTestToDelete] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!testToDelete) return;

    try {
      setDeletingTestId(testToDelete);
      await deleteCustomTest(testToDelete);
      toast.success("Test deleted successfully");
    } catch (error) {
      console.error("Error deleting test:", error);
      toast.error("Failed to delete test");
    } finally {
      setDeletingTestId(null);
      setTestToDelete(null);
    }
  };

  const handleDeleteClick = (testId: string) => {
    setTestToDelete(testId);
  };

  const getLatestScore = (attempts: TestAttempt[]) => {
    if (!attempts || attempts.length === 0) return null;
    // Sort by completed_at descending to get the latest attempt
    const sortedAttempts = [...attempts].sort((a, b) =>
      new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
    );
    return sortedAttempts[0].score;
  };

  // Show loading spinner while data is being fetched OR hasn't initially loaded
  if (
    isLoadingCustomTests ||
    !hasInitiallyLoaded ||
    customTests === undefined
  ) {
    return (
      <div className="mx-auto relative">
        <section className="px-4 max-w-4xl mx-auto py-4">
          {/* Header - show even during loading */}
          <div className="flex justify-between items-center max-w-4xl">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Custom Tests
              </h1>
              <p className="text-muted-foreground text-sm mt-1">Loading...</p>
            </div>
          </div>

          <div className="flex items-center gap-4 py-8">
            <button
              onClick={() => router.push("/custom-test/create")}
              className="flex items-center gap-2 pushable bg-[#31AFAD]"
            >
              <div className="front text-background bg-[#6FCCCA] py-2 px-4">
                <p className="text-sm font-bold flex items-center gap-3">
                  <ClipboardPlus className="h-4 w-4" size={18} />
                  Create Test
                </p>
              </div>
            </button>
            <div>
              <Dialog>
                <DialogTrigger className="flex items-center gap-2 pushable bg-[#31AFAD]">
                  <div className="front text-background bg-[#6FCCCA] py-2 px-4">
                    <p className="text-sm font-bold flex items-center gap-3">
                      <Plus className="h-4 w-4" size={18} />
                      Join Test
                    </p>
                  </div>
                </DialogTrigger>
                <DialogContent className="w-[88vw] max-w-md rounded-md">
                  <DialogHeader className="flex flex-col items-center">
                    <DialogTitle>Join Shared Test</DialogTitle>
                    <DialogDescription>
                      Enter the 8-character share code to access the test
                    </DialogDescription>
                    <DialogDescription className="text-xs text-muted-foreground">
                      Example: ABC12345
                    </DialogDescription>
                  </DialogHeader>
                  <ShareCodeInput />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="space-y-6 flex justify-center items-center">
              <LoadingSpinner text="Loading Custom tests..." />
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Error state
  if (customTestsError) {
    return (
      <div className="mx-auto relative">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="mb-4">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Failed to load tests
              </h3>
              {/*<p className="text-muted-foreground mb-6">*/}
              {/*  {customTestsError typeof Error*/}
              {/*    ? customTestsError.message*/}
              {/*    : "Something went wrong"}*/}
              {/*</p>*/}
              <Button
                onClick={refetchCustomTests}
                className="bg-[#66C3C1] hover:bg-[#5ab5b3] text-white dark:bg-[#66C3C1] dark:hover:bg-[#5ab5b3]"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto relative">
      <section className="px-4 max-w-4xl mx-auto py-4">
        {/* Header */}
        <div className="flex justify-between items-center max-w-4xl">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Custom Tests
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {tests.length} custom tests
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 py-8">
          <button
            onClick={() => router.push("/custom-test/create")}
            className="flex items-center gap-2 pushable bg-[#31AFAD]"
          >
            <div className="front text-background bg-[#6FCCCA] py-2 px-4">
              <p className="text-sm font-bold flex items-center gap-3">
                <ClipboardPlus className="h-4 w-4" size={18} />
                Create Test
              </p>
            </div>
          </button>
          <div>
            <Dialog>
              <DialogTrigger className="flex items-center gap-2 border-2 pushable bg-[#31AFAD]">
                <div className="front text-background bg-[#6FCCCA] py-2 px-4">
                  <p className="text-sm font-bold flex items-center gap-3">
                    <Plus className="h-4 w-4" size={18} />
                    Join Test
                  </p>
                </div>
              </DialogTrigger>
              <DialogContent className="w-[88vw] max-w-md rounded-md">
                <DialogHeader className="flex flex-col items-center">
                  <DialogTitle>Join Shared Test</DialogTitle>
                  <DialogDescription>
                    Enter the 8-character share code to access the test
                  </DialogDescription>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Example: ABC12345
                  </DialogDescription>
                </DialogHeader>
                <ShareCodeInput />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-3 mb-6 py-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search tests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-xl border-input focus:border-[#66C3C1] focus:ring-[#66C3C1] bg-background"
            />
          </div>

          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-30 px-2 space-x-2 border-input focus:border-[#66C3C1] focus:ring-[#66C3C1] bg-background">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tests</SelectItem>
              <SelectItem value="attempted">Attempted</SelectItem>
              <SelectItem value="not_attempted">New</SelectItem>
              <SelectItem value="exam">Exam Mode</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tests List */}
        {filteredTests.length === 0 ? (
          <div className="text-center py-16">
            {tests.length === 0 ? (
              <div>
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No tests yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Create your first custom test to get started
                </p>
                <Button
                  onClick={() => router.push("/custom-test/create")}
                  className="bg-[#66C3C1] hover:bg-[#5ab5b3] text-white dark:bg-[#66C3C1] dark:hover:bg-[#5ab5b3]"
                >
                  Create Your First Test
                </Button>
              </div>
            ) : (
              <div>
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No tests found
                </h3>
                <p className="text-muted-foreground">
                  Try a different search term
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTests.map((test) => (
              <TestCard
                key={test.id}
                test={test}
                onStart={() => router.push(`/custom-test/${test.id}`)}
                onView={() => router.push(`/custom-test/${test.id}`)}
                onDelete={() => handleDeleteClick(test.id)}
                latestScore={getLatestScore(test.attempts)}
                isDeleting={deletingTestId === test.id}
              />
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!testToDelete} onOpenChange={(open) => !open && setTestToDelete(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Test</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this test? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setTestToDelete(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </section>
    </div>
  );
}
