"use client";

import { use, useEffect, useRef, useState } from "react";
import moment from "moment";
import { usePreboardingTour } from "@/components/onboarding/PreboardingTour";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Check, AlertCircle, Loader2 } from "lucide-react";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { OnboardingImages } from "@/lib/brand-images";
import { ThemeSelector } from "@/components/common/ThemeSelector";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function formatJoinDate(value?: string | Date | null) {
  if (value == null || value === "") return "";
  if (typeof value === "string") {
    const day = value.trim().match(/^(\d{4}-\d{2}-\d{2})/);
    if (day) {
      const m = moment(day[1], "YYYY-MM-DD", true);
      if (m.isValid()) return m.format("DD MMM YYYY");
    }
  }
  const m = moment(value);
  return m.isValid() ? m.format("DD MMM YYYY") : String(value);
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
      organizationName
      organizationLogo
      organizationAccent
      phoneNumber
      panNumber
      aadharNumber
      bankAccountNumber
      bankIfscCode
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
  organizationName?: string;
  organizationLogo?: string;
  organizationAccent?: string;
  phoneNumber?: string;
  panNumber?: string;
  aadharNumber?: string;
  bankAccountNumber?: string;
  bankIfscCode?: string;
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

interface AccentTheme {
  primary: string;
  hover: string;
  lightBg: string;
  border: string;
  textClass: string;
  darkText: string;
}

const ACCENT_THEMES: Record<string, AccentTheme> = {
  teal: {
    primary: "#38ABB1",
    hover: "#2d8b90",
    lightBg: "rgba(56, 171, 177, 0.12)",
    border: "rgba(56, 171, 177, 0.35)",
    textClass: "text-[#38ABB1] dark:text-[#4cd1d7]",
    darkText: "#4cd1d7",
  },
  blue: {
    primary: "#2563eb",
    hover: "#1d4ed8",
    lightBg: "rgba(37, 99, 235, 0.12)",
    border: "rgba(37, 99, 235, 0.35)",
    textClass: "text-blue-600 dark:text-blue-400",
    darkText: "#60a5fa",
  },
  indigo: {
    primary: "#4f46e5",
    hover: "#4338ca",
    lightBg: "rgba(79, 70, 229, 0.12)",
    border: "rgba(79, 70, 229, 0.35)",
    textClass: "text-indigo-600 dark:text-indigo-400",
    darkText: "#818cf8",
  },
  purple: {
    primary: "#9333ea",
    hover: "#7e22ce",
    lightBg: "rgba(147, 51, 234, 0.12)",
    border: "rgba(147, 51, 234, 0.35)",
    textClass: "text-purple-600 dark:text-purple-400",
    darkText: "#c084fc",
  },
  green: {
    primary: "#16a34a",
    hover: "#15803d",
    lightBg: "rgba(22, 163, 74, 0.12)",
    border: "rgba(22, 163, 74, 0.35)",
    textClass: "text-emerald-600 dark:text-emerald-400",
    darkText: "#4ade80",
  },
  orange: {
    primary: "#ea580c",
    hover: "#c2410c",
    lightBg: "rgba(234, 88, 12, 0.12)",
    border: "rgba(234, 88, 12, 0.35)",
    textClass: "text-orange-600 dark:text-orange-400",
    darkText: "#fb923c",
  },
  red: {
    primary: "#dc2626",
    hover: "#b91c1c",
    lightBg: "rgba(220, 38, 38, 0.12)",
    border: "rgba(220, 38, 38, 0.35)",
    textClass: "text-rose-600 dark:text-rose-400",
    darkText: "#f87171",
  },
  slate: {
    primary: "#475569",
    hover: "#334155",
    lightBg: "rgba(71, 85, 105, 0.12)",
    border: "rgba(71, 85, 105, 0.35)",
    textClass: "text-slate-600 dark:text-slate-400",
    darkText: "#94a3b8",
  },
};

function getAccentTheme(accent?: string | null): AccentTheme {
  const key = (accent || "teal").toLowerCase();
  return ACCENT_THEMES[key] || ACCENT_THEMES.teal;
}

const DOC_CATEGORIES = [
  { value: "id_proof", label: "ID Proof (Passport / Voter ID)" },
  { value: "pan", label: "PAN Card" },
  { value: "aadhaar", label: "Aadhaar Card" },
  { value: "bank_proof", label: "Bank Proof (Cheque / Passbook)" },
  { value: "education", label: "Educational Degree / Certificate" },
  { value: "other", label: "Other Document" },
];

type ProfileFieldKey = "phoneNumber" | "panNumber" | "aadharNumber" | "bankAccountNumber" | "bankIfscCode";

const VALIDATION_RULES: Record<
  ProfileFieldKey,
  {
    validate: (val: string) => boolean;
    message: string;
    format: (raw: string) => string;
    placeholder: string;
    hint: string;
    label: string;
  }
> = {
  phoneNumber: {
    label: "Phone",
    placeholder: "10-digit mobile number",
    hint: "10 digits (e.g. 9876543210)",
    format: (raw) => raw.replace(/\D/g, "").slice(0, 10),
    validate: (val) => !val || /^[6-9]\d{9}$/.test(val),
    message: "Must be a 10-digit mobile number starting with 6, 7, 8, or 9",
  },
  panNumber: {
    label: "PAN",
    placeholder: "e.g. ABCDE1234F",
    hint: "10 characters (e.g. ABCDE1234F)",
    format: (raw) => raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10),
    validate: (val) => !val || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val),
    message: "PAN must be 10 characters: 5 letters, 4 numbers, 1 letter",
  },
  aadharNumber: {
    label: "Aadhaar",
    placeholder: "12-digit Aadhaar number",
    hint: "12 digits",
    format: (raw) => raw.replace(/\D/g, "").slice(0, 12),
    validate: (val) => !val || /^\d{12}$/.test(val),
    message: "Aadhaar must be exactly 12 digits",
  },
  bankAccountNumber: {
    label: "Bank account",
    placeholder: "9 to 18-digit account number",
    hint: "9 to 18 digits",
    format: (raw) => raw.replace(/\D/g, "").slice(0, 18),
    validate: (val) => !val || /^\d{9,18}$/.test(val),
    message: "Bank account number must be between 9 and 18 digits",
  },
  bankIfscCode: {
    label: "IFSC",
    placeholder: "11 characters (e.g. HDFC0001234)",
    hint: "11 characters (e.g. HDFC0001234)",
    format: (raw) => raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 11),
    validate: (val) => !val || /^[A-Z]{4}0[A-Z0-9]{6}$/.test(val),
    message: "IFSC code must be 11 characters (e.g. HDFC0001234)",
  },
};

const PROFILE_FIELD_KEYS: ProfileFieldKey[] = [
  "phoneNumber",
  "panNumber",
  "aadharNumber",
  "bankAccountNumber",
  "bankIfscCode",
];

async function gqlFetch<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch("/api/graphql/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    throw new Error(`API error (${res.status}) - The server might be unreachable.`);
  }
  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(json.errors[0].message || "GraphQL error");
  }
  if (!json.data) {
    throw new Error("Invalid GraphQL response");
  }
  return json.data;
}

const cardClass =
  "rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs text-slate-900 dark:text-slate-100 transition-colors";

const inputClass =
  "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 hover:border-slate-400 dark:hover:border-slate-600 focus:border-[#38ABB1] focus:ring-[#38ABB1]/20";

const outlineBtnClass =
  "border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs";

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
  const [docToDelete, setDocToDelete] = useState<string | null>(null);
  const [acceptedName, setAcceptedName] = useState("");
  const [category, setCategory] = useState("pan");
  const [savingProfile, setSavingProfile] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<ProfileFieldKey, string>>>({});

  const [profile, setProfile] = useState<Record<ProfileFieldKey, string>>({
    phoneNumber: "",
    panNumber: "",
    aadharNumber: "",
    bankAccountNumber: "",
    bankIfscCode: "",
  });

  const fileRef = useRef<HTMLInputElement>(null);
  const signedOfferRef = useRef<HTMLInputElement>(null);

  // Compute theme dynamically based on organization accent set in admin (default 'teal' -> #38ABB1)
  const theme = getAccentTheme(session?.organizationAccent);

  // Synchronize document data-accent for complete consistency
  useEffect(() => {
    if (typeof window !== "undefined") {
      const activeAccent = session?.organizationAccent || "teal";
      document.documentElement.setAttribute("data-accent", activeAccent);
    }
  }, [session?.organizationAccent]);

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
        const s = data.preboardingSession;
        setSession(s);
        setProfile({
          phoneNumber: s.phoneNumber || "",
          panNumber: s.panNumber || "",
          aadharNumber: s.aadharNumber || "",
          bankAccountNumber: s.bankAccountNumber || "",
          bankIfscCode: s.bankIfscCode || "",
        });
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
    if (!res.ok) {
      throw new Error(`API error (${res.status}) - The server might be unreachable.`);
    }
    const json = await res.json();
    if (json.errors?.length) throw new Error(json.errors[0].message);
    if (!json.data) throw new Error("Invalid GraphQL response");
    return json.data;
  }

  const handleFieldChange = (key: ProfileFieldKey, rawVal: string) => {
    const rule = VALIDATION_RULES[key];
    const formatted = rule.format(rawVal);
    setProfile((prev) => ({ ...prev, [key]: formatted }));

    if (formatted && !rule.validate(formatted)) {
      setFieldErrors((prev) => ({ ...prev, [key]: rule.message }));
    } else {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleFieldBlur = (key: ProfileFieldKey) => {
    const rule = VALIDATION_RULES[key];
    const val = profile[key];
    if (val && !rule.validate(val)) {
      setFieldErrors((prev) => ({ ...prev, [key]: rule.message }));
    }
  };

  async function saveProfile() {
    const errors: Partial<Record<ProfileFieldKey, string>> = {};
    for (const key of PROFILE_FIELD_KEYS) {
      const val = profile[key];
      const rule = VALIDATION_RULES[key];
      if (val && !rule.validate(val)) {
        errors[key] = rule.message;
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("Please fix the highlighted errors before saving.");
      return;
    }

    const hasAnyValue = Object.values(profile).some((v) => v.trim() !== "");
    if (!hasAnyValue) {
      toast.error("Please enter at least one detail before saving.");
      return;
    }

    setSavingProfile(true);
    try {
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
      toast.success("Profile details saved successfully!");
      setMsg("Profile details saved successfully.");
      await load({ silent: true });
    } catch (err: any) {
      toast.error(err.message || "Failed to save details");
    } finally {
      setSavingProfile(false);
    }
  }

  async function acceptOffer() {
    await mutate(
      `mutation AcceptOfferLetter($input: AcceptOfferInput!) {
        acceptOfferLetter(input: $input) { id offerLetter { status } }
      }`,
      { input: { inviteToken: token, acceptedName } }
    );
    toast.success("Offer accepted — thank you!");
    setMsg("Offer accepted — thank you!");
    load();
  }

  async function uploadDoc(file: File) {
    const form = new FormData();
    form.append("file", file);
    form.append("category", category);
    form.append("title", file.name);
    form.append("invite_token", token);
    const res = await fetch("/api/onboarding/documents/upload", {
      method: "POST",
      body: form,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Upload failed");
    toast.success(`Uploaded ${json.file_name}`);
    setMsg(`Uploaded ${json.file_name} (${json.category})`);
    load();
  }

  async function deleteDoc(docId: string) {
    try {
      const data = await mutate(
        `mutation DeletePreboardingDocument($input: DeletePreboardingDocumentInput!) {
          deletePreboardingDocument(input: $input) { success error }
        }`,
        { input: { inviteToken: token, documentId: docId } }
      );
      if (!data.deletePreboardingDocument.success) {
        throw new Error(data.deletePreboardingDocument.error || "Failed to delete document");
      }
      toast.success("Document deleted");
      setMsg("Document deleted");
      setDocToDelete(null);
      load();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete document");
      setMsg(e.message);
      setDocToDelete(null);
    }
  }

  async function uploadSignedOffer(file: File) {
    const form = new FormData();
    form.append("file", file);
    form.append("invite_token", token);
    form.append("mark_accepted", "true");
    if (acceptedName.trim()) form.append("accepted_name", acceptedName.trim());
    const res = await fetch("/api/onboarding/offers/signed/upload", {
      method: "POST",
      body: form,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Signed offer upload failed");
    toast.success("Signed offer letter uploaded");
    setMsg("Signed offer letter uploaded");
    load();
  }

  if (loading) {
    return (
      <div
        className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
        aria-busy="true"
        aria-label="Loading preboarding portal"
      >
        <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
              <div className="space-y-1.5">
                <div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-3 w-20 animate-pulse rounded bg-slate-100 dark:bg-slate-850" />
              </div>
            </div>
            <div className="space-y-2 text-right">
              <div className="ml-auto h-3 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="ml-auto h-3 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <div className="mb-4 h-4 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-16 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                  <div className="h-9 w-full animate-pulse rounded-md bg-slate-100 dark:bg-slate-800" />
                </div>
              ))}
            </div>
            <div className="mt-4 h-9 w-28 animate-pulse rounded-md bg-[#38ABB1]/20" />
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <div className="mb-3 h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-40 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            <div className="mt-4 h-9 w-36 animate-pulse rounded-md bg-slate-100 dark:bg-slate-800" />
          </div>
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Loading your preboarding portal…
          </p>
        </main>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 dark:bg-slate-950 p-6">
        <div className="max-w-md rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-white dark:bg-slate-900 p-8 text-center shadow-xs">
          <h1 className="text-xl font-semibold text-rose-700 dark:text-rose-400">Invite unavailable</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* ========================================================
          STICKY BRANDED HEADER WITH COMPANY NAME & LOGO
         ======================================================== */}
      <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors shadow-xs">
        <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Organization Logo & Name */}
          <div className="flex items-center gap-3">
            {session.organizationLogo ? (
              <div className="flex h-11 min-w-11 max-w-[130px] items-center justify-center overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 p-1.5 shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={session.organizationLogo}
                  alt={session.organizationName || "Company logo"}
                  className="h-8 w-auto max-w-full object-contain"
                />
              </div>
            ) : (
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border p-2 shadow-xs transition-colors"
                style={{
                  borderColor: theme.border,
                  backgroundColor: theme.lightBg,
                }}
              >
                <Image
                  src="/images/teamzen_zoomed.webp"
                  alt={session.organizationName || "Teamzen"}
                  width={32}
                  height={32}
                  className="h-7 w-7 object-contain"
                  priority
                />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  {session.organizationName || "Teamzen"}
                </h1>
                <span
                  className="rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider border shadow-xs"
                  style={{
                    backgroundColor: theme.lightBg,
                    color: theme.primary,
                    borderColor: theme.border,
                  }}
                >
                  Preboarding
                </span>
              </div>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                Candidate Portal • <span className="font-medium text-slate-700 dark:text-slate-300">{session.userName}</span>
              </p>
            </div>
          </div>

          {/* Progress Bar & Theme Toggle */}
          <div className="flex items-center gap-4">
            <div className="w-full sm:w-52 space-y-1 sm:text-right text-sm">
              <div className="flex items-center justify-between sm:justify-end gap-2">
                <span
                  className="text-xs font-bold tabular-nums"
                  style={{ color: theme.primary }}
                >
                  {session.progressPct}% complete
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${session.progressPct}%`,
                    backgroundColor: theme.primary,
                  }}
                />
              </div>
              {session.joinDate && (
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Target join:{" "}
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {formatJoinDate(session.joinDate)}
                  </span>
                </div>
              )}
            </div>
            <ThemeSelector />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        {/* ========================================================
            WELCOME HERO BANNER WITH BRANDING & HIGH CONTRAST TYPOGRAPHY
           ======================================================== */}
        <div className="relative aspect-[21/9] min-h-[190px] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-xs">
          <Image
            src={OnboardingImages.preboarding}
            alt="Welcome to preboarding"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 896px"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent dark:from-slate-950/95 dark:via-slate-950/80 dark:to-transparent" />
          <div className="absolute inset-y-0 left-0 flex w-full max-w-[90%] sm:max-w-[70%] flex-col justify-center px-4 sm:px-8 md:px-10 z-10">
            <div
              className="mb-2 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-md border shadow-xs"
              style={{
                backgroundColor: theme.lightBg,
                borderColor: theme.border,
                color: theme.primary,
              }}
            >
              <span className="font-bold">{session.organizationName || "Teamzen"}</span>
              <span className="opacity-40">•</span>
              <span>New Hire Journey</span>
            </div>
            <h2 className="mb-1.5 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white drop-shadow-xs">
              Welcome aboard, {session.userName.split(" ")[0]}!
            </h2>
            <p className="text-xs sm:text-sm md:text-base font-semibold leading-relaxed text-slate-900 dark:text-slate-100 drop-shadow-xs">
              We&apos;re thrilled to have you join {session.organizationName || "the team"}.
              <br className="hidden sm:inline" />
              {" "}Please complete your preboarding checklist below before your first day.
            </p>
          </div>
        </div>

        {msg && (
          <div
            className="rounded-xl border px-4 py-3 text-sm font-medium shadow-xs transition-colors"
            style={{
              backgroundColor: theme.lightBg,
              borderColor: theme.border,
              color: theme.primary,
            }}
          >
            {msg}
          </div>
        )}

        {/* ========================================================
            YOUR DETAILS SECTION (WITH VALIDATION & DYNAMIC BUTTON)
           ======================================================== */}
        <section id="preboarding-details" className={cardClass}>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Your details</h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Required for payroll &amp; verification
            </span>
          </div>
          <hr className="mb-4 mt-2 border-slate-200 dark:border-slate-800" />
          
          <div className="grid gap-4 sm:grid-cols-2">
            {PROFILE_FIELD_KEYS.map((key) => {
              const rule = VALIDATION_RULES[key];
              const value = profile[key];
              const errorMsg = fieldErrors[key];
              const isValidAndFilled = !!value && rule.validate(value);
              const isInvalid = !!errorMsg;

              return (
                <div key={key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label htmlFor={`field-${key}`} className="font-semibold text-slate-800 dark:text-slate-200">
                      {rule.label}
                    </label>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {rule.hint}
                    </span>
                  </div>
                  <div className="relative">
                    <Input
                      id={`field-${key}`}
                      value={value}
                      placeholder={rule.placeholder}
                      onChange={(e) => handleFieldChange(key, e.target.value)}
                      onBlur={() => handleFieldBlur(key)}
                      className={cn(
                        inputClass,
                        "pr-9 transition-colors",
                        isInvalid && "border-rose-500 dark:border-rose-500 focus-visible:ring-rose-500/20 focus-visible:border-rose-500",
                        isValidAndFilled && "border-[#38ABB1] dark:border-[#38ABB1] focus-visible:ring-[#38ABB1]/20"
                      )}
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      {isInvalid && (
                        <AlertCircle className="h-4 w-4 text-rose-500" />
                      )}
                      {!isInvalid && isValidAndFilled && (
                        <Check className="h-4 w-4" style={{ color: theme.primary }} />
                      )}
                    </div>
                  </div>
                  {isInvalid ? (
                    <p className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      <span>{errorMsg}</span>
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Format: {rule.hint}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              disabled={savingProfile}
              onClick={saveProfile}
              className="text-white font-semibold shadow-xs transition-all active:scale-[0.99] disabled:opacity-50"
              style={{
                backgroundColor: theme.primary,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.hover)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.primary)}
            >
              {savingProfile ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving details...
                </>
              ) : (
                "Save details"
              )}
            </Button>
          </div>
        </section>

        {/* ========================================================
            OFFER LETTER SECTION
           ======================================================== */}
        {session.offerLetter && (
          <section id="preboarding-offer" className={cardClass}>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Offer letter</h2>
            <hr className="mb-4 mt-2 border-slate-200 dark:border-slate-800" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {session.offerLetter.subject}
            </p>
            {session.offerLetter.source === "uploaded" && (
              <p className="mt-1 text-xs font-semibold" style={{ color: theme.primary }}>
                Official PDF uploaded by HR
              </p>
            )}

            {session.offerLetter.pdfUrl ? (
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Offer letter PDF</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
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
                      className="inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-semibold text-white shadow-xs transition-all active:scale-[0.99]"
                      style={{
                        backgroundColor: theme.primary,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.hover)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.primary)}
                    >
                      Open PDF
                    </a>
                    <a
                      href={session.offerLetter.pdfUrl}
                      download="Offer_Letter.pdf"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-9 items-center justify-center rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs"
                    >
                      Download PDF
                    </a>
                  </div>
                </div>
                <div className="bg-slate-100 dark:bg-slate-900">
                  <iframe
                    key={session.offerLetter.pdfUrl + (session.offerLetter.updatedAt || "")}
                    title="Offer letter PDF"
                    src={`${session.offerLetter.pdfUrl}#toolbar=1&navpanes=0`}
                    className="h-[min(70vh,640px)] w-full border-0"
                  />
                  <p className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs text-slate-500 dark:text-slate-400">
                    If the preview doesn&apos;t load in your browser, use Open PDF or Download PDF.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
                Official PDF is not available yet. You can still review the offer text below.
              </div>
            )}

            {session.offerLetter.signedPdfUrl && (
              <a
                href={session.offerLetter.signedPdfUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                View signed PDF
              </a>
            )}

            <details className="mt-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 open:pb-0">
              <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-200 marker:content-none [&::-webkit-details-marker]:hidden">
                View offer text summary
              </summary>
              <div
                className="prose prose-sm prose-slate dark:prose-invert max-w-none border-t border-slate-200 dark:border-slate-800 px-4 py-3 text-slate-800 dark:text-slate-200"
                dangerouslySetInnerHTML={{ __html: session.offerLetter.bodyHtml }}
              />
            </details>

            {session.offerLetter.status !== "accepted" ? (
              <div className="mt-4 space-y-3">
                <div className="flex flex-wrap items-end gap-2">
                  <Input
                    className={cn("max-w-xs", inputClass)}
                    placeholder="Type full name to accept"
                    value={acceptedName}
                    onChange={(e) => setAcceptedName(e.target.value)}
                  />
                  <Button
                    type="button"
                    disabled={acceptedName.trim().toLowerCase() !== session.userName.toLowerCase()}
                    onClick={() => acceptOffer().catch((e) => setMsg(e.message))}
                    className="text-white font-semibold disabled:opacity-50 transition-all active:scale-[0.99]"
                    style={{
                      backgroundColor: theme.primary,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.hover)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.primary)}
                  >
                    Accept offer
                  </Button>
                </div>
                <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 p-3.5">
                  <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
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
                    className={outlineBtnClass}
                    onClick={() => signedOfferRef.current?.click()}
                  >
                    Upload signed offer PDF
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-semibold" style={{ color: theme.primary }}>
                  Offer accepted.
                </p>
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
                      className={outlineBtnClass}
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

        {/* ========================================================
            UPLOAD DOCUMENTS SECTION (WITH PROPER THEMED CATEGORIES)
           ======================================================== */}
        <section id="preboarding-docs" className={cardClass}>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Upload documents</h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {session.documents.length} uploaded
            </span>
          </div>
          <hr className="mb-4 mt-2 border-slate-200 dark:border-slate-800" />
          
          <div className="mb-4 flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Document category
              </span>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[220px] sm:w-[260px] bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-700 shadow-xs">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
                  {DOC_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value} className="cursor-pointer">
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  uploadDoc(f).catch((err) => {
                    toast.error(err.message || "Upload failed");
                    setMsg(err.message);
                  });
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              className={outlineBtnClass}
              onClick={() => fileRef.current?.click()}
            >
              Choose file
            </Button>
          </div>

          <div className="space-y-2.5">
            {session.documents.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No documents uploaded yet. Please select a category and upload required documents.
                </p>
              </div>
            ) : (
              session.documents.map((d) => {
                const catObj = DOC_CATEGORIES.find((c) => c.value === d.category);
                const categoryLabel = catObj ? catObj.label : d.category;
                const isVerified = d.verificationStatus === "verified";
                const isRejected = d.verificationStatus === "rejected";

                return (
                  <div
                    key={d.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-3 sm:px-4 text-sm shadow-xs transition-colors"
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {d.fileName}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {categoryLabel}
                      </span>
                      {d.rejectionReason && (
                        <span className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">
                          Reason: {d.rejectionReason}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <Badge
                        variant="outline"
                        style={
                          isVerified
                            ? {
                                backgroundColor: theme.lightBg,
                                borderColor: theme.border,
                                color: theme.primary,
                              }
                            : undefined
                        }
                        className={
                          isVerified
                            ? "font-semibold capitalize shadow-xs"
                            : isRejected
                              ? "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800 capitalize font-medium"
                              : "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 capitalize font-medium"
                        }
                      >
                        {d.verificationStatus.replace("_", " ")}
                      </Badge>
                      {d.verificationStatus !== "verified" && (
                        <button
                          type="button"
                          onClick={() => setDocToDelete(d.id)}
                          className="rounded p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                          title="Delete document"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* ========================================================
            CHECKLIST SECTION
           ======================================================== */}
        <section id="preboarding-checklist" className={cardClass}>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Checklist</h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {session.tasks.filter((t) => t.assigneeRole === "hire").length} tasks
            </span>
          </div>
          <hr className="mb-4 mt-2 border-slate-200 dark:border-slate-800" />
          <div className="space-y-2">
            {session.tasks
              .filter((t) => t.assigneeRole === "hire")
              .map((t) => {
                const isCompleted = t.status === "completed";
                return (
                  <div
                    key={t.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-3 sm:px-4 text-sm shadow-xs transition-colors"
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{t.title}</span>
                      {t.dueAt && (
                        <span className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          Due {formatJoinDate(t.dueAt)}
                        </span>
                      )}
                    </div>
                    <Badge
                      variant="outline"
                      style={
                        isCompleted
                          ? {
                              backgroundColor: theme.lightBg,
                              borderColor: theme.border,
                              color: theme.primary,
                            }
                          : undefined
                      }
                      className={
                        isCompleted
                          ? "font-semibold capitalize shadow-xs"
                          : "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 capitalize font-medium"
                      }
                    >
                      {t.status.replace("_", " ")}
                    </Badge>
                  </div>
                );
              })}
          </div>
        </section>
      </main>

      <ConfirmationModal
        isOpen={!!docToDelete}
        onClose={() => setDocToDelete(null)}
        onConfirm={() => {
          if (docToDelete) deleteDoc(docToDelete);
        }}
        title="Delete Document"
        description="Are you sure you want to delete this document? This action cannot be undone."
        variant="destructive"
        confirmText="Delete"
      />
    </div>
  );
}
