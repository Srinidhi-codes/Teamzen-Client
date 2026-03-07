import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import client from "./client";
import { API_ENDPOINTS } from "./endpoints";

export type ChatMessage = {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: string;
};

export type AssistantResponse = {
    answer: string;
    history: ChatMessage[];
};

export const useAssistant = () => {
    const queryClient = useQueryClient();

    // 1. Fetch persistent history on mount
    const { data, isLoading: isHistoryLoading } = useQuery({
        queryKey: ['assistant-history'],
        queryFn: async () => {
            const response = await client.get<{ history: ChatMessage[] }>(API_ENDPOINTS.CHAT);
            return response.data;
        },
    });

    const [history, setHistory] = useState<ChatMessage[]>([]);

    useEffect(() => {
        if (data?.history) {
            setHistory(data.history);
        }
    }, [data]);

    const chatMutation = useMutation({
        mutationFn: async ({ query, latitude, longitude }: { query: string, latitude?: number, longitude?: number }) => {
            const response = await client.post<AssistantResponse>(API_ENDPOINTS.CHAT, {
                query,
                latitude,
                longitude
            });
            return response.data;
        },
        onMutate: async ({ query }) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: ['assistant-history'] });

            // Snapshot the previous value
            const previousHistory = history;

            // Optimistically update to the new value
            const newMessage: ChatMessage = {
                role: 'user',
                content: query,
                timestamp: new Date().toISOString()
            };
            setHistory(prev => [...prev, newMessage]);

            return { previousHistory };
        },
        onError: (err, newTodo, context) => {
            if (context?.previousHistory) {
                setHistory(context.previousHistory);
            }
        },
        onSuccess: (data) => {
            // When the server responds, we get the real history (now with timestamps if we update backend)
            // For now, let's ensure we keep timestamps if server doesn't provide them
            const serverHistory = data.history.map(msg => ({
                ...msg,
                timestamp: msg.timestamp || new Date().toISOString()
            }));
            setHistory(serverHistory);
        }
    });

    const clearHistory = async () => {
        try {
            await client.delete(API_ENDPOINTS.CHAT);
            setHistory([]);
            queryClient.invalidateQueries({ queryKey: ['assistant-history'] });
        } catch (error) {
            console.error("Failed to clear assistant history", error);
        }
    };

    return {
        messages: history,
        sendMessage: chatMutation.mutateAsync,
        isLoading: chatMutation.isPending || isHistoryLoading,
        isError: chatMutation.isError,
        error: chatMutation.error,
        clearHistory
    };
};
