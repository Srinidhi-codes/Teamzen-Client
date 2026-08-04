"use client";

import { use, useEffect, useRef, useState } from "react";
import moment from "moment";
import { usePreboardingTour } from "@/components/onboarding/PreboardingTour";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function formatJoinDate(value?: string | null) {
  if (!value) return "";
  const m = moment(value);
  return m.isValid() ? m.format("DD MMM YYYY") : value;
}

const PREBOARDING_QUERY = `
  query PreboardingSession($inviteToken: String!) {
    preboardingSession(inviteToken: $inviteToken) {
      id
      status
      progressPct
      joinDate
      userName
      userEmail
      departmentName
      designationName
      tasks {
        id
        title
        description
        assigneeRole
        phase
        status
        dueAt
        requiresDocumentCategory
      }
      documents {
        id
        category
        title
        fileName
        fileUrl
        verificationStatus
        rejectionReason
      }
      offerLetter {
        id
        subject
        bodyHtml
        pdfUrl
        signedPdfUrl
        signedUploadedAt
        status
        acceptedAt
        source
        updatedAt
      }
    }
  }
`;

type OnboardingSession = {
  id: string;
  status: string;
  progressPct: number;
  joinDate?: string;
  userName: string;
  userEmail: string;
  departmentName?: string;
  designationName?: string;
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    phase: string;
    assigneeRole: string;
    dueAt?: string;
    requiresDocumentCategory?: string;
  }>;
  documents: Array<{
    id: string;
    category: string;
    fileName: string;
    verificationStatus: string;
    rejectionReason?: string;
  }>;
  offerLetter?: {
    id: string;
    subject: string;
    bodyHtml: string;
    pdfUrl?: string;
    signedPdfUrl?: string;
    signedUploadedAt?: string;
    status: string;
    source?: string;
    updatedAt?: string;
  } | null;
};

async function gqlFetch<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch("/api/graphql/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(json.errors[0].message || "GraphQL error");
  }
  return json.data;
}

const cardClass =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-slate-900";

/** Explicit light styles — theme tokens (bg-background) break on this public page. */
const lightInputClass =
  "bg-white text-slate-900 border-slate-300 placeholder:text-slate-400 hover:border-slate-400 focus:border-emerald-600 focus:ring-emerald-600/20";
const lightPrimaryBtnClass =
  "bg-emerald-700 text-white hover:bg-emerald-800 disabled:bg-emerald-700/50 disabled:text-white";
const lightOutlineBtnClass =
  "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 hover:text-slate-900";
const lightNativeSelectClass =
  "h-10 min-w-45 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 outline-none hover:border-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20";

export default function PreboardingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  usePreboardingTour(token);
  const [session, setSession] = useState<OnboardingSession | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [acceptedName, setAcceptedName] = useState("");
  const [category, setCategory] = useState("pan");
  const [profile, setProfile] = useState({
    phoneNumber: "",
    panNumber: "",
    aadharNumber: "",
    bankAccountNumber: "",
    bankIfscCode: "",
  });
  const fileRef = useRef<HTMLInputElement>(null);
  const signedOfferRef = useRef<HTMLInputElement>(null);

  // Soft refresh — don't flash full-page loading on poll/focus
  async function load(opts?: { silent?: boolean }) {
    if (!opts?.silent) {
      setLoading(true);
      setError("");
    }
    try {
      const data = await gqlFetch<{ preboardingSession: OnboardingSession | null }>(
        PREBOARDING_QUERY,
        { inviteToken: token }
      );
      if (!data.preboardingSession) {
        if (!opts?.silent) {
          setError("This invite link is invalid or expired.");
          setSession(null);
        }
      } else {
        setSession(data.preboardingSession);
      }
    } catch (e) {
      if (!opts?.silent) {
        setError(e instanceof Error ? e.message : "Failed to load");
      }
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  }

  useEffect(() => {
    // Public portal should stay light even if the app theme is dark.
    const root = document.documentElement;
    const hadDark = root.classList.contains("dark");
    root.classList.remove("dark");
    root.style.colorScheme = "light";
    return () => {
      if (hadDark) {
        root.classList.add("dark");
        root.style.colorScheme = "dark";
      }
    };
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") load({ silent: true });
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    const poll = window.setInterval(refresh, 20000);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
      window.clearInterval(poll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function mutate(mutation: string, variables: Record<string, unknown>) {
    const res = await fetch("/api/graphql/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: mutation, variables }),
    });
    const json = await res.json();
    if (json.errors?.length) throw new Error(json.errors[0].message);
    return json.data;
  }

  async function saveProfile() {
    await mutate(
      `mutation UpdatePreboardingProfile($input: UpdatePreboardingProfileInput!) {
        updatePreboardingProfile(input: $input) { id progressPct }
      }`,
      {
        input: {
          inviteToken: token,
          phoneNumber: profile.phoneNumber || null,
          panNumber: profile.panNumber || null,
          aadharNumber: profile.aadharNumber || null,
          bankAccountNumber: profile.bankAccountNumber || null,
          bankIfscCode: profile.bankIfscCode || null,
        },
      }
    );
    setMsg("Profile saved");
    load();
  }

  async function acceptOffer() {
    await mutate(
      `mutation AcceptOfferLetter($input: AcceptOfferInput!) {
        acceptOfferLetter(input: $input) { id offerLetter { status } }
      }`,
      { input: { inviteToken: token, acceptedName } }
    );
    setMsg("Offer accepted — thank you!");
    load();
  }

  async function uploadDoc(file: File) {
    const form = new FormData();
    form.append("file", file);
    form.append("category", category);
    form.append("title", file.name);
    form.append("invite_token", token);
    const res = await fetch("/api/onboarding/documents/upload/", {
      method: "POST",
      body: form,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Upload failed");
    setMsg(`Uploaded ${json.file_name} (${json.category})`);
    load();
  }

  async function uploadSignedOffer(file: File) {
    const form = new FormData();
    form.append("file", file);
    form.append("invite_token", token);
    form.append("mark_accepted", "true");
    if (acceptedName.trim()) form.append("accepted_name", acceptedName.trim());
    const res = await fetch("/api/onboarding/offers/signed/upload/", {
      method: "POST",
      body: form,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Signed offer upload failed");
    setMsg("Signed offer letter uploaded");
    load();
  }

  if (loading) {
    return (
      <div
        className="min-h-screen bg-linear-to-b from-emerald-50 to-slate-50"
        aria-busy="true"
        aria-label="Loading preboarding portal"
      >
        <header className="border-b border-emerald-100 bg-white/80">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
            <div className="space-y-2">
              <div className="h-3 w-20 animate-pulse rounded bg-emerald-100" />
              <div className="h-5 w-48 animate-pulse rounded bg-slate-200" />
            </div>
            <div className="space-y-2 text-right">
              <div className="ml-auto h-3 w-24 animate-pulse rounded bg-slate-200" />
              <div className="ml-auto h-3 w-28 animate-pulse rounded bg-slate-200" />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 h-4 w-28 animate-pulse rounded bg-slate-200" />
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-16 animate-pulse rounded bg-slate-100" />
                  <div className="h-9 w-full animate-pulse rounded-md bg-slate-100" />
                </div>
              ))}
            </div>
            <div className="mt-4 h-9 w-28 animate-pulse rounded-md bg-emerald-100" />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 h-4 w-24 animate-pulse rounded bg-slate-200" />
            <div className="h-40 w-full animate-pulse rounded-xl bg-slate-100" />
            <div className="mt-4 h-9 w-36 animate-pulse rounded-md bg-slate-100" />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 h-4 w-32 animate-pulse rounded bg-slate-200" />
            <div className="space-y-2">
              <div className="h-10 w-full animate-pulse rounded-lg bg-slate-100" />
              <div className="h-10 w-full animate-pulse rounded-lg bg-slate-100" />
              <div className="h-10 w-3/4 animate-pulse rounded-lg bg-slate-100" />
            </div>
          </div>
          <p className="text-center text-sm text-slate-500">
            Loading your preboarding portal…
          </p>
        </main>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 p-6">
        <div className="max-w-md rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-rose-700">Invite unavailable</h1>
          <p className="mt-2 text-sm text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-emerald-50 to-slate-50 text-slate-900">
      <header className="border-b border-emerald-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Preboarding
            </p>
            <h1 className="text-lg font-semibold text-slate-900">
              Welcome, {session.userName}
            </h1>
          </div>
          <div className="text-right text-sm text-slate-600">
            <div>{session.progressPct}% complete</div>
            <div>
              {session.joinDate
                ? `Join ${formatJoinDate(session.joinDate)}`
                : ""}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        {msg && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            {msg}
          </div>
        )}

        <section id="preboarding-details" className={cardClass}>
          <h2 className="mb-3 text-base font-semibold text-slate-900">Your details</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ["phoneNumber", "Phone"],
                ["panNumber", "PAN"],
                ["aadharNumber", "Aadhaar"],
                ["bankAccountNumber", "Bank account"],
                ["bankIfscCode", "IFSC"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="text-sm text-slate-900">
                <span className="mb-1 block text-slate-600">{label}</span>
                <Input
                  className={lightInputClass}
                  value={profile[key]}
                  onChange={(e) => setProfile({ ...profile, [key]: e.target.value })}
                />
              </label>
            ))}
          </div>
          <Button
            type="button"
            onClick={() => saveProfile().catch((e) => setError(e.message))}
            className={`mt-4 ${lightPrimaryBtnClass}`}
          >
            Save details
          </Button>
        </section>

        {session.offerLetter && (
          <section id="preboarding-offer" className={cardClass}>
            <h2 className="mb-2 text-base font-semibold text-slate-900">Offer letter</h2>
            <p className="text-sm font-medium text-slate-800">
              {session.offerLetter.subject}
            </p>
            {session.offerLetter.source === "uploaded" && (
              <p className="mt-1 text-xs font-medium text-emerald-700">
                Official PDF uploaded by HR
              </p>
            )}

            {session.offerLetter.pdfUrl ? (
              <div className="mt-4 overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50/60">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-200 bg-white/80 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Offer letter PDF</p>
                    <p className="text-xs text-slate-600">
                      Review the official PDF, then accept below.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={
                        session.offerLetter.updatedAt
                          ? `${session.offerLetter.pdfUrl}${session.offerLetter.pdfUrl.includes("?") ? "&" : "?"}v=${encodeURIComponent(session.offerLetter.updatedAt)}`
                          : session.offerLetter.pdfUrl
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-9 items-center justify-center rounded-md bg-emerald-700 px-4 text-sm font-medium text-white hover:bg-emerald-800"
                    >
                      Open PDF
                    </a>
                    <a
                      href={session.offerLetter.pdfUrl}
                      download="Offer_Letter.pdf"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-9 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-800 hover:bg-slate-50"
                    >
                      Download PDF
                    </a>
                  </div>
                </div>
                <div className="bg-slate-100">
                  <iframe
                    key={session.offerLetter.pdfUrl + (session.offerLetter.updatedAt || "")}
                    title="Offer letter PDF"
                    src={`${session.offerLetter.pdfUrl}#toolbar=1&navpanes=0`}
                    className="h-[min(70vh,640px)] w-full border-0"
                  />
                  <p className="border-t border-slate-200 bg-white px-4 py-2 text-xs text-slate-500">
                    If the preview doesn&apos;t load in your browser, use Open PDF or Download PDF.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Official PDF is not available yet. You can still review the offer text below.
              </div>
            )}

            {session.offerLetter.signedPdfUrl && (
              <a
                href={session.offerLetter.signedPdfUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                View signed PDF
              </a>
            )}

            <details className="mt-4 rounded-lg border border-slate-200 bg-slate-50 open:pb-0">
              <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-slate-800 marker:content-none [&::-webkit-details-marker]:hidden">
                View offer text summary
              </summary>
              <div
                className="prose prose-sm prose-slate max-w-none border-t border-slate-200 px-4 py-3 text-slate-800 [&_a]:text-emerald-700 [&_a]:underline [&_p]:text-slate-800 [&_strong]:text-slate-900"
                dangerouslySetInnerHTML={{ __html: session.offerLetter.bodyHtml }}
              />
            </details>

            {session.offerLetter.status !== "accepted" ? (
              <div className="mt-4 space-y-3">
                <div className="flex flex-wrap items-end gap-2">
                  <Input
                    className={`max-w-xs ${lightInputClass}`}
                    placeholder="Type full name to accept"
                    value={acceptedName}
                    onChange={(e) => setAcceptedName(e.target.value)}
                  />
                  <Button
                    type="button"
                    disabled={acceptedName.trim().length < 2}
                    onClick={() => acceptOffer().catch((e) => setMsg(e.message))}
                    className={lightPrimaryBtnClass}
                  >
                    Accept offer
                  </Button>
                </div>
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3">
                  <p className="mb-2 text-sm text-slate-700">
                    Or upload your signed offer letter (PDF)
                  </p>
                  <input
                    ref={signedOfferRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadSignedOffer(f).catch((err) => setMsg(err.message));
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className={lightOutlineBtnClass}
                    onClick={() => signedOfferRef.current?.click()}
                  >
                    Upload signed offer PDF
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-medium text-emerald-700">Offer accepted.</p>
                {!session.offerLetter.signedPdfUrl && (
                  <div>
                    <input
                      ref={signedOfferRef}
                      type="file"
                      accept="application/pdf,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadSignedOffer(f).catch((err) => setMsg(err.message));
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className={lightOutlineBtnClass}
                      onClick={() => signedOfferRef.current?.click()}
                    >
                      Upload signed offer PDF
                    </Button>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        <section id="preboarding-docs" className={cardClass}>
          <h2 className="mb-3 text-base font-semibold text-slate-900">Upload documents</h2>
          <div className="mb-3 flex flex-wrap items-end gap-2">
            <label className="text-sm text-slate-900">
              <span className="mb-1 block text-slate-600">Document category</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={lightNativeSelectClass}
              >
                {["id_proof", "pan", "aadhaar", "bank_proof", "education", "other"].map(
                  (c) => (
                    <option key={c} value={c} className="bg-white text-slate-900">
                      {c}
                    </option>
                  )
                )}
              </select>
            </label>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadDoc(f).catch((err) => setMsg(err.message));
              }}
            />
            <Button
              type="button"
              variant="outline"
              className={lightOutlineBtnClass}
              onClick={() => fileRef.current?.click()}
            >
              Choose file
            </Button>
          </div>
          <div className="space-y-2">
            {session.documents.map((d) => (
              <div
                key={d.id}
                className="flex justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800"
              >
                <span>
                  {d.category} · {d.fileName}
                </span>
                <span className="text-slate-600">{d.verificationStatus}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="preboarding-checklist" className={cardClass}>
          <h2 className="mb-3 text-base font-semibold text-slate-900">Checklist</h2>
          <div className="space-y-2">
            {session.tasks
              .filter((t) => t.assigneeRole === "hire")
              .map((t) => (
                <div
                  key={t.id}
                  className="flex justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800"
                >
                  <span>
                    {t.title}
                    {t.dueAt ? (
                      <span className="mt-0.5 block text-xs text-slate-500">
                        Due {formatJoinDate(t.dueAt)}
                      </span>
                    ) : null}
                  </span>
                  <span className="shrink-0 text-slate-600">{t.status}</span>
                </div>
              ))}
          </div>
        </section>
      </main>
    </div>
  );
}
