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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createClient } from "@/supabase/client";

export function DeleteAccount() {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [confirmationText, setConfirmationText] = useState("");
    const router = useRouter();
    const supabase = createClient();

    const handleDeleteAccount = async () => {
        if (confirmationText !== "DELETE") return;

        setIsDeleting(true);
        try {
            const response = await fetch("/api/settings/delete-account", {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete account");

            // Sign out the user
            await supabase.auth.signOut();

            toast.success("Account deleted successfully");
            router.push("/login");
        } catch (error) {
            toast.error("Failed to delete account");
            console.error(error);
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 border border-destructive/20 bg-destructive/5 rounded-lg">
            <div className="space-y-0.5">
                <h4 className="text-sm font-medium text-destructive">Delete Account</h4>
                <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all associated data.
                </p>
            </div>
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="w-5 h-5" />
                            Delete Account
                        </DialogTitle>
                        <DialogDescription>
                            This action is irreversible. All your data, including test history, performance stats, and account details will be permanently deleted.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="confirm-delete">
                                Type <span className="font-bold text-destructive">DELETE</span> to confirm
                            </Label>
                            <Input
                                id="confirm-delete"
                                value={confirmationText}
                                onChange={(e) => setConfirmationText(e.target.value)}
                                placeholder="DELETE"
                                className="border-destructive/50 focus-visible:ring-destructive"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteAccount}
                            disabled={isDeleting || confirmationText !== "DELETE"}
                        >
                            {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Delete Account
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
