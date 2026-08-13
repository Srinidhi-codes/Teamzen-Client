"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import Link from "next/link";
import { PageHeader } from "@/components/common/PageHeader";
import { PageSkeleton } from "@/components/common/PageSkeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  COMPLETE_OFFBOARDING_TASK,
  MY_OFFBOARDING,
} from "@/lib/graphql/offboarding/queries";

function letterLabel(subject: string | null | undefined, letterType: string, userName?: string) {
  const name = userName?.trim() || "Employee";
  const raw = subject || letterType;
  return raw
    .replace(/\{\{\s*employee_name\s*\}\}/gi, name)
    .replace(/\{\s*employee_name\s*\}/gi, name);
}

function needsUpload(task: { title?: string; requiresDocumentCategory?: string }) {
  const title = (task.title || "").toLowerCase();
  return (
    Boolean(task.requiresDocumentCategory) ||
    title.includes("exit form") ||
    title.includes("resignation")
  );
}

function uploadLabel(task: { title?: string }) {
  const title = (task.title || "").toLowerCase();
  if (title.includes("exit form") || title.includes("resignation")) {
    return "Upload exit form";
  }
  return "Upload";
}

async function gqlMutate(query: string, variables: Record<string, unknown>) {
  const res = await fetch("/api/graphql/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    credentials: "include",
  });
  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(json.errors[0].message || "Request failed");
  }
  return json.data;
}

export default function MyExitPage() {
  const { data, loading, refetch } = useQuery(MY_OFFBOARDING, {
    fetchPolicy: "cache-and-network",
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const ob = data?.myOffboarding;

  const uploadForTask = async (
    file: File,
    opts?: { category?: string; title?: string }
  ) => {
    const form = new FormData();
    form.append("file", file);
    form.append("category", opts?.category || "exit_clearance");
    form.append("title", opts?.title || file.name);
    const res = await fetch("/api/documents/upload", {
      method: "POST",
      body: form,
      credentials: "include",
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || "Upload failed");
  };

  const markDone = async (taskId: string) => {
    setBusy(true);
    try {
      const result = await gqlMutate(COMPLETE_OFFBOARDING_TASK, {
        taskId,
        notes: "",
      });
      if (!result?.completeOffboardingTask?.success) {
        throw new Error(result?.completeOffboardingTask?.error || "Failed");
      }
      setMsg("Task marked complete");
      await refetch();
    } catch (e: any) {
      setMsg(e.message || "Could not complete task");
    } finally {
      setBusy(false);
    }
  };

  if (loading && !ob) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exit / Full & Final"
        description="Track your exit clearance, settlement, and letters."
      />
      {!ob && (
        <Card className="p-8 text-center text-muted-foreground">
          No active exit / F&F process. If you are leaving, HR will start F&F and email
          you a secure portal link.
        </Card>
      )}
      {ob && (
        <Card className="space-y-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium">
                Exit date: {ob.exitDate || "—"} · LWD: {ob.lastWorkingDay || "—"}
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/documents">Open Documents</Link>
            </Button>
          </div>
          {msg && (
            <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
              {msg}
            </p>
          )}
          {(() => {
            const employeeTasks = (ob.tasks || []).filter(
              (t: any) => t.assigneeRole === "employee"
            );
            const checklistDone = employeeTasks.filter(
              (t: any) => t.status === "completed" || t.status === "skipped"
            ).length;
            const checklistTotal = employeeTasks.length;
            const checklistPct =
              checklistTotal === 0
                ? 0
                : Math.round((100 * checklistDone) / checklistTotal);
            const isFullyComplete = ob.status === "completed";
            const statusLabel = isFullyComplete
              ? "Completed"
              : (ob.status || "in_progress").replace(/_/g, " ");
            return (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold">Your checklist</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                        isFullyComplete
                          ? "bg-emerald-100 text-emerald-800"
                          : ob.status === "settlement_pending"
                            ? "bg-amber-100 text-amber-900"
                            : ob.status === "letters_pending"
                              ? "bg-sky-100 text-sky-900"
                              : "bg-muted text-foreground"
                      }`}
                    >
                      {statusLabel}
                    </span>
                    <span className="text-xs font-medium tabular-nums text-muted-foreground">
                      {isFullyComplete
                        ? "100% complete"
                        : `Checklist ${checklistPct}%`}
                    </span>
                  </div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary"
                    style={{
                      width: `${isFullyComplete ? 100 : checklistPct}%`,
                    }}
                  />
                </div>
                <ul className="space-y-2 text-sm">
                  {employeeTasks.map((t: any) => (
                <li
                  key={t.id}
                  className="flex flex-wrap items-center justify-between gap-3 border-b border-border py-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{t.title}</p>
                    <p className="text-xs capitalize text-muted-foreground">
                      {t.phase} · {t.status}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {needsUpload(t) &&
                      t.status !== "completed" &&
                      t.status !== "skipped" && (
                        <label className="cursor-pointer rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-semibold hover:bg-muted/50">
                          {uploadLabel(t)}
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                            className="hidden"
                            disabled={busy}
                            onChange={async (e) => {
                              const f = e.target.files?.[0];
                              e.target.value = "";
                              if (!f) return;
                              setBusy(true);
                              try {
                                const isForm =
                                  (t.title || "").toLowerCase().includes("exit form") ||
                                  (t.title || "").toLowerCase().includes("resignation");
                                await uploadForTask(f, {
                                  category:
                                    t.requiresDocumentCategory || "exit_clearance",
                                  title: isForm ? `Exit form — ${f.name}` : f.name,
                                });
                                await markDone(t.id);
                                setMsg(isForm ? "Exit form uploaded" : "File uploaded");
                              } catch (err: any) {
                                setMsg(err.message);
                              } finally {
                                setBusy(false);
                              }
                            }}
                          />
                        </label>
                      )}
                    {t.status !== "completed" && t.status !== "skipped" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busy}
                        onClick={() => markDone(t.id)}
                      >
                        Mark done
                      </Button>
                    )}
                    {t.status === "completed" && (
                      <span className="text-xs font-medium text-emerald-700">Done</span>
                    )}
                  </div>
                </li>
                  ))}
                </ul>
              </>
            );
          })()}
          {ob.settlement && (
            <p className="text-sm">
              Settlement: <span className="font-medium capitalize">{ob.settlement.status}</span>
              {" · "}Net {ob.settlement.netPayable}
            </p>
          )}
          {(ob.letters || []).length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Letters</p>
              {ob.letters.map((l: any) => (
                <a
                  key={l.id}
                  className="block text-sm text-primary underline"
                  href={l.downloadUrl || l.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {letterLabel(l.subject, l.letterType, ob.userName)}
                </a>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            After your account is deactivated, use the magic link emailed by HR to finish
            remaining steps.
          </p>
        </Card>
      )}
    </div>
  );
}
