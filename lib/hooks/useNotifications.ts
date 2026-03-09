"use client";

import useWebSocket, { ReadyState } from "react-use-websocket";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export function useNotifications(onMessageReceived?: (msg: any) => void) {
    const [socketUrl, setSocketUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchTokenAndConnect = async () => {
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

            let token = "";
            try {
                const res = await fetch('/api/auth/ws-token');
                if (res.ok) {
                    const data = await res.json();
                    token = data.token;
                }
            } catch (e) {
                console.error("Failed to fetch WebSocket token:", e);
            }

            const url = `${protocol}//${host}/ws/notifications/${token ? `?token=${token}` : ''}`;
            console.log("Setting Notification Socket connection to:", url);
            setSocketUrl(url);
        };

        fetchTokenAndConnect();
    }, []);

    const { readyState } = useWebSocket(socketUrl, {
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
    }, socketUrl !== null);

    return { readyState, isConnected: readyState === ReadyState.OPEN };
}
