"use client";

import { useCallback, useEffect, useState } from "react";
import { Calendar, Loader2, Link2, Unlink } from "lucide-react";
import client from "@/lib/api/client";
import { useToast } from "@/components/common/ToastProvider";
import { Button } from "@/components/ui/button";
import { ProfileSection } from "./ProfileSection";

type Status = {
  configured: boolean;
  connected: boolean;
  calendar_id: string | null;
  connected_at: string | null;
};

export function IntegrationsTab() {
  const { success, error } = useToast();
  const [status, setStatus] = useState<Status | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { data } = await client.get("/integrations/google/calendar/status/");
      setStatus(data);
    } catch (err: any) {
      setStatus(null);
      const code = err?.response?.status;
      if (code === 401) {
        setLoadError("Please sign in again to manage calendar sync.");
      } else if (code === 404) {
        setLoadError(
          "Calendar API not found on this server. Redeploy backend with Sequence 6, or point the app at local Django."
        );
      } else {
        setLoadError("Could not reach the calendar status API. Check that the backend is running.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const gcal = params.get("gcal");
    if (gcal === "connected") {
      success("Google Calendar connected");
      load();
    } else if (gcal === "error" || gcal === "missing") {
      error("Google Calendar connection failed");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- toast once from query
  }, []);

  const handleConnect = () => {
    window.location.href = "/api/integrations/google/calendar/connect/";
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await client.post("/integrations/google/calendar/disconnect/");
      success("Google Calendar disconnected");
      await load();
    } catch {
      error("Could not disconnect");
    } finally {
      setDisconnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading integrations…
      </div>
    );
  }

  return (
    <ProfileSection
      title="Google Calendar"
      icon={Calendar}
      description="Sync approved leave to your calendar and let the assistant check conflicts before you apply."
    >
      {loadError ? (
        <div className="space-y-2">
          <p className="text-sm text-destructive">{loadError}</p>
          <Button variant="outline" size="sm" onClick={load}>
            Retry
          </Button>
        </div>
      ) : !status?.configured ? (
        <p className="text-sm text-muted-foreground">
          Calendar sync is not configured on this API server. Add{" "}
          <code className="text-xs">GOOGLE_CALENDAR_CLIENT_ID</code>,{" "}
          <code className="text-xs">GOOGLE_CALENDAR_CLIENT_SECRET</code>, and{" "}
          <code className="text-xs">GOOGLE_CALENDAR_REDIRECT_URI</code> to the{" "}
          <strong>backend</strong> environment (local <code className="text-xs">.env</code> or
          Render), then restart.
        </p>
      ) : status.connected ? (
        <div className="flex flex-wrap items-center gap-3 rounded-lg bg-muted/50 px-4 py-3">
          <span className="text-sm text-foreground">
            Connected{status.calendar_id ? ` · ${status.calendar_id}` : ""}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDisconnect}
            disabled={disconnecting}
          >
            {disconnecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Unlink className="h-4 w-4" />
            )}
            Disconnect
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <Button size="sm" onClick={handleConnect}>
            <Link2 className="h-4 w-4" />
            Connect Google Calendar
          </Button>
          <p className="text-xs text-muted-foreground">
            By connecting, you agree to our{" "}
            <a href="/privacy" className="underline underline-offset-2 hover:text-foreground">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      )}
    </ProfileSection>
  );
}
