"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { UPDATE_LOGIN_LOCATION } from "@/lib/graphql/users/mutations";
import { GET_MY_LOGIN_HISTORY } from "@/lib/graphql/users/queries";
import { SecurityLogResponse } from "@/lib/graphql/users/types";
import { Globe, ShieldAlert, Sparkles, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function LocationSyncBanner() {
    const [isVisible, setIsVisible] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const [updateLocation] = useMutation(UPDATE_LOGIN_LOCATION);

    // Check if the latest login has coordinates
    const { data, refetch } = useQuery<SecurityLogResponse>(GET_MY_LOGIN_HISTORY, {
        variables: { page: 1, pageSize: 1 },
        fetchPolicy: "network-only"
    });

    useEffect(() => {
        // Check if permission is already denied
        if (navigator.permissions && navigator.permissions.query) {
            navigator.permissions.query({ name: 'geolocation' }).then(result => {
                if (result.state === 'denied') {
                    setIsBlocked(true);
                }
                result.onchange = () => {
                    if (result.state === 'denied') setIsBlocked(true);
                    else if (result.state === 'granted') {
                        setIsBlocked(false);
                        handleSync(); // Auto-sync if they grant it via lock icon
                    }
                };
            });
        }

        const latestLog = data?.mySecurityLogs?.results?.[0];
        // If there's a log but no latitude, show the banner
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
        <div className="fixed top-0 left-0 right-0 z-[100] animate-in slide-in-from-top duration-500">
            <div className="bg-linear-to-r from-rose-600 via-rose-500 to-orange-500 text-white shadow-2xl border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 py-2 sm:py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex w-8 h-8 bg-white/20 rounded-lg items-center justify-center backdrop-blur-md">
                            <ShieldAlert className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-white/90">
                                {isBlocked ? "Location Blocked" : "Security Action Required"}
                            </p>
                            <p className="text-[9px] sm:text-[11px] font-medium text-white/80 leading-none">
                                {isBlocked 
                                    ? "Please click the Lock icon (🔒) in your address bar and Allow Location to sync."
                                    : "Your login entry point is not yet verified. Sync location to secure your session."
                                }
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleSync}
                            disabled={isSyncing}
                            className={cn(
                                "flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all active:scale-95",
                                "bg-white text-rose-600 hover:bg-rose-50 shadow-lg shadow-black/10 disabled:opacity-50"
                            )}
                        >
                            {isSyncing ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                                <Globe className="w-3 h-3" />
                            )}
                            {isSyncing ? "Syncing..." : isBlocked ? "Retry Sync" : "Sync Location"}
                        </button>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="p-1 hover:bg-white/10 rounded-md transition-colors"
                        >
                            <X className="w-4 h-4 text-white/60" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Ambient Glow */}
            <div className="h-[2px] bg-white/30 w-full animate-pulse" />
        </div>
    );
}
