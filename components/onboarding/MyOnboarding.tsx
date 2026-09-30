"use client";

import { useRef, useState, useEffect } from "react";
import moment from "moment";
import { ClipboardList, Upload, CheckCircle2, Trash2, Download, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FormSelect } from "@/components/common/FormSelect";
import {
  useMyAssignedOnboardingTasks,
  useMyOnboarding,
  useOnboardingEmployeeMutations,
} from "@/lib/graphql/onboarding/onboardingHook";
import {
  MyOnboardingTourButton,
  useMyOnboardingTour,
} from "@/components/onboarding/MyOnboardingTour";
import { useGraphQLUser, useGraphQLUpdateUser } from "@/lib/api/graphqlHooks";
import client from "@/lib/api/client";
import Image from "next/image";
import { OnboardingImages, EmptyImages } from "@/lib/brand-images";
import { EmptyState } from "@/components/common/EmptyState";
import ConfirmationModal from "@/components/common/ConfirmationModal";
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
  const [docToDelete, setDocToDelete] = useState<string | null>(null);

  const { user, refetch: refetchUser } = useGraphQLUser();
  const { updateUserAsync, isLoading: isUpdatingGraphQL } = useGraphQLUpdateUser();

  const [profile, setProfile] = useState({
    phone_number: "",
    pan_number: "",
    aadhar_number: "",
    bank_account_number: "",
    bank_ifsc_code: "",
  });

  useEffect(() => {
    if (user) {
      setProfile({
        phone_number: user.phoneNumber || "",
        pan_number: user.panNumber || "",
        aadhar_number: user.aadharNumber || "",
        bank_account_number: user.bankAccountNumber || "",
        bank_ifsc_code: user.bankIfscCode || "",
      });
    }
  }, [user]);

  async function saveProfile() {
    try {
      await updateUserAsync(profile);
      setMsg("Details saved successfully");
      refetchUser();
    } catch (e: any) {
      setMsg(e.message);
    }
  }
  const fileRef = useRef<HTMLInputElement>(null);
  const signedOfferRef = useRef<HTMLInputElement>(null);

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

  async function deleteDoc(docId: string) {
    try {
      const { data } = await client.post("graphql/", {
        query: `mutation DeleteEmployeeDocument($id: ID!) {
          deleteEmployeeDocument(documentId: $id) { success error }
        }`,
        variables: { id: docId }
      });
      if (data?.errors?.length) {
        throw new Error(data.errors[0].message);
      }
      if (!data?.data?.deleteEmployeeDocument?.success) {
        throw new Error(data?.data?.deleteEmployeeDocument?.error || "Failed to delete document");
      }
      setMsg("Document deleted");
      setDocToDelete(null);
      refetch();
    } catch (e: any) {
      setMsg(e.message);
      setDocToDelete(null);
    }
  }

  async function uploadSignedOffer(file: File) {
    const form = new FormData();
    form.append("file", file);
    form.append("mark_accepted", "true");
    if (onboarding?.id) form.append("onboarding_id", onboarding.id);
    if (acceptedName.trim()) form.append("accepted_name", acceptedName.trim());
    await client.post("onboarding/offers/signed/upload/", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setMsg("Signed offer letter uploaded");
    refetch();
  }

  if (isLoading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading onboarding">
        <div className="space-y-2">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="h-4 w-64 animate-pulse rounded bg-muted" />
        </div>
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-2 w-full animate-pulse rounded-full bg-muted" />
        </div>
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="h-5 w-32 animate-pulse rounded bg-muted" />
          <div className="h-40 w-full animate-pulse rounded-xl bg-muted" />
        </div>
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <div className="h-5 w-28 animate-pulse rounded bg-muted" />
          <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
          <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
          <div className="h-10 w-3/4 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    );
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
        <Card className="overflow-hidden p-0">
          <EmptyState
            src={EmptyImages.team}
            title="No active onboarding"
            description="Your checklist will appear here when HR starts your onboarding."
            size="wide"
          />
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
        eyebrow="Onboarding"
        title="My Onboarding"
        description={
          <span className="inline-flex flex-wrap items-center gap-2 mt-1">
            <span className={cn(
              "rounded-md px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wider",
              onboarding.status === "completed" ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20" :
              "bg-primary/10 text-primary border border-primary/20"
            )}>
              {onboarding.status.replace("_", " ")}
            </span>
            {onboarding.joinDate && (
              <span className="text-muted-foreground text-sm font-medium">· Join {formatJoinDate(onboarding.joinDate)}</span>
            )}
          </span>
        }
        actions={<MyOnboardingTourButton />}
      />

      <div className="relative aspect-[21/9] max-h-[250px] md:max-h-[300px] lg:max-h-[350px] w-full overflow-hidden rounded-2xl border border-border bg-[#e8eef4]">
        <Image
          src={
            Number(onboarding.progressPct) >= 100
              ? OnboardingImages.done
              : OnboardingImages.welcome
          }
          alt={
            Number(onboarding.progressPct) >= 100
              ? "Onboarding complete"
              : "Welcome to onboarding"
          }
          fill
          priority
          sizes="(max-width: 1280px) 100vw, 1280px"
          className="object-cover object-[center_30%]"
        />
        <div className="absolute inset-y-0 top-0 md:-top-8 lg:-top-25 xl:-top-40 left-0 w-1/2 flex flex-col justify-center px-4">
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-extrabold tracking-tight text-[#2d3748] mb-2 sm:mb-3 lg:mb-4">
            {Number(onboarding.progressPct) >= 100 ? "You're All Set!" : "Welcome Aboard!"}
          </h2>
          <p className="text-xs hidden md:block md:text-base lg:text-md font-medium text-[#4a5568] max-w-[60%] leading-relaxed">
            {Number(onboarding.progressPct) >= 100 
              ? "Your onboarding journey is complete. We're excited to have you on the team."
              : "We're thrilled to have you here. Let's get your onboarding tasks checked off so you can dive right in."}
          </p>
        </div>
      </div>

      {onboarding.status === "completed" && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-200">
          Onboarding complete your account is now verified.
        </div>
      )}

      {msg && (
        <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm">
          {msg}
        </div>
      )}

      <div id="my-onboarding-progress">
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
      </div>

      {onboarding.offerLetter && (
        <div id="my-onboarding-offer">
        <Card className="space-y-3 p-4">
          <p className="text-sm font-medium pb-2">{onboarding.offerLetter.subject}</p>
          <Separator />
          {onboarding.offerLetter.source === "uploaded" && (
            <p className="text-xs font-medium text-emerald-700">Official PDF uploaded by HR</p>
          )}
          {onboarding.offerLetter.pdfUrl && (
            <div className="overflow-hidden rounded-xl border border-border my-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border bg-muted/40 px-4 py-3">
                <p className="text-sm font-medium">Offer letter PDF</p>
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <Button asChild size="sm" variant="outline" className="h-8 flex-1 sm:flex-none">
                    <a
                      href={onboarding.offerLetter.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                      Open PDF
                    </a>
                  </Button>
                  <Button asChild size="sm" variant="default" className="h-8 flex-1 sm:flex-none">
                    <a
                      href={onboarding.offerLetter.pdfUrl}
                      download="Offer_Letter.pdf"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Download className="w-3.5 h-3.5 mr-1.5" />
                      Download
                    </a>
                  </Button>
                </div>
              </div>
              <iframe
                key={onboarding.offerLetter.pdfUrl + (onboarding.offerLetter.updatedAt || "")}
                title="Offer letter PDF"
                src={`${onboarding.offerLetter.pdfUrl}#toolbar=1&navpanes=0`}
                className="h-[min(60vh,520px)] w-full border-0 bg-muted"
              />
            </div>
          )}
          {onboarding.offerLetter.signedPdfUrl && (
            <a
              href={onboarding.offerLetter.signedPdfUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex text-sm text-emerald-700 underline"
            >
              View signed PDF
            </a>
          )}
          {onboarding.offerLetter.status !== "accepted" && (
            <>
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
            </>
          )}
          {onboarding.offerLetter.status === "accepted" && (
            <div className="flex items-center gap-3 px-4 py-2 my-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-400">Offer Accepted</p>
                <p className="text-xs text-emerald-700/80 dark:text-emerald-500/80">You have successfully accepted the offer letter.</p>
              </div>
            </div>
          )}
          {!onboarding.offerLetter.signedPdfUrl && (
            <div className="rounded-lg border border-dashed border-border p-3">
              <p className="mb-2 text-sm text-muted-foreground">
                Upload your signed offer letter (PDF)
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
                onClick={() => signedOfferRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload signed offer
              </Button>
            </div>
          )}
        </Card>
        </div>
      )}

      <div id="my-onboarding-details" className="mb-6">
        <Card className="p-4">
          <h3 className="font-semibold pb-2 border-b border-border/50 mb-4">Your Details</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                ["phone_number", "Phone Number"],
                ["pan_number", "PAN Number"],
                ["aadhar_number", "Aadhaar Number"],
                ["bank_account_number", "Bank Account Number"],
                ["bank_ifsc_code", "Bank IFSC Code"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="text-sm">
                <span className="mb-1.5 block font-medium text-muted-foreground">{label}</span>
                <Input
                  value={profile[key as keyof typeof profile]}
                  onChange={(e) => setProfile({ ...profile, [key]: e.target.value })}
                  placeholder={`Enter ${label.toLowerCase()}`}
                />
              </label>
            ))}
          </div>
          <Button
            type="button"
            className="mt-6"
            disabled={isUpdatingGraphQL}
            onClick={() => saveProfile()}
          >
            {isUpdatingGraphQL ? "Saving..." : "Save details"}
          </Button>
        </Card>
      </div>

      <div id="my-onboarding-docs">
      <Card className="space-y-3 p-4">
        <h3 className="font-semibold pb-2 border-b border-border/50 mb-3">Upload Documents</h3>
        <div className="flex flex-wrap gap-2">
          <FormSelect
            label=""
            value={category}
            onValueChange={setCategory}
            className="min-w-45"
            options={DOC_CATEGORIES.map((c) => ({ label: c, value: c }))}
          />
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
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm shadow-sm"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{d.fileName}</span>
                  <span className="text-xs text-muted-foreground">{d.category}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={d.verificationStatus === "verified" ? "default" : "secondary"}
                    className={
                      d.verificationStatus === "verified"
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                        : d.verificationStatus === "rejected"
                          ? "bg-rose-100 text-rose-800 hover:bg-rose-100 capitalize"
                          : "bg-amber-100 text-amber-800 hover:bg-amber-100 capitalize"
                    }
                  >
                    {d.verificationStatus.replace("_", " ")}
                  </Badge>
                  {d.rejectionReason && (
                    <span className="text-xs text-rose-600 max-w-[150px] truncate" title={d.rejectionReason}>
                      {d.rejectionReason}
                    </span>
                  )}
                  {d.verificationStatus !== "verified" && (
                    <button
                      type="button"
                      onClick={() => setDocToDelete(d.id)}
                      className="text-rose-600 transition-colors hover:text-rose-800"
                      title="Delete document"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </Card>
      </div>

      <div id="my-onboarding-checklist">
      <Card className="p-4">
        <h3 className="font-semibold pb-2 border-b border-border/50 mb-3">Your Checklist</h3>
        <div className="flex flex-col gap-3">
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
              className="flex flex-col gap-y-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-medium flex items-center gap-2">
                  {task.status === "completed" && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  )}
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    task.status === "completed" ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20" :
                    "bg-amber-500/10 text-amber-700 border border-amber-500/20"
                  )}>
                    {task.status}
                  </span>
                  {task.dueAt && (
                    <span className="text-xs text-muted-foreground font-medium">
                      due {formatJoinDate(task.dueAt)}
                    </span>
                  )}
                </div>
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
                  Mark Done
                </Button>
              )}
            </div>
          )
        )}
        </div>
      </Card>
      </div>

      {assigned.length > 0 && (
        <Card className="p-4 mt-6">
          <h3 className="font-semibold pb-2 border-b border-border/50 mb-3">Tasks assigned</h3>
          <div className="flex flex-col gap-3">
          {assigned?.map(
            (t: { id: string; title: string; status: string; dueAt?: string }) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium flex items-center gap-2">
                    {t.status === "completed" && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    )}
                    {t.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      t.status === "completed" ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20" :
                      "bg-amber-500/10 text-amber-700 border border-amber-500/20"
                    )}>
                      {t.status}
                    </span>
                    {t.dueAt && (
                      <span className="text-xs text-muted-foreground font-medium">
                        due {formatJoinDate(t.dueAt)}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={loading || t.status === "completed"}
                  onClick={async () => {
                    await completeTask({ variables: { taskId: t.id } });
                    refetch();
                  }}
                >
                  Mark Done
                </Button>
              </div>
            )
          )}
          </div>
        </Card>
      )}
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
