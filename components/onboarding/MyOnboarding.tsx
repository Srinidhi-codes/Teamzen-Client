"use client";

import { useRef, useState, useEffect, useMemo } from "react";
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

function getTaskDocumentCategory(task: any): string | null {
  if (task.requiresDocumentCategory && task.requiresDocumentCategory.trim()) {
    return task.requiresDocumentCategory.trim();
  }
  const t = (task.title || "").toLowerCase();
  if (t.includes("pan")) return "pan";
  if (t.includes("aadhaar") || t.includes("aadhar")) return "aadhaar";
  if (t.includes("id proof") || t.includes("photo id") || t.includes("identity")) return "id_proof";
  if (t.includes("bank proof") || t.includes("cancelled cheque") || t.includes("bank statement")) return "bank_proof";
  if (t.includes("education") || t.includes("degree") || t.includes("certificate")) return "education";
  if (t.includes("signed policy") || t.includes("handbook")) return "signed_policy";
  if (t.includes("upload") && t.includes("offer")) return "offer";
  if (t.includes("upload") || t.includes("document")) return "other";
  return null;
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
  const { completeTask, acceptOffer, loading } = useOnboardingEmployeeMutations();
  useMyOnboardingTour(!!onboarding);
  const [acceptedName, setAcceptedName] = useState("");
  const [category, setCategory] = useState("pan");
  const [msg, setMsg] = useState("");
  const [docToDelete, setDocToDelete] = useState<string | null>(null);
  const [uploadingCategory, setUploadingCategory] = useState<string | null>(null);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const taskFileInputRef = useRef<HTMLInputElement>(null);

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

  const isProfileDirty = useMemo(() => {
    if (!user) return false;
    return (
      (profile.phone_number || "").trim() !== (user.phoneNumber || "").trim() ||
      (profile.pan_number || "").trim() !== (user.panNumber || "").trim() ||
      (profile.aadhar_number || "").trim() !== (user.aadharNumber || "").trim() ||
      (profile.bank_account_number || "").trim() !== (user.bankAccountNumber || "").trim() ||
      (profile.bank_ifsc_code || "").trim() !== (user.bankIfscCode || "").trim()
    );
  }, [profile, user]);

  const isProfileFilled = Boolean(
    profile.phone_number?.trim() ||
    profile.pan_number?.trim() ||
    profile.aadhar_number?.trim() ||
    profile.bank_account_number?.trim() ||
    profile.bank_ifsc_code?.trim()
  );

  const hireTasks = useMemo(() => {
    return (onboarding?.tasks || []).filter(
      (t: { assigneeRole: string }) => t.assigneeRole === "hire"
    );
  }, [onboarding?.tasks]);

  async function saveProfile() {
    if (!isProfileDirty) return;
    try {
      await updateUserAsync(profile);
      setMsg("Details saved successfully");
      await refetchUser();

      const detailsTask = hireTasks.find(
        (t: any) =>
          (t.title?.toLowerCase().includes("personal") || t.title?.toLowerCase().includes("bank")) &&
          t.status !== "completed"
      );
      if (detailsTask) {
        await completeTask({ variables: { taskId: detailsTask.id } });
        refetch();
      }
    } catch (e: any) {
      setMsg(e.message);
    }
  }
  const fileRef = useRef<HTMLInputElement>(null);
  const signedOfferRef = useRef<HTMLInputElement>(null);

  const triggerUpload = (cat: string) => {
    setUploadingCategory(cat);
    taskFileInputRef.current?.click();
  };

  async function uploadDoc(file: File, cat?: string) {
    const targetCat = cat || uploadingCategory || category || "other";
    const form = new FormData();
    form.append("file", file);
    form.append("category", targetCat);
    form.append("title", file.name);
    if (onboarding?.id) form.append("onboarding_id", onboarding.id);
    await client.post("onboarding/documents/upload/", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setMsg(`Document "${file.name}" uploaded — awaiting HR verification`);
    await refetch();
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
      <div className="w-full space-y-6 animate-fade-in" aria-busy="true" aria-label="Loading onboarding">
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
      <div className="w-full text-destructive text-sm animate-fade-in">
        {(error as Error).message}
      </div>
    );
  }

  if (!onboarding) {
    return (
      <div className="w-full space-y-6 animate-fade-in pb-20">
        <PageHeader
          title="My Onboarding"
          description="Your checklist will appear here when HR starts your onboarding."
        />
        <EmptyState
          src={EmptyImages.team}
          title="No active onboarding"
          description="Your checklist will appear here when HR starts your onboarding."
          size="wide"
        />
      </div>
    );
  }



  return (
    <div className="w-full space-y-6 animate-fade-in pb-20">
      <PageHeader
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
            className="mt-6 cursor-pointer"
            disabled={isUpdatingGraphQL || !isProfileDirty}
            onClick={() => saveProfile()}
          >
            {isUpdatingGraphQL ? (
              "Saving..."
            ) : !isProfileDirty && isProfileFilled ? (
              <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Details Saved
              </span>
            ) : (
              "Save details"
            )}
          </Button>
        </Card>
      </div>

      <div id="my-onboarding-checklist">
        <Card className="p-4">
          <h3 className="font-semibold pb-2 border-b border-border/50 mb-3">Your Checklist</h3>
          
          <input
            ref={taskFileInputRef}
            type="file"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f && uploadingCategory) {
                try {
                  setIsUploadingDoc(true);
                  await uploadDoc(f, uploadingCategory);
                } catch (err: any) {
                  setMsg(err.message || "Failed to upload document");
                } finally {
                  setIsUploadingDoc(false);
                  setUploadingCategory(null);
                  if (taskFileInputRef.current) taskFileInputRef.current.value = "";
                }
              }
            }}
          />

          <div className="flex flex-col gap-3">
            {hireTasks.map((task: any) => {
              const docCategory = getTaskDocumentCategory(task);
              const matchingDoc = docCategory
                ? (onboarding.documents || []).find(
                    (d: any) =>
                      d.category?.toLowerCase() === docCategory.toLowerCase() ||
                      (d.title && task.title && d.title.toLowerCase().includes(docCategory.toLowerCase()))
                  )
                : null;

              const isDocApproved =
                matchingDoc?.verificationStatus === "approved" ||
                matchingDoc?.verificationStatus === "verified";
              const isDocRejected = matchingDoc?.verificationStatus === "rejected";
              const isDocUnderReview = matchingDoc && !isDocApproved && !isDocRejected;

              const isTaskCompleted = task.status === "completed" || isDocApproved;

              return (
                <div
                  key={task.id}
                  className={cn(
                    "flex flex-col gap-y-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between transition-all",
                    isDocRejected
                      ? "border-rose-300 bg-rose-50/40 dark:border-rose-900/40 dark:bg-rose-950/20"
                      : isTaskCompleted
                      ? "border-border bg-card/60"
                      : "border-border bg-card"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold flex items-center gap-2">
                      {isTaskCompleted && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      )}
                      <span>{task.title}</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          isTaskCompleted
                            ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20"
                            : isDocRejected
                            ? "bg-rose-500/10 text-rose-700 border border-rose-500/20"
                            : isDocUnderReview
                            ? "bg-amber-500/10 text-amber-700 border border-amber-500/20"
                            : "bg-muted text-muted-foreground border border-border"
                        )}
                      >
                        {isTaskCompleted
                          ? "Completed"
                          : isDocRejected
                          ? "Action Required"
                          : isDocUnderReview
                          ? "Under Review"
                          : task.status}
                      </span>
                      {task.dueAt && (
                        <span className="text-xs text-muted-foreground font-medium">
                          due {formatJoinDate(task.dueAt)}
                        </span>
                      )}
                    </div>

                    {matchingDoc && (
                      <div className="mt-2 text-xs flex flex-wrap items-center gap-2">
                        <span className="text-muted-foreground">Attached:</span>
                        <span className="font-medium text-foreground bg-muted/60 px-2 py-0.5 rounded-md truncate max-w-[200px] sm:max-w-[280px]">
                          {matchingDoc.fileName}
                        </span>
                        {matchingDoc.fileUrl && (
                          <a
                            href={matchingDoc.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary hover:underline inline-flex items-center gap-1 font-medium"
                          >
                            View <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    )}

                    {isDocRejected && matchingDoc?.rejectionReason && (
                      <p className="text-xs text-rose-600 dark:text-rose-400 mt-1.5 font-medium">
                        Rejection reason: {matchingDoc.rejectionReason}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                    {docCategory ? (
                      isDocApproved ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-500/10 border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approved
                        </span>
                      ) : isDocRejected || isDocUnderReview ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isUploadingDoc}
                          onClick={() => triggerUpload(docCategory)}
                          className={cn(
                            "h-8 text-xs font-semibold cursor-pointer",
                            isDocRejected
                              ? "border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300"
                              : ""
                          )}
                        >
                          <Upload className="w-3.5 h-3.5 mr-1.5" />
                          {isUploadingDoc && uploadingCategory === docCategory ? "Uploading..." : "Reupload"}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="default"
                          disabled={isUploadingDoc}
                          onClick={() => triggerUpload(docCategory)}
                          className="h-8 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5 mr-1.5" />
                          {isUploadingDoc && uploadingCategory === docCategory ? "Uploading..." : "Upload"}
                        </Button>
                      )
                    ) : !isTaskCompleted && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={loading}
                        onClick={async () => {
                          await completeTask({ variables: { taskId: task.id } });
                          refetch();
                        }}
                        className="h-8 text-xs font-semibold cursor-pointer"
                      >
                        Mark Done
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
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
