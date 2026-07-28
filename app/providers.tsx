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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

const VALID_ACCENTS: ColorAccent[] = [
  "teal",
  "slate",
  "blue",
  "green",
  "indigo",
  "orange",
  "red",
  "purple",
];

function ThemeInitializer({ children }: { children: ReactNode }) {
  const accent = useStore((state) => state.accent);
  const setAccent = useStore((state) => state.setAccent);
  const orgAccent = useStore((state) => state.user?.organization?.accent);

  // Company accent from super admin overrides local preference
  useEffect(() => {
    if (!orgAccent) return;
    if (VALID_ACCENTS.includes(orgAccent as ColorAccent) && orgAccent !== accent) {
      setAccent(orgAccent as ColorAccent);
    }
  }, [orgAccent, accent, setAccent]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.setAttribute("data-accent", accent || "teal");
    }
  }, [accent]);

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
