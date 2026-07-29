import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import client from "./client";
import { API_ENDPOINTS } from "./endpoints";

export type PolicySource = {
    title: string;
    page_number?: number | null;
    file_id?: number | null;
    file_url?: string | null;
    chunk_id?: number;
    score?: number;
    match_type?: string;
};

export type ChatMessage = {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: string;
    toolsUsed?: string[];   // Permanently stored tools used to generate this message
    sources?: PolicySource[];
};

export type AssistantResponse = {
    answer: string;
    history: ChatMessage[];
};

export const useAssistant = () => {
    const queryClient = useQueryClient();

    // 1. Fetch persistent history & config on mount
    const { data, isLoading: isHistoryLoading } = useQuery({
        queryKey: ['assistant-history'],
        queryFn: async () => {
            const response = await client.get<{
                history: ChatMessage[],
                config: { model_name: string }
            }>(`${API_ENDPOINTS.CHAT}?context=user`);
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
    const [activeTool, setActiveTool] = useState<{ name: string; status: 'running' | 'completed' } | null>(null);
    const activeToolTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const sendMessage = async ({ query, latitude, longitude, payload }: { query: string, latitude?: number, longitude?: number, payload?: any }) => {
        setIsStreaming(true);
        setActiveTool(null);

        // Collect all tools used during this response
        const toolsUsedThisResponse: string[] = [];
        const sourcesThisResponse: PolicySource[] = [];

        try {
            // Prepare streaming message placeholder
            const assistantMsg: ChatMessage = { role: 'assistant', content: '', timestamp: new Date().toISOString(), toolsUsed: [], sources: [] };
            setHistory(prev => [...prev, assistantMsg]);

            // Start Stream
            const response = await fetch(`/api${API_ENDPOINTS.CHAT}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, latitude, longitude, context: 'user', ...payload }),
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
                                setHistory(prev => {
                                    const newHistory = [...prev];
                                    const last = newHistory[newHistory.length - 1];
                                    if (last && last.role === 'assistant') {
                                        last.content = fullContent;
                                    }
                                    return newHistory;
                                });
                            } else if (data.tool_start) {
                                const toolName: string = data.tool_start;
                                // Show live spinning indicator
                                if (activeToolTimeoutRef.current) clearTimeout(activeToolTimeoutRef.current);
                                setActiveTool({ name: toolName, status: 'running' });
                                // Track for permanent record (avoid duplicates)
                                if (!toolsUsedThisResponse.includes(toolName)) {
                                    toolsUsedThisResponse.push(toolName);
                                }
                                // Embed into message immediately so it persists even before response
                                setHistory(prev => {
                                    const newHistory = [...prev];
                                    const last = newHistory[newHistory.length - 1];
                                    if (last && last.role === 'assistant') {
                                        last.toolsUsed = [...toolsUsedThisResponse];
                                    }
                                    return newHistory;
                                });
                            } else if (data.tool_end) {
                                const toolName: string = data.tool_end;
                                // Show completed badge briefly, then it stays as a pill on the message
                                setActiveTool({ name: toolName, status: 'completed' });
                                activeToolTimeoutRef.current = setTimeout(() => {
                                    setActiveTool(null);
                                }, 2000);
                            } else if (data.sources && Array.isArray(data.sources)) {
                                for (const src of data.sources as PolicySource[]) {
                                    const key = `${src.file_id}-${src.page_number}-${src.chunk_id}`;
                                    const exists = sourcesThisResponse.some(
                                        s => `${s.file_id}-${s.page_number}-${s.chunk_id}` === key
                                    );
                                    if (!exists) sourcesThisResponse.push(src);
                                }
                                setHistory(prev => {
                                    const newHistory = [...prev];
                                    const last = newHistory[newHistory.length - 1];
                                    if (last && last.role === 'assistant') {
                                        last.sources = [...sourcesThisResponse];
                                    }
                                    return newHistory;
                                });
                            } else if (data.error) {
                                const errorMsg = `[ERROR_CARD] title: Assistant Error | message: ${data.error} [/ERROR_CARD]`;
                                setHistory(prev => {
                                    const newHistory = [...prev];
                                    const last = newHistory[newHistory.length - 1];
                                    if (last && last.role === 'assistant') {
                                        last.content = errorMsg;
                                    }
                                    return newHistory;
                                });
                                break;
                            } else if (data.history) {
                                // Final sync from backend — preserve toolsUsed/sources since backend doesn't know about them
                                setHistory(prev => {
                                    const serverHistory: ChatMessage[] = data.history;
                                    if (serverHistory.length > 0) {
                                        const lastMsg = serverHistory[serverHistory.length - 1];
                                        if (lastMsg.role === 'assistant') {
                                            if (toolsUsedThisResponse.length > 0) {
                                                lastMsg.toolsUsed = toolsUsedThisResponse;
                                            }
                                            if (sourcesThisResponse.length > 0) {
                                                lastMsg.sources = sourcesThisResponse;
                                            }
                                        }
                                    }
                                    return serverHistory;
                                });
                            }
                        } catch (e) {
                            console.warn("Error parsing stream chunk", e);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Streaming error", error);
        } finally {
            setIsStreaming(false);
            // Ensure final message has all tools permanently attached
            if (toolsUsedThisResponse.length > 0 || sourcesThisResponse.length > 0) {
                setHistory(prev => {
                    const newHistory = [...prev];
                    const last = newHistory[newHistory.length - 1];
                    if (last && last.role === 'assistant') {
                        if (toolsUsedThisResponse.length > 0) {
                            last.toolsUsed = [...toolsUsedThisResponse];
                        }
                        if (sourcesThisResponse.length > 0) {
                            last.sources = [...sourcesThisResponse];
                        }
                    }
                    return newHistory;
                });
            }
            // Clear the live spinning indicator (the permanent pills remain on the message)
            activeToolTimeoutRef.current = setTimeout(() => {
                setActiveTool(null);
            }, 2000);
            queryClient.invalidateQueries({ queryKey: ['assistant-history'] });
        }
    };

    const clearHistory = async () => {
        try {
            await client.delete(`${API_ENDPOINTS.CHAT}?context=user`);
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
        activeTool,
        clearHistory,
        config: data?.config
    };
};
