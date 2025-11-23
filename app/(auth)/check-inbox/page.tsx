"use client";

import WebsiteHeader from "@/components/common/website-header";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CheckInboxPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // If user is already logged in, redirect to dashboard
        if (!loading && user) {
            router.replace("/dashboard");
            return;
        }

        // Check if registration was just completed
        const registrationCompleted = sessionStorage.getItem("registration-completed");
        if (!loading && !user && !registrationCompleted) {
            router.replace("/login");
        }
    }, [user, loading, router]);

    if (loading) {
        return null; // Or a loading spinner
    }

    return (
        <main>
            <WebsiteHeader />
            <section>
                <div className="grid min-h-svh lg:grid-cols-2 bg-primary/20">
                    <div className="flex flex-col gap-4 p-6 md:p-10">
                        <div className="flex flex-1 items-center justify-center">
                            <div className="w-full max-w-md pb-8 bg-background px-6 py-12 rounded-xl text-center space-y-6 shadow-sm">
                                <div className="flex justify-center">
                                    <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center">
                                        <Mail className="h-10 w-10 text-primary" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h1 className="text-2xl font-bold">Check your inbox</h1>
                                    <p className="text-muted-foreground">
                                        We've sent you a verification link to your email address.
                                        Please click the link to activate your account.
                                    </p>
                                </div>
                                <div className="pt-4">
                                    <Link href="/login">
                                        <Button className="w-full" size="lg">
                                            Back to Login
                                        </Button>
                                    </Link>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Didn't receive the email?{" "}
                                    <Link href="/register" className="text-primary hover:underline">
                                        Try signing up again
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-[#FAFAEB] relative hidden lg:block">
                        {/* <img
              src="/placeholder.svg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            /> */}
                    </div>
                </div>
            </section>
        </main>
    );
}
