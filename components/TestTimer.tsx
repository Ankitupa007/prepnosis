"use client";
import { useEffect, useState } from "react";

export default function TestTimer({
  section,
  action,
}: {
  section: number;
  action: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState(42 * 60); // 42 minutes
  const storageKey = `section-${section}-startTime`;

  useEffect(() => {
    const start = new Date(
      localStorage.getItem(storageKey) || new Date().toISOString()
    );
    const interval = setInterval(() => {
      const elapsed = Math.floor(
        (Date.now() - new Date(start).getTime()) / 1000
      );
      const remaining = Math.max(0, 42 * 60 - elapsed);
      setTimeLeft(remaining);
      if (remaining === 0) {
        clearInterval(interval);
        action();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [section]);

  return (
    <div className="text-lg font-semibold">
      Time left: {Math.floor(timeLeft / 60)}:
      {(timeLeft % 60).toString().padStart(2, "0")}
    </div>
  );
}
