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

    const [isStreaming, setIsStreaming] = useState(false);

    const sendMessage = async ({ query, latitude, longitude }: { query: string, latitude?: number, longitude?: number }) => {
        setIsStreaming(true);

        try {
            // 1. Optimistic Update (Handled by UI to avoid delay)
            
            // 2. Prepare streaming message
            const assistantMsg: ChatMessage = { role: 'assistant', content: '', timestamp: new Date().toISOString() };
            setHistory(prev => [...prev, assistantMsg]);

            // 3. Start Stream
            const response = await fetch(`/api${API_ENDPOINTS.CHAT}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, latitude, longitude }),
                credentials: 'include',
            });

            if (!response.ok) throw new Error('Failed to start chat stream');
            if (!response.body) throw new Error('No response body');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullContent = "";

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataStr = line.slice(6).trim();
                        if (dataStr === '[DONE]') break;

                        try {
                            const data = JSON.parse(dataStr);
                            if (data.token) {
                                fullContent += data.token;
                                // Update the last message in history with the accumulated content
                                setHistory(prev => {
                                    const newHistory = [...prev];
                                    const last = newHistory[newHistory.length - 1];
                                    if (last && last.role === 'assistant') {
                                        last.content = fullContent;
                                    }
                                    return newHistory;
                                });
                            } else if (data.history) {
                                // Final sync
                                setHistory(data.history);
                            }
                        } catch (e) {
                            console.warn("Error parsing stream chunk", e);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Streaming error", error);
            // Revert optimistic update or show error
        } finally {
            setIsStreaming(false);
            queryClient.invalidateQueries({ queryKey: ['assistant-history'] });
        }
    };

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
        setMessages: setHistory,
        sendMessage,
        isLoading: isStreaming || isHistoryLoading,
        isHistoryLoading,
        isStreaming,
        clearHistory
    };
};
