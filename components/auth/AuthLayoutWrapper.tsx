"use client";

import { useState } from "react";
import AuthArtShowcase from "@/components/auth/AuthArtShowcase";
import { Button } from "@/components/ui/button";
import { Eye, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AuthLayoutWrapperProps {
    children: React.ReactNode;
}

export default function AuthLayoutWrapper({ children }: AuthLayoutWrapperProps) {
    const [showArtOnMobile, setShowArtOnMobile] = useState(false);

    return (
        <div className="grid min-h-svh lg:grid-cols-2 bg-primary/20 relative">
            {/* Mobile Background Art (Absolute) */}
            <div className="lg:hidden absolute inset-0 z-0">
                <AuthArtShowcase />
            </div>

            {/* Left Side: Form Content */}
            <div className={`flex flex-col gap-4 p-6 md:p-10 relative z-10 transition-opacity duration-500 ${showArtOnMobile ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                {children}
            </div>

            {/* Right Side: Desktop Art Showcase */}
            <div className="relative hidden lg:block h-full w-full">
                <AuthArtShowcase />
            </div>

            {/* Mobile Toggle Button */}
            <div className="lg:hidden fixed bottom-6 right-6 z-50">
                <Button
                    size="icon"
                    className="rounded-full h-12 w-12 shadow-xl bg-background/80 backdrop-blur-md border border-border text-foreground hover:bg-background"
                    onClick={() => setShowArtOnMobile(!showArtOnMobile)}
                >
                    {showArtOnMobile ? (
                        <LayoutDashboard className="h-5 w-5" />
                    ) : (
                        <Eye className="h-5 w-5" />
                    )}
                    <span className="sr-only">Toggle View</span>
                </Button>
            </div>
        </div>
    );
}
