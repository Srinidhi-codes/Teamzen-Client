"use client";

import { useEffect, useState } from "react";
import { Download, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageSkeleton } from "@/components/common/PageSkeleton";
import {
  ACK_SETTLEMENT,
  COMPLETE_OFFBOARDING_TASK,
  EXIT_SESSION,
} from "@/lib/graphql/offboarding/queries";

async function gqlFetch(query: string, variables: Record<string, unknown>) {
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

function money(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);
}

function letterSubject(subject: string | null | undefined, userName: string) {
  if (!subject) return "";
  const name = userName?.trim() || "Employee";
  return subject
    .replace(/\{\{\s*employee_name\s*\}\}/gi, name)
    .replace(/\{\s*employee_name\s*\}/gi, name)
    .replace(/\{employee_name\}/gi, name);
}

function isExitFormTask(task: { title?: string; requiresDocumentCategory?: string }) {
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
  if (title.includes("asset")) return "Upload proof";
  return "Upload";
}

export default function ExitPortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const [token, setToken] = useState("");
  const [ob, setOb] = useState<any>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    params.then((p) => setToken(p.token));
  }, [params]);

  const load = async (t: string) => {
    try {
      const data = await gqlFetch(EXIT_SESSION, { inviteToken: t });
      if (!data?.exitSession?.inviteValid) {
        setError("This exit link is invalid or expired.");
        setOb(null);
        return;
      }
      setOb(data.exitSession.offboarding);
      setError("");
    } catch (e: any) {
      setError(e.message || "Failed to load exit session");
    }
  };

  useEffect(() => {
    if (token) load(token);
  }, [token]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark");
    root.style.colorScheme = "light";
    return () => {
      // leave theme restoration to app preference on navigate away
    };
  }, []);

  const completeTask = async (taskId: string) => {
    setBusy(true);
    try {
      const data = await gqlFetch(COMPLETE_OFFBOARDING_TASK, {
        taskId,
        notes: "",
        inviteToken: token,
      });
      if (!data.completeOffboardingTask?.success) {
        throw new Error(data.completeOffboardingTask?.error || "Failed");
      }
      setMsg("Task marked complete");
      await load(token);
    } catch (e: any) {
      setMsg(e.message || "Could not complete task");
    } finally {
      setBusy(false);
    }
  };

  const uploadForTask = async (
    file: File,
    opts?: { category?: string; title?: string }
  ) => {
    const form = new FormData();
    form.append("file", file);
    form.append("exit_token", token);
    form.append("category", opts?.category || "exit_clearance");
    form.append("title", opts?.title || file.name);
    const res = await fetch("/api/documents/upload", {
      method: "POST",
      body: form,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Upload failed");
  };

  const ackSettlement = async () => {
    setBusy(true);
    try {
      const data = await gqlFetch(ACK_SETTLEMENT, { inviteToken: token });
      if (!data.acknowledgeFnfSettlement?.success) {
        throw new Error(data.acknowledgeFnfSettlement?.error || "Failed");
      }
      setMsg("Settlement acknowledged");
      await load(token);
    } catch (e: any) {
      setMsg(e.message || "Could not acknowledge");
    } finally {
      setBusy(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#f4f6f8] text-slate-900">
        <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center p-6">
          <h1 className="text-xl font-semibold text-slate-900">Exit portal</h1>
          <p className="mt-2 text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!ob) {
    return (
      <div className="min-h-screen bg-[#f4f6f8] text-slate-900">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <PageSkeleton />
        </div>
      </div>
    );
  }

  const employeeTasks = (ob.tasks || []).filter(
    (t: any) => t.assigneeRole === "employee"
  );
  const settlement = ob.settlement;
  const showSettlement =
    settlement &&
    ["hr_approved", "acknowledged", "paid"].includes(settlement.status);
  const userName = ob.userName || "";
  const statusKey = (ob.status || "").replace(/_/g, " ");
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
    : statusKey
      ? statusKey.replace(/\b\w/g, (c: string) => c.toUpperCase())
      : "In progress";

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-slate-900 antialiased">
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
        <header className="space-y-1">
          <p className="text-sm font-medium text-slate-500">Teamzen · Full & Final</p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Hi {userName.split(" ")[0] || "there"}
          </h1>
          <p className="text-sm text-slate-600">
            Complete clearance tasks, review your settlement, and download exit letters.
          </p>
        </header>

        {msg && (
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm">
            {msg}
          </div>
        )}

        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 text-slate-900 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-slate-900">Your checklist</h2>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                  isFullyComplete
                    ? "bg-emerald-100 text-emerald-800"
                    : ob.status === "settlement_pending"
                      ? "bg-amber-100 text-amber-900"
                      : ob.status === "letters_pending"
                        ? "bg-sky-100 text-sky-900"
                        : "bg-slate-100 text-slate-800"
                }`}
              >
                {statusLabel}
              </span>
              <span className="text-xs font-medium tabular-nums text-slate-600">
                {isFullyComplete
                  ? "100% complete"
                  : `Checklist ${checklistPct}%`}
              </span>
            </div>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-slate-900 transition-all"
              style={{
                width: `${isFullyComplete ? 100 : checklistPct}%`,
              }}
            />
          </div>
          <ul className="space-y-3">
            {employeeTasks.map((task: any) => (
              <li
                key={task.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/50 p-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                  <p className="text-xs capitalize text-slate-500">
                    {task.phase} · {task.status}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {isExitFormTask(task) &&
                    task.status !== "completed" &&
                    task.status !== "skipped" && (
                    <label className="cursor-pointer rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50">
                      {uploadLabel(task)}
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
                              (task.title || "").toLowerCase().includes("exit form") ||
                              (task.title || "").toLowerCase().includes("resignation");
                            await uploadForTask(f, {
                              category:
                                task.requiresDocumentCategory || "exit_clearance",
                              title: isForm
                                ? `Exit form — ${f.name}`
                                : f.name,
                            });
                            await completeTask(task.id);
                            setMsg(
                              isForm
                                ? "Exit form uploaded and task marked complete"
                                : "File uploaded and task marked complete"
                            );
                          } catch (err: any) {
                            setMsg(err.message);
                          } finally {
                            setBusy(false);
                          }
                        }}
                      />
                    </label>
                  )}
                  {task.status !== "completed" && task.status !== "skipped" && (
                    <Button
                      size="sm"
                      disabled={busy}
                      className="bg-slate-900 text-white hover:bg-slate-800"
                      onClick={() => completeTask(task.id)}
                    >
                      Mark done
                    </Button>
                  )}
                  {task.status === "completed" && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Done
                    </span>
                  )}
                </div>
              </li>
            ))}
            {employeeTasks.length === 0 && (
              <p className="text-sm text-slate-600">No employee tasks assigned.</p>
            )}
          </ul>
        </section>

        {showSettlement && (
          <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 text-slate-900 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">F&F settlement</h2>
            <dl className="grid grid-cols-2 gap-2 text-sm text-slate-700">
              <div>Pro-rata salary</div>
              <div className="text-right tabular-nums text-slate-900">
                {money(settlement.proRataSalary)}
              </div>
              <div>Leave encashment</div>
              <div className="text-right tabular-nums text-slate-900">
                {money(settlement.leaveEncashment)}
              </div>
              <div>Bonus / gratuity</div>
              <div className="text-right tabular-nums text-slate-900">
                {money(settlement.bonusGratuity)}
              </div>
              <div>Other additions</div>
              <div className="text-right tabular-nums text-slate-900">
                {money(settlement.otherAdditions)}
              </div>
              <div>Recoveries</div>
              <div className="text-right tabular-nums text-red-600">
                −{money(settlement.recoveries)}
              </div>
              <div>Other deductions</div>
              <div className="text-right tabular-nums text-red-600">
                −{money(settlement.otherDeductions)}
              </div>
              <div className="font-semibold text-slate-900">Net payable</div>
              <div className="text-right text-base font-semibold tabular-nums text-slate-900">
                {money(settlement.netPayable)}
              </div>
            </dl>
            {settlement.status === "hr_approved" && (
              <Button
                disabled={busy}
                className="bg-slate-900 text-white hover:bg-slate-800"
                onClick={ackSettlement}
              >
                Acknowledge settlement
              </Button>
            )}
            {settlement.status === "acknowledged" && (
              <p className="text-sm font-medium text-emerald-700">
                You acknowledged this settlement.
              </p>
            )}
          </section>
        )}

        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 text-slate-900 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Letters</h2>
          {(ob.letters || []).length === 0 && (
            <p className="text-sm text-slate-600">
              Experience and relieving letters will appear here once HR issues them.
            </p>
          )}
          {(ob.letters || []).map((letter: any) => (
            <div
              key={letter.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/50 p-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold capitalize text-slate-900">
                  {letter.letterType?.replace(/_/g, " ")}
                </p>
                <p className="text-xs text-slate-500">
                  {letterSubject(letter.subject, userName)}
                </p>
              </div>
              {(letter.downloadUrl || letter.pdfUrl) && (
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
                >
                  <a
                    href={letter.downloadUrl || letter.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                    Download
                  </a>
                </Button>
              )}
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
