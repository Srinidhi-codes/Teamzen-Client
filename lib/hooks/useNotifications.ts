"use client";

import useWebSocket, { ReadyState } from "react-use-websocket";
import { toast } from "sonner";
import { useEffect, useRef, useState, useCallback } from "react";

let cachedToken: string | null = null;
let tokenFetchPromise: Promise<string | null> | null = null;
let lastTokenTime = 0;

export async function getSharedWsToken(forceRefresh = false): Promise<string | null> {
    const now = Date.now();
    // Cache token for 2 minutes unless forced
    if (!forceRefresh && cachedToken && now - lastTokenTime < 120000) {
        return cachedToken;
    }
    if (tokenFetchPromise) {
        return tokenFetchPromise;
    }

    tokenFetchPromise = (async () => {
        try {
            const url = forceRefresh ? "/api/auth/ws-token?refresh=1" : "/api/auth/ws-token";
            const tokenResponse = await fetch(url, {
                credentials: "include",
            });
            if (!tokenResponse.ok) {
                cachedToken = null;
                return null;
            }
            const { token } = (await tokenResponse.json()) as { token?: string };
            if (token) {
                cachedToken = token;
                lastTokenTime = Date.now();
                return token;
            }
            cachedToken = null;
            return null;
        } catch (error) {
            cachedToken = null;
            return null;
        } finally {
            tokenFetchPromise = null;
        }
    })();

    return tokenFetchPromise;
}

function buildWsUrl(token: string): string {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/";
    let protocol = "ws:";
    let host = "localhost:8000";

    try {
        const urlObj = new URL(apiUrl);
        protocol = urlObj.protocol === "https:" ? "wss:" : "ws:";
        host = urlObj.host;
    } catch {
        // Fallback
    }

    return `${protocol}//${host}/ws/notifications/?token=${encodeURIComponent(token)}`;
}

export function useNotifications(
    onMessageReceived?: (msg: any) => void,
    options: { silent?: boolean } = { silent: false }
) {
    const [socketUrl, setSocketUrl] = useState<string | null>(null);
    const [shouldConnect, setShouldConnect] = useState(false);
    const callbackRef = useRef(onMessageReceived);
    const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        callbackRef.current = onMessageReceived;
    }, [onMessageReceived]);

    const initConnection = useCallback(async (forceRefresh = false) => {
        const token = await getSharedWsToken(forceRefresh);
        if (!token) {
            setSocketUrl(null);
            setShouldConnect(false);
            return;
        }

        const url = buildWsUrl(token);
        setSocketUrl(url);
        setShouldConnect(true);
    }, []);

    useEffect(() => {
        let mounted = true;
        initConnection();

        return () => {
            mounted = false;
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
            }
        };
    }, [initConnection]);

    const { readyState, sendJsonMessage, sendMessage } = useWebSocket(
        socketUrl,
        {
            shouldReconnect: (closeEvent) => {
                // Never reconnect automatically if the server rejected authentication
                if (
                    closeEvent?.code === 4401 ||
                    closeEvent?.code === 4001 ||
                    closeEvent?.code === 1008
                ) {
                    return false;
                }
                return shouldConnect;
            },
            reconnectAttempts: 10,
            reconnectInterval: (attempt) => Math.min(2000 * Math.pow(1.5, attempt), 20000),
            share: true,
            onOpen: () => {
                if (refreshTimeoutRef.current) {
                    clearTimeout(refreshTimeoutRef.current);
                    refreshTimeoutRef.current = null;
                }
            },
            onClose: (event) => {
                // If authentication failed on server (code 4401/4001), stop immediately.
                // Clear the stale token and attempt a single quiet token refresh after 3 seconds.
                if (event.code === 4401 || event.code === 4001) {
                    cachedToken = null;
                    lastTokenTime = 0;
                    setShouldConnect(false);
                    setSocketUrl(null);

                    if (refreshTimeoutRef.current) {
                        clearTimeout(refreshTimeoutRef.current);
                    }
                    refreshTimeoutRef.current = setTimeout(() => {
                        initConnection(true);
                    }, 3000);
                }
            },
            onError: () => {
                // Quietly handle connection errors to avoid flooding developer console
            },
            onMessage: (event) => {
                let data: any;
                try {
                    data = JSON.parse(event.data);
                } catch {
                    return;
                }

                // Process personal, admin, and feed notifications
                if (data.level === "personal" || data.level === "admin" || data.level === "feed_update") {
                    if (data.level !== "feed_update" && !options.silent) {
                        const displayVerb = data.verb?.replace(/_self$/, "").replace(/_/g, " ");
                        const description = data.verb?.endsWith("_self")
                            ? "Action confirmed"
                            : `${data.actor?.firstName || ""} ${displayVerb || ""}`.trim();

                        if (data.verb?.includes("rejected")) {
                            toast.error(data.message, { description, duration: 6000 });
                        } else if (data.verb?.includes("approved")) {
                            toast.success(data.message, { description, duration: 6000 });
                        } else if (data.verb?.includes("cancelled")) {
                            toast(data.message, {
                                description,
                                duration: 6000,
                                className: "bg-blue-500 text-white border-none shadow-blue-500/50",
                            });
                        } else {
                            toast.success(data.message, { description, duration: 5000 });
                        }
                    }

                    if (typeof window !== "undefined" && data.verb === "announcement") {
                        window.dispatchEvent(new CustomEvent("teamzen_announcement", { detail: data }));
                    }

                    if (callbackRef.current) {
                        callbackRef.current(data);
                    }
                }
            },
        },
        shouldConnect && socketUrl !== null
    );

    return {
        readyState,
        isConnected: readyState === ReadyState.OPEN,
        sendJsonMessage,
        sendMessage,
    };
}
