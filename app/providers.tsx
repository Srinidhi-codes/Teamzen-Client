"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect } from "react";
import { ToastProvider } from "@/components/common/ToastProvider";
import { ApolloProvider } from "@apollo/client/react";
import { client } from "@/lib/apolloClient";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";
import { useStore } from "@/lib/store/useStore";
import { ColorAccent } from "@/lib/store/slices/themeSlice";
import { effectiveAccent } from "@/lib/plans";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

function ThemeInitializer({ children }: { children: ReactNode }) {
  const accent = useStore((state) => state.accent);
  const setAccent = useStore((state) => state.setAccent);
  const orgAccent = useStore((state) => state.user?.organization?.accent);
  const plan = useStore((state) => state.user?.organization?.plan);
  const expiresAt = useStore((state) => state.user?.organization?.planExpiresAt);

  useEffect(() => {
    const next = effectiveAccent(orgAccent || accent, plan, expiresAt) as ColorAccent;
    if (next !== accent) setAccent(next);
    if (typeof window !== "undefined") {
      document.documentElement.setAttribute("data-accent", next);
    }
  }, [orgAccent, accent, setAccent, plan, expiresAt]);

  return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ApolloProvider client={client}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="theme"
        >
          <ThemeInitializer>
            <Toaster position="top-right" richColors />
            <ToastProvider>{children}</ToastProvider>
          </ThemeInitializer>
        </ThemeProvider>
      </QueryClientProvider>
    </ApolloProvider>
  );
}
