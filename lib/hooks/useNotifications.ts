"use client";

import useWebSocket, { ReadyState } from "react-use-websocket";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";

let cachedToken: string | null = null;
let tokenFetchPromise: Promise<string | null> | null = null;
let lastTokenTime = 0;

async function getSharedWsToken(): Promise<string | null> {
    const now = Date.now();
    // Cache token for 5 minutes
    if (cachedToken && now - lastTokenTime < 300000) {
        return cachedToken;
    }
    if (tokenFetchPromise) {
        return tokenFetchPromise;
    }

    tokenFetchPromise = (async () => {
        try {
            const tokenResponse = await fetch("/api/auth/ws-token", {
                credentials: "include",
            });
            if (!tokenResponse.ok) return null;
            const { token } = (await tokenResponse.json()) as { token?: string };
            if (token) {
                cachedToken = token;
                lastTokenTime = Date.now();
                return token;
            }
            return null;
        } catch (error) {
            console.error("Failed to fetch ws-token:", error);
            return null;
        } finally {
            tokenFetchPromise = null;
        }
    })();

    return tokenFetchPromise;
}

export function useNotifications(
    onMessageReceived?: (msg: any) => void,
    options: { silent?: boolean } = { silent: false }
) {
    const [socketUrl, setSocketUrl] = useState<string | null>(null);
    const [shouldConnect, setShouldConnect] = useState(false);
    const callbackRef = useRef(onMessageReceived);

    useEffect(() => {
        callbackRef.current = onMessageReceived;
    }, [onMessageReceived]);

    useEffect(() => {
        let cancelled = false;

        const connect = async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/";
            let protocol = "ws:";
            let host = "localhost:8000";

            try {
                const urlObj = new URL(apiUrl);
                protocol = urlObj.protocol === "https:" ? "wss:" : "ws:";
                host = urlObj.host;
            } catch (e) {
                console.error("Invalid NEXT_PUBLIC_API_URL for WebSocket:", e);
            }

            const token = await getSharedWsToken();
            if (cancelled) return;

            if (!token) {
                setSocketUrl(null);
                setShouldConnect(false);
                return;
            }

            const url = `${protocol}//${host}/ws/notifications/?token=${encodeURIComponent(token)}`;
            setSocketUrl(url);
            setShouldConnect(true);
        };

        connect();

        return () => {
            cancelled = true;
        };
    }, []);

    const { readyState, sendJsonMessage, sendMessage } = useWebSocket(socketUrl, {
        shouldReconnect: () => shouldConnect,
        reconnectInterval: 5000,
        share: true,
        onOpen: () => { },
        onClose: () => { },
        onError: (err) => {
            if (err instanceof Error) {
                console.error("Error Message:", err.message);
            }
        },
        onMessage: (event) => {
            const data = JSON.parse(event.data);
            // Process both personal and admin notifications
            if (data.level === 'personal' || data.level === 'admin' || data.level === 'feed_update') {
                if (data.level !== 'feed_update' && !options.silent) {
                    const displayVerb = data.verb?.replace(/_self$/, "").replace(/_/g, " ");
                    const description = data.verb?.endsWith('_self') ? "Action confirmed" : `${data.actor?.firstName} ${displayVerb}`;

                    // Color coding based on verb
                    if (data.verb?.includes('rejected')) {
                        toast.error(data.message, { description, duration: 6000 });
                    } else if (data.verb?.includes('approved')) {
                        toast.success(data.message, { description, duration: 6000 });
                    } else if (data.verb?.includes('cancelled')) {
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
        }
    }, shouldConnect && socketUrl !== null);

    return { readyState, isConnected: readyState === ReadyState.OPEN, sendJsonMessage, sendMessage };
}
