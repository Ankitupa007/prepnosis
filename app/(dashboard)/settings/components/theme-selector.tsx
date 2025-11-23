"use client";

import { Moon, Sun, Laptop } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function ThemeSelector() {
    const { setTheme, theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="h-10 w-full animate-pulse bg-muted rounded-md" />;
    }

    return (
        <div className="flex items-center gap-2">
            <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("light")}
                className="w-10 h-10 flex justify-center items-center rounded-full cursor-pointer"
            >
                <Sun className=" h-4 w-4" />
            </Button>
            <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("dark")}
                className="w-10 h-10 flex justify-center items-center rounded-full cursor-pointer"
            >
                <Moon className=" h-4 w-4" />
            </Button>
            <Button
                variant={theme === "system" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("system")}
                className="w-10 h-10 flex justify-center items-center rounded-full cursor-pointer"
            >
                <Laptop className=" h-4 w-4" />
            </Button>
        </div>
    );
}
