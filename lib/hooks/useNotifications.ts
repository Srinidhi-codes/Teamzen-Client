"use client";

import useWebSocket, { ReadyState } from "react-use-websocket";
import { toast } from "sonner";
import { useEffect, useCallback } from "react";

export function useNotifications(onMessageReceived?: (msg: any) => void) {
    // Use window.location to determine the correct host
    const getSocketUrl = useCallback(() => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/";
        let protocol = "ws:";
        let host = "localhost:8000";

        try {
            // Explicitly parse the NEXT_PUBLIC_API_URL to construct the wss:// URL to the Render backend,
            // instead of using window.location.host which points to Vercel.
            const urlObj = new URL(apiUrl);
            protocol = urlObj.protocol === "https:" ? "wss:" : "ws:";
            host = urlObj.host;
        } catch (e) {
            console.error("Invalid NEXT_PUBLIC_API_URL for WebSocket:", e);
        }

        const url = `${protocol}//${host}/ws/notifications/`;
        console.log("Attempting Notification Socket connection to:", url);
        return url;
    }, []);

    const { readyState } = useWebSocket(getSocketUrl, {
        shouldReconnect: () => true,
        reconnectInterval: 5000,
        onOpen: () => console.log("Notification Socket Connected ✅"),
        onClose: () => console.log("Notification Socket Disconnected ❌"),
        onError: (err) => {
            console.error("Notification Socket Error ⚠️:", err);
            // WebSocket errors are often opaque events, but we can try to extract more info
            if (err instanceof Error) {
                console.error("Error Message:", err.message);
            }
        },
        onMessage: (event) => {
            const data = JSON.parse(event.data);
            // Process both personal and admin notifications
            if (data.level === 'personal' || data.level === 'admin') {
                toast.success(data.message, {
                    description: `${data.actor?.firstName} ${data.verb}`,
                    duration: 5000,
                });
                if (onMessageReceived) {
                    onMessageReceived(data);
                }
            }
        }
    });

    return { readyState, isConnected: readyState === ReadyState.OPEN };
}
