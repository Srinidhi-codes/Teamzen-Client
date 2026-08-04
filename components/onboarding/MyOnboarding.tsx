"use client";

import { useRef, useState } from "react";
import { ClipboardList, Upload, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useMyAssignedOnboardingTasks,
  useMyOnboarding,
  useOnboardingEmployeeMutations,
} from "@/lib/graphql/onboarding/onboardingHook";
import {
  MyOnboardingTourButton,
  useMyOnboardingTour,
} from "@/components/onboarding/MyOnboardingTour";
import client from "@/lib/api/client";

const DOC_CATEGORIES = [
  "id_proof",
  "pan",
  "aadhaar",
  "bank_proof",
  "education",
  "signed_policy",
  "other",
];

export default function MyOnboardingPage() {
  const { onboarding, isLoading, error, refetch } = useMyOnboarding();
  const { tasks: assigned } = useMyAssignedOnboardingTasks();
  const { completeTask, acceptOffer, loading } = useOnboardingEmployeeMutations();
  useMyOnboardingTour(!!onboarding);
  const [acceptedName, setAcceptedName] = useState("");
  const [category, setCategory] = useState("pan");
  const [msg, setMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function uploadDoc(file: File) {
    const form = new FormData();
    form.append("file", file);
    form.append("category", category);
    form.append("title", file.name);
    if (onboarding?.id) form.append("onboarding_id", onboarding.id);
    await client.post("onboarding/documents/upload/", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setMsg("Document uploaded — awaiting HR verification");
    refetch();
  }

  if (isLoading) {
    return <div className="p-6 text-muted-foreground">Loading onboarding…</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-destructive text-sm">
        {(error as Error).message}
      </div>
    );
  }

  if (!onboarding) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="My Onboarding"
          description="Your checklist will appear here when HR starts your onboarding."
        />
        <Card className="p-8 text-center text-muted-foreground">
          <ClipboardList className="mx-auto mb-3 h-10 w-10 opacity-40" />
          No active onboarding.
        </Card>
        {assigned.length > 0 && (
          <Card className="p-4 space-y-2">
            <h3 className="font-semibold">Assigned tasks for others</h3>
            {assigned.map((t: { id: string; title: string; status: string; dueAt?: string }) => (
              <div key={t.id} className="flex justify-between text-sm border-b border-border py-2">
                <span>{t.title}</span>
                <span className="text-muted-foreground">{t.status}</span>
              </div>
            ))}
          </Card>
        )}
      </div>
    );
  }

  const hireTasks = (onboarding.tasks || []).filter(
    (t: { assigneeRole: string }) => t.assigneeRole === "hire"
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Onboarding"
        description={`${onboarding.status.replace("_", " ")} · ${onboarding.progressPct}% complete`}
        actions={<MyOnboardingTourButton />}
      />

      {msg && (
        <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm">
          {msg}
        </div>
      )}

      <div id="my-onboarding-progress">
      <Card className="p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">Progress</span>
          <span className="tabular-nums">{onboarding.progressPct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${onboarding.progressPct}%` }}
          />
        </div>
      </Card>
      </div>

      {onboarding.offerLetter && onboarding.offerLetter.status !== "accepted" && (
        <div id="my-onboarding-offer">
        <Card className="space-y-3 p-4">
          <h3 className="font-semibold">Offer letter</h3>
          <p className="text-sm font-medium">{onboarding.offerLetter.subject}</p>
          <div
            className="prose prose-sm max-w-none rounded-lg border border-border p-3 text-sm"
            dangerouslySetInnerHTML={{ __html: onboarding.offerLetter.bodyHtml }}
          />
          <div className="flex flex-wrap gap-2">
            <Input
              placeholder="Type your full name to accept"
              value={acceptedName}
              onChange={(e) => setAcceptedName(e.target.value)}
              className="max-w-sm"
            />
            <Button
              disabled={loading || acceptedName.trim().length < 2}
              onClick={async () => {
                await acceptOffer({
                  variables: {
                    input: {
                      onboardingId: onboarding.id,
                      acceptedName,
                    },
                  },
                });
                setMsg("Offer accepted");
                refetch();
              }}
            >
              Accept offer
            </Button>
          </div>
        </Card>
        </div>
      )}

      <div id="my-onboarding-docs">
      <Card className="space-y-3 p-4">
        <h3 className="font-semibold">Upload documents</h3>
        <div className="flex flex-wrap gap-2">
          <select
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {DOC_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadDoc(f);
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
        </div>
        <div className="space-y-2">
          {(onboarding.documents || []).map(
            (d: {
              id: string;
              category: string;
              fileName: string;
              verificationStatus: string;
              rejectionReason?: string;
            }) => (
              <div
                key={d.id}
                className="flex justify-between rounded-lg border border-border px-3 py-2 text-sm"
              >
                <span>
                  {d.category} · {d.fileName}
                </span>
                <span className="text-muted-foreground">
                  {d.verificationStatus}
                  {d.rejectionReason ? ` — ${d.rejectionReason}` : ""}
                </span>
              </div>
            )
          )}
        </div>
      </Card>
      </div>

      <div id="my-onboarding-checklist">
      <Card className="space-y-2 p-4">
        <h3 className="font-semibold">Your checklist</h3>
        {hireTasks.map(
          (task: {
            id: string;
            title: string;
            status: string;
            description: string;
            dueAt?: string;
          }) => (
            <div
              key={task.id}
              className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-medium flex items-center gap-2">
                  {task.status === "completed" && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  )}
                  {task.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {task.status}
                  {task.dueAt ? ` · due ${task.dueAt}` : ""}
                </p>
              </div>
              {task.status !== "completed" && task.status !== "skipped" && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={loading}
                  onClick={async () => {
                    await completeTask({ variables: { taskId: task.id } });
                    refetch();
                  }}
                >
                  Mark done
                </Button>
              )}
            </div>
          )
        )}
      </Card>
      </div>

      {assigned.length > 0 && (
        <Card className="space-y-2 p-4">
          <h3 className="font-semibold">Tasks assigned to you (for teammates)</h3>
          {assigned.map(
            (t: { id: string; title: string; status: string; dueAt?: string }) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-lg border border-border p-3 text-sm"
              >
                <span>
                  {t.title}
                  {t.dueAt ? ` · due ${t.dueAt}` : ""}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={loading || t.status === "completed"}
                  onClick={async () => {
                    await completeTask({ variables: { taskId: t.id } });
                    refetch();
                  }}
                >
                  Complete
                </Button>
              </div>
            )
          )}
        </Card>
      )}
    </div>
  );
}
