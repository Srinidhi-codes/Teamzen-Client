"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
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
  const askedRef = useRef(false);
  const [updateLocation] = useMutation(UPDATE_LOGIN_LOCATION);

  const { data, refetch } = useQuery<SecurityLogResponse>(GET_MY_LOGIN_HISTORY, {
    variables: { page: 1, pageSize: 1 },
    fetchPolicy: "network-only",
  });

  const handleSync = useCallback(() => {
    if (!navigator.geolocation) {
      setIsBlocked(true);
      return;
    }

    setIsSyncing(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await updateLocation({
            variables: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
          });
          setIsVisible(false);
          setIsBlocked(false);
          try {
            sessionStorage.removeItem("teamzen_sync_location");
          } catch {
            /* ignore */
          }
          refetch();
        } catch (err) {
          console.error("Failed to update location:", err);
        } finally {
          setIsSyncing(false);
        }
      },
      (err) => {
        if (err.code === 1) setIsBlocked(true);
        setIsSyncing(false);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 }
    );
  }, [refetch, updateLocation]);

  useEffect(() => {
    const latestLog = data?.mySecurityLogs?.results?.[0];
    let pendingSync = false;
    try {
      pendingSync = sessionStorage.getItem("teamzen_sync_location") === "1";
    } catch {
      pendingSync = false;
    }
    const needsLocation = pendingSync || Boolean(latestLog && !latestLog.latitude);
    setIsVisible(needsLocation);
    if (!needsLocation || askedRef.current) return;

    askedRef.current = true;

    const requestNativePrompt = () => handleSync();

    if (navigator.permissions?.query) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((result) => {
          if (result.state === "denied") {
            setIsBlocked(true);
            return;
          }
          requestNativePrompt();
          result.onchange = () => {
            if (result.state === "denied") setIsBlocked(true);
            else if (result.state === "granted") {
              setIsBlocked(false);
              handleSync();
            }
          };
        })
        .catch(requestNativePrompt);
    } else {
      requestNativePrompt();
    }
  }, [data, handleSync]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] animate-in slide-in-from-top duration-300">
      <div className="border-b border-rose-700/30 bg-rose-600 text-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/15 sm:flex">
              <ShieldAlert className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">
                {isBlocked ? "Location blocked" : "Location required"}
              </p>
              <p className="text-xs leading-snug text-white/85">
                {isBlocked
                  ? "Allow location access in your browser settings, then try again."
                  : "Allow location in the browser prompt to verify this session."}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors",
                "bg-white text-rose-700 hover:bg-rose-50 disabled:opacity-50"
              )}
            >
              {isSyncing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Globe className="h-3.5 w-3.5" />
              )}
              {isSyncing ? "Updating…" : isBlocked ? "Try again" : "Share location"}
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="rounded-md p-1.5 transition-colors hover:bg-white/10"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4 text-white/70" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
