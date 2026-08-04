"use client";

import { use, useEffect, useRef, useState } from "react";
import { usePreboardingTour } from "@/components/onboarding/PreboardingTour";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormSelect } from "@/components/common/FormSelect";

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
const lightSelectClass =
  "bg-white text-slate-900 border-slate-300 hover:border-slate-400 focus:border-emerald-600";

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

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await gqlFetch<{ preboardingSession: OnboardingSession | null }>(
        PREBOARDING_QUERY,
        { inviteToken: token }
      );
      if (!data.preboardingSession) {
        setError("This invite link is invalid or expired.");
        setSession(null);
      } else {
        setSession(data.preboardingSession);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
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
      <div className="min-h-screen grid place-items-center bg-slate-50 text-slate-600">
        Loading your preboarding portal…
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
            <div>{session.joinDate ? `Join ${session.joinDate}` : ""}</div>
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
            <div
              className="prose prose-sm prose-slate mt-3 max-w-none rounded-lg border border-slate-200 bg-slate-50 p-4 text-slate-800 [&_a]:text-emerald-700 [&_a]:underline [&_p]:text-slate-800 [&_strong]:text-slate-900"
              dangerouslySetInnerHTML={{ __html: session.offerLetter.bodyHtml }}
            />
            {session.offerLetter.pdfUrl && (
              <a
                href={session.offerLetter.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-100"
              >
                Download offer letter PDF
              </a>
            )}
            {session.offerLetter.signedPdfUrl && (
              <a
                href={session.offerLetter.signedPdfUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 ml-2 inline-flex rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                View signed PDF
              </a>
            )}
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
          <div className="mb-3 flex flex-wrap gap-2">
            <FormSelect
              label="Document category"
              value={category}
              onValueChange={setCategory}
              className={`w-auto min-w-45 ${lightSelectClass}`}
              options={["id_proof", "pan", "aadhaar", "bank_proof", "education", "other"].map(
                (c) => ({
                  label: c,
                  value: c,
                })
              )}
            />
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
                  className="flex justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800"
                >
                  <span>{t.title}</span>
                  <span className="text-slate-600">{t.status}</span>
                </div>
              ))}
          </div>
        </section>
      </main>
    </div>
  );
}
