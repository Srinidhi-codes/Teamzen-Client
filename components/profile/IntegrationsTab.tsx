"use client";

import { useCallback, useEffect, useState } from "react";
import { Calendar, Loader2, Link2, Unlink } from "lucide-react";
import client from "@/lib/api/client";
import { useToast } from "@/components/common/ToastProvider";
import { Button } from "@/components/ui/button";

type Status = {
  configured: boolean;
  connected: boolean;
  calendar_id: string | null;
  connected_at: string | null;
};

export function IntegrationsTab() {
  const { success, error } = useToast();
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await client.get("/integrations/google/calendar/status/");
      setStatus(data);
    } catch {
      setStatus(null);
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
    // Full navigation so OAuth cookies/redirect work
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
    <div className="rounded-xl border border-border bg-card p-6 space-y-4 max-w-xl">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-muted p-2">
          <Calendar className="h-5 w-5 text-foreground" />
        </div>
        <div className="flex-1 space-y-1">
          <h3 className="text-base font-semibold text-foreground">Google Calendar</h3>
          <p className="text-sm text-muted-foreground">
            Sync approved leave to your calendar and let the AI check conflicts before
            you apply.
          </p>
        </div>
      </div>

      {!status?.configured ? (
        <p className="text-sm text-muted-foreground">
          Calendar sync is not configured on this server. Ask an admin to set{" "}
          <code className="text-xs">GOOGLE_CALENDAR_*</code> env vars.
        </p>
      ) : status.connected ? (
        <div className="flex flex-wrap items-center gap-3">
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
        <Button size="sm" onClick={handleConnect}>
          <Link2 className="h-4 w-4" />
          Connect Google Calendar
        </Button>
      )}
    </div>
  );
}
