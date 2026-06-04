"use client";

import { useDeviceSessions } from "@/lib/api/hooks";
import { useToast } from "@/components/common/ToastProvider";
import { Card } from "@/components/common/Card";
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
    ShieldAlert 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function DevicesManager() {
    const { success, error } = useToast();
    const { 
        sessions, 
        isLoading, 
        logoutDevice, 
        logoutAllOthers 
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

    // Helper to render browser & OS icons
    const getDeviceIcon = (deviceType: string, os: string) => {
        const type = (deviceType || "").toLowerCase();
        const osLower = (os || "").toLowerCase();

        if (type === "mobile" || osLower === "ios" || osLower === "android" || osLower === "windows phone") {
            return <Smartphone className="w-5 h-5 text-indigo-500" />;
        }
        if (type === "tablet" || osLower === "ipad") {
            return <Tablet className="w-5 h-5 text-blue-500" />;
        }
        if (osLower === "macos" || osLower === "mac") {
            return <Laptop className="w-5 h-5 text-purple-500" />;
        }
        return <Monitor className="w-5 h-5 text-teal-500" />;
    };

    // Helper to format last active date safely
    const formatLastActive = (dateString: string, isCurrent: boolean) => {
        if (isCurrent) return "Active now";
        try {
            const date = new Date(dateString);
            return `Active ${formatDistanceToNow(date, { addSuffix: true })}`;
        } catch (e) {
            return "Active recently";
        }
    };

    if (isLoading) {
        return (
            <Card title="Logged-in Devices" hover gradient>
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    <p className="text-sm text-gray-500 font-medium">Loading active sessions...</p>
                </div>
            </Card>
        );
    }

    return (
        <Card title="Logged-in Devices" hover gradient>
            <div className="space-y-5">
                <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 font-medium">
                        These are the devices that have accessed your account.
                    </p>
                    {sessions.length > 1 && (
                        <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={handleLogoutAllOthers}
                            disabled={logoutAllOthers.isPending}
                            className="text-xs text-red-600 hover:text-red-500 hover:bg-red-50/50 px-2 py-1 h-auto font-semibold flex items-center gap-1 transition-all"
                        >
                            {logoutAllOthers.isPending ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <LogOut className="w-3.5 h-3.5" />
                            )}
                            Log Out Others
                        </Button>
                    )}
                </div>

                <div className="divide-y divide-gray-100 max-h-[350px] overflow-y-auto pr-1">
                    {sessions.map((session: any) => {
                        const deviceName = `${session.device_name || 'Unknown Device'} (${session.os || 'Unknown OS'})`;
                        return (
                            <div key={session.id} className="py-3.5 flex items-start justify-between gap-4 first:pt-0 last:pb-0">
                                <div className="flex items-start gap-3.5 min-w-0">
                                    <div className="p-2.5 bg-gray-50 rounded-2xl border border-gray-100/60 mt-0.5">
                                        {getDeviceIcon(session.device_type, session.os)}
                                    </div>
                                    <div className="min-w-0 space-y-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="font-semibold text-gray-900 text-sm truncate">
                                                {session.device_name || "Unknown Device"}
                                            </p>
                                            {session.is_current ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                                                    Current Device
                                                </span>
                                            ) : null}
                                        </div>

                                        <p className="text-xs text-gray-600 font-medium">
                                            {session.browser || "Unknown Browser"} on {session.os || "Unknown OS"}
                                        </p>

                                        <div className="flex items-center gap-3 text-[11px] text-gray-500 flex-wrap">
                                            <span className="flex items-center gap-1 font-medium">
                                                <Globe className="w-3 h-3 text-gray-400" />
                                                {session.ip_address} ({session.location || "Unknown Location"})
                                            </span>
                                            <span className="flex items-center gap-1 font-medium">
                                                <Clock className="w-3 h-3 text-gray-400" />
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
                                        className="text-gray-400 hover:text-red-600 hover:bg-red-50/50 p-1.5 rounded-xl h-8 w-8 transition-colors shrink-0"
                                    >
                                        <LogOut className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        );
                    })}

                    {sessions.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <ShieldAlert className="w-8 h-8 text-amber-500 mb-2" />
                            <p className="text-sm font-semibold text-gray-900">No active sessions</p>
                            <p className="text-xs text-gray-500 mt-1">We couldn't detect any active sessions for your account.</p>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}
