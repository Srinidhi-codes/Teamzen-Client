"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { ToastProvider } from "@/components/common/ToastProvider";
import { ApolloProvider } from "@apollo/client/react";
import { client } from "@/lib/apolloClient";
import { Toaster } from "@/components/ui/sonner";

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ApolloProvider client={client}>
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <ToastProvider>{children}</ToastProvider>
      </QueryClientProvider>
    </ApolloProvider>
  );
}
