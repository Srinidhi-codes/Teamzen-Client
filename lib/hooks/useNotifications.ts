"use client";

import client from "@/lib/api/client";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";

export function useNotifications(
    onMessageReceived?: (msg: any) => void,
    options: { silent?: boolean } = { silent: false }
) {
    const [socketUrl, setSocketUrl] = useState<string | null>(null);
    const callbackRef = useRef(onMessageReceived);

    useEffect(() => {
        callbackRef.current = onMessageReceived;
    }, [onMessageReceived]);

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
                // 🔐 Use the authenticated client to benefit from proxy/refresh interceptors
                // Note: We call /auth/ws-token which is our local Next.js route
                const res = await client.get('/auth/ws-token');
                token = res.data.token;
            } catch (e) {
                console.error("Failed to fetch WebSocket token:", e);
                // If it's a 401, the client.ts interceptor should have triggered a redirect 
                // or attempted a refresh already.
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
        share: true,
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
                if (!options.silent) {
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

                if (callbackRef.current) {
                    callbackRef.current(data);
                }
            }
        }
    }, socketUrl !== null);

    return { readyState, isConnected: readyState === ReadyState.OPEN };
}
