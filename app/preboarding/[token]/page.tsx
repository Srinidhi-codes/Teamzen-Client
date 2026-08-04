"use client";

import { use, useEffect, useRef, useState } from "react";
import { usePreboardingTour } from "@/components/onboarding/PreboardingTour";

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
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-slate-50">
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
          <div className="text-right text-sm text-slate-500">
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

        <section
          id="preboarding-details"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h2 className="mb-3 font-semibold text-slate-900">Your details</h2>
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
              <label key={key} className="text-sm">
                <span className="mb-1 block text-slate-500">{label}</span>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  value={profile[key]}
                  onChange={(e) => setProfile({ ...profile, [key]: e.target.value })}
                />
              </label>
            ))}
          </div>
          <button
            type="button"
            onClick={() => saveProfile().catch((e) => setError(e.message))}
            className="mt-4 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white"
          >
            Save details
          </button>
        </section>

        {session.offerLetter && (
          <section
            id="preboarding-offer"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="mb-2 font-semibold">Offer letter</h2>
            <p className="text-sm font-medium text-slate-700">
              {session.offerLetter.subject}
            </p>
            <div
              className="prose prose-sm mt-3 max-w-none rounded-lg border border-slate-100 bg-slate-50 p-3"
              dangerouslySetInnerHTML={{ __html: session.offerLetter.bodyHtml }}
            />
            {session.offerLetter.status !== "accepted" ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <input
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Type full name to accept"
                  value={acceptedName}
                  onChange={(e) => setAcceptedName(e.target.value)}
                />
                <button
                  type="button"
                  disabled={acceptedName.trim().length < 2}
                  onClick={() => acceptOffer().catch((e) => setMsg(e.message))}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  Accept offer
                </button>
              </div>
            ) : (
              <p className="mt-3 text-sm text-emerald-700">Offer accepted.</p>
            )}
          </section>
        )}

        <section
          id="preboarding-docs"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h2 className="mb-3 font-semibold">Upload documents</h2>
          <div className="mb-3 flex flex-wrap gap-2">
            <select
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {["id_proof", "pan", "aadhaar", "bank_proof", "education", "other"].map(
                (c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                )
              )}
            </select>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadDoc(f).catch((err) => setMsg(err.message));
              }}
            />
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
              onClick={() => fileRef.current?.click()}
            >
              Choose file
            </button>
          </div>
          <div className="space-y-2">
            {session.documents.map((d) => (
              <div
                key={d.id}
                className="flex justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm"
              >
                <span>
                  {d.category} · {d.fileName}
                </span>
                <span className="text-slate-500">{d.verificationStatus}</span>
              </div>
            ))}
          </div>
        </section>

        <section
          id="preboarding-checklist"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h2 className="mb-3 font-semibold">Checklist</h2>
          <div className="space-y-2">
            {session.tasks
              .filter((t) => t.assigneeRole === "hire")
              .map((t) => (
                <div
                  key={t.id}
                  className="flex justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm"
                >
                  <span>{t.title}</span>
                  <span className="text-slate-500">{t.status}</span>
                </div>
              ))}
          </div>
        </section>
      </main>
    </div>
  );
}
