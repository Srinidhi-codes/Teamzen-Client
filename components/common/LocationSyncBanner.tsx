"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { UPDATE_LOGIN_LOCATION } from "@/lib/graphql/users/mutations";
import { GET_MY_LOGIN_HISTORY } from "@/lib/graphql/users/queries";
import { SecurityLogResponse } from "@/lib/graphql/users/types";
import { Globe, ShieldAlert, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function LocationSyncBanner() {
    const [isVisible, setIsVisible] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const [updateLocation] = useMutation(UPDATE_LOGIN_LOCATION);

    const { data, refetch } = useQuery<SecurityLogResponse>(GET_MY_LOGIN_HISTORY, {
        variables: { page: 1, pageSize: 1 },
        fetchPolicy: "network-only"
    });

    useEffect(() => {
        if (navigator.permissions && navigator.permissions.query) {
            navigator.permissions.query({ name: 'geolocation' }).then(result => {
                if (result.state === 'denied') {
                    setIsBlocked(true);
                }
                result.onchange = () => {
                    if (result.state === 'denied') setIsBlocked(true);
                    else if (result.state === 'granted') {
                        setIsBlocked(false);
                        handleSync();
                    }
                };
            });
        }

        const latestLog = data?.mySecurityLogs?.results?.[0];
        if (latestLog && !latestLog.latitude) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [data]);

    const handleSync = async () => {
        setIsSyncing(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    await updateLocation({
                        variables: {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        }
                    });
                    setIsVisible(false);
                    refetch();
                } catch (err) {
                    console.error("Failed to update location:", err);
                } finally {
                    setIsSyncing(false);
                }
            },
            (err) => {
                console.error("Geolocation error:", err);
                if (err.code === 1) setIsBlocked(true);
                setIsSyncing(false);
            },
            { enableHighAccuracy: true }
        );
    };

    if (!isVisible) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] animate-in slide-in-from-top duration-300">
            <div className="bg-rose-600 text-white border-b border-rose-700/30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="hidden sm:flex w-8 h-8 bg-white/15 rounded-md items-center justify-center shrink-0">
                            <ShieldAlert className="w-4 h-4 text-white" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-white">
                                {isBlocked ? "Location blocked" : "Location required"}
                            </p>
                            <p className="text-xs text-white/85 leading-snug">
                                {isBlocked
                                    ? "Allow location access in your browser settings, then try again."
                                    : "Share your location to complete login verification."
                                }
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={handleSync}
                            disabled={isSyncing}
                            className={cn(
                                "inline-flex items-center gap-2 h-9 px-3 rounded-md text-sm font-medium transition-colors",
                                "bg-white text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                            )}
                        >
                            {isSyncing ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Globe className="w-3.5 h-3.5" />
                            )}
                            {isSyncing ? "Updating…" : isBlocked ? "Try again" : "Share location"}
                        </button>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
                            aria-label="Dismiss"
                        >
                            <X className="w-4 h-4 text-white/70" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
