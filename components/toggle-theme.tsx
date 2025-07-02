"use client"
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { Moon, Sun } from "lucide-react";

export const ToggleTheme = () => {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      size="sm"
      variant="secondary"
      className="w-10 h-10 flex justify-center items-center rounded-full cursor-pointer"
    >
      <div className="flex items-center gap-2 dark:hidden">
        <Moon className="size-4" />
        {/*<span className="block lg:hidden"> Dark </span>*/}
      </div>

      <div className="dark:flex items-center gap-2 hidden">
        <Sun className="size-4" />
        {/*<span className="block lg:hidden">Light</span>*/}
      </div>

      <span className="sr-only"></span>
    </Button>
  );
};