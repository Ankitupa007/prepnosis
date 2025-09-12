"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/lib/auth-context";

interface Props {
  children: React.ReactNode;
}

export default function QueryProvider({ children }: Props) {
  const [queryClient] = useState(() => new QueryClient(
      {
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // Global default
            gcTime: 30 * 60 * 1000,
            retry: 3, // More retries for resilience
            refetchOnWindowFocus: false, // Disable for efficiency
        },
    }
      }

  ));

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
