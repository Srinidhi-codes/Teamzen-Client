"use client";

import { useDeviceSessions } from "@/lib/api/hooks";
import { useToast } from "@/components/common/ToastProvider";
import { Button } from "../ui/button";
import {
    Monitor,
    Smartphone,
    Tablet,
    Laptop,
    LogOut,
    Globe,
    Clock,
    Loader2,
    ShieldAlert,
    MonitorSmartphone,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ProfileSection } from "./ProfileSection";

export function DevicesManager() {
    const { success, error } = useToast();
    const {
        sessions,
        isLoading,
        logoutDevice,
        logoutAllOthers,
    } = useDeviceSessions();

    const handleLogoutDevice = async (jti: string, deviceName: string) => {
        if (confirm(`Are you sure you want to log out of ${deviceName}?`)) {
            try {
                await logoutDevice.mutateAsync(jti);
                success(`Successfully logged out of ${deviceName}`);
            } catch (err: any) {
                error(err.response?.data?.error || "Failed to log out of device");
            }
        }
    };

    const handleLogoutAllOthers = async () => {
        if (confirm("Are you sure you want to log out of all other devices?")) {
            try {
                await logoutAllOthers.mutateAsync();
                success("Successfully logged out of all other devices");
            } catch (err: any) {
                error(err.response?.data?.error || "Failed to log out of other devices");
            }
        }
    };

    const getDeviceIcon = (deviceType: string, os: string) => {
        const type = (deviceType || "").toLowerCase();
        const osLower = (os || "").toLowerCase();

        if (type === "mobile" || osLower === "ios" || osLower === "android" || osLower === "windows phone") {
            return <Smartphone className="h-4 w-4 text-primary" />;
        }
        if (type === "tablet" || osLower === "ipad") {
            return <Tablet className="h-4 w-4 text-primary" />;
        }
        if (osLower === "macos" || osLower === "mac") {
            return <Laptop className="h-4 w-4 text-primary" />;
        }
        return <Monitor className="h-4 w-4 text-primary" />;
    };

    const formatLastActive = (dateString: string, isCurrent: boolean) => {
        if (isCurrent) return "Active now";
        try {
            const date = new Date(dateString);
            return `Active ${formatDistanceToNow(date, { addSuffix: true })}`;
        } catch {
            return "Active recently";
        }
    };

    if (isLoading) {
        return (
            <ProfileSection title="Logged-in devices" icon={MonitorSmartphone}>
                <div className="flex flex-col items-center justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <p className="mt-3 text-sm text-muted-foreground">Loading sessions…</p>
                </div>
            </ProfileSection>
        );
    }

    return (
        <ProfileSection
            title="Logged-in devices"
            icon={MonitorSmartphone}
            description="Devices that have accessed your account"
            action={
                sessions.length > 1 ? (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogoutAllOthers}
                        disabled={logoutAllOthers.isPending}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                        {logoutAllOthers.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <LogOut className="h-3.5 w-3.5" />
                        )}
                        Log out others
                    </Button>
                ) : undefined
            }
        >
            <div className="divide-y divide-border max-h-[350px] overflow-y-auto">
                {sessions.map((session: any) => {
                    const deviceName = `${session.device_name || "Unknown Device"} (${session.os || "Unknown OS"})`;
                    return (
                        <div key={session.id} className="flex items-start justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
                            <div className="flex min-w-0 items-start gap-3">
                                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                                    {getDeviceIcon(session.device_type, session.os)}
                                </div>
                                <div className="min-w-0 space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="truncate text-sm font-medium text-foreground">
                                            {session.device_name || "Unknown Device"}
                                        </p>
                                        {session.is_current ? (
                                            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                                                Current
                                            </span>
                                        ) : null}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {session.browser || "Unknown Browser"} on {session.os || "Unknown OS"}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                                        <span className="inline-flex items-center gap-1">
                                            <Globe className="h-3 w-3" />
                                            {session.ip_address} ({session.location || "Unknown"})
                                        </span>
                                        <span className="inline-flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {formatLastActive(session.last_active, session.is_current)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {!session.is_current && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleLogoutDevice(session.jti, deviceName)}
                                    disabled={logoutDevice.isPending}
                                    className="h-8 w-8 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                >
                                    <LogOut className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    );
                })}

                {sessions.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <ShieldAlert className="mb-2 h-7 w-7 text-amber-500" />
                        <p className="text-sm font-medium text-foreground">No active sessions</p>
                        <p className="mt-1 text-xs text-muted-foreground">We couldn&apos;t detect any active sessions for your account.</p>
                    </div>
                )}
            </div>
        </ProfileSection>
    );
}
