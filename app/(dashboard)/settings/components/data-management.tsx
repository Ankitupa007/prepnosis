"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { testsKeys } from "@/hooks/tests/useTests";

export function DataManagement() {
    const [isDeletingTests, setIsDeletingTests] = useState(false);
    const [isResettingGrandTests, setIsResettingGrandTests] = useState(false);
    const [showDeleteTestsDialog, setShowDeleteTestsDialog] = useState(false);
    const [showResetGrandTestsDialog, setShowResetGrandTestsDialog] = useState(false);
    const router = useRouter();

    const { user } = useAuth();
    const queryClient = useQueryClient();

    const handleDeleteAllTests = async () => {
        setIsDeletingTests(true);
        try {
            const response = await fetch("/api/settings/delete-all-tests", {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete tests");

            toast.success("All custom tests deleted successfully");

            // Invalidate queries
            if (user?.id) {
                await queryClient.invalidateQueries({ queryKey: testsKeys.user(user.id) });
            }

            setShowDeleteTestsDialog(false);
            router.refresh();
        } catch (error) {
            toast.error("Failed to delete tests");
            console.error(error);
        } finally {
            setIsDeletingTests(false);
        }
    };

    const handleResetGrandTests = async () => {
        setIsResettingGrandTests(true);
        try {
            const response = await fetch("/api/settings/reset-grand-tests", {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to reset grand tests");

            toast.success("Grand test progress reset successfully");

            // Invalidate queries
            if (user?.id) {
                await queryClient.invalidateQueries({ queryKey: testsKeys.userAttempts(user.id) });
                await queryClient.invalidateQueries({ queryKey: ['test-rankings'] });
                await queryClient.invalidateQueries({ queryKey: ['user-test-ranking'] });
            }

            setShowResetGrandTestsDialog(false);
            router.refresh();
        } catch (error) {
            toast.error("Failed to reset grand tests");
            console.error(error);
        } finally {
            setIsResettingGrandTests(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 border rounded-lg">
                <div className="space-y-0.5">
                    <h4 className="text-sm font-medium">Delete All Custom Tests</h4>
                    <p className="text-sm text-muted-foreground">
                        Permanently remove all custom tests you have created.
                    </p>
                </div>
                <Dialog open={showDeleteTestsDialog} onOpenChange={setShowDeleteTestsDialog}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete all custom tests?</DialogTitle>
                            <DialogDescription>
                                This action cannot be undone. This will permanently delete all your custom tests and their associated data.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowDeleteTestsDialog(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteAllTests}
                                disabled={isDeletingTests}
                            >
                                {isDeletingTests && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Delete All
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 border rounded-lg">
                <div className="space-y-0.5">
                    <h4 className="text-sm font-medium">Reset Grand Tests</h4>
                    <p className="text-sm text-muted-foreground">
                        Clear all progress and attempts for grand tests.
                    </p>
                </div>
                <Dialog open={showResetGrandTestsDialog} onOpenChange={setShowResetGrandTestsDialog}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Reset
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Reset grand tests?</DialogTitle>
                            <DialogDescription>
                                This will delete all your attempts and progress on grand tests. You will be able to start them fresh.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowResetGrandTestsDialog(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleResetGrandTests}
                                disabled={isResettingGrandTests}
                            >
                                {isResettingGrandTests && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Reset Progress
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
