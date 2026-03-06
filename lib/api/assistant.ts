import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import client from "./client";
import { API_ENDPOINTS } from "./endpoints";

export type ChatMessage = {
    role: 'user' | 'assistant';
    content: string;
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
            const response = await client.get<{ history: ChatMessage[] }>(API_ENDPOINTS.SMART_CHAT);
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
            const response = await client.post<AssistantResponse>(API_ENDPOINTS.SMART_CHAT, {
                query,
                // No need to send history anymore - handled by Redis!
                latitude,
                longitude
            });
            return response.data;
        },
        onSuccess: (data) => {
            setHistory(data.history);
        }
    });

    const clearHistory = async () => {
        try {
            await client.delete(API_ENDPOINTS.SMART_CHAT);
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
