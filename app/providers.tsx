"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect } from "react";
import { ToastProvider } from "@/components/common/ToastProvider";
import { ApolloProvider } from "@apollo/client/react";
import { client } from "@/lib/apolloClient";
import { Toaster } from "sonner";
import { ThemeProvider, useTheme } from "next-themes";
import { useStore } from "@/lib/store/useStore";

const queryClient = new QueryClient();

function ThemeInitializer({ children }: { children: ReactNode }) {
  const accent = useStore((state) => state.accent);

  useEffect(() => {
    // Only apply if we are in the browser
    if (typeof window !== "undefined") {
      document.documentElement.setAttribute("data-accent", accent || 'indigo');
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
