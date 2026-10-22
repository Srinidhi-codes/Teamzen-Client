"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Download,
  FileText,
  Upload,
  FolderOpen,
  FileCheck,
  AlertCircle,
  Send,
  UploadCloud,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  Sparkles,
  ExternalLink,
  Search,
  Filter,
  PlusCircle,
  ShieldCheck,
  Building,
  ChevronRight,
  FileSpreadsheet,
  Check,
  X,
  Loader,
} from "lucide-react";
import { toast } from "sonner";
import moment from "moment";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMyDocuments } from "@/lib/graphql/documents/documentsHook";
import { cn } from "@/lib/utils";
import { CREATE_EMPLOYEE_DOCUMENT_REQUEST } from "@/lib/graphql/documents/mutations";
import { useMutation } from "@apollo/client/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PageSkeleton } from "@/components/common/PageSkeleton";
import { Pagination } from "@/components/common/Pagination";

type Tab = "issued" | "requests" | "employeeRequests" | "uploads";

const DOCUMENT_CATEGORIES = [
  { value: "bonafide", label: "Bonafide Certificate", desc: "For bank accounts, university, or residence verification" },
  { value: "visa", label: "Visa Support Letter", desc: "Official travel clearance and employment status" },
  { value: "address_proof", label: "Address Proof Letter", desc: "For passport, rental agreements, or gas connections" },
  { value: "experience", label: "Experience Letter", desc: "Summary of tenure, role, and official responsibilities" },
  { value: "salary_certificate", label: "Salary Certificate", desc: "Official remuneration proof for loans and credit cards" },
  { value: "other", label: "Other / Custom Letter", desc: "Specify any other corporate document or letter" },
];

async function uploadForRequest(requestId: string, file: File) {
  const form = new FormData();
  form.append("file", file);
  form.append("request_id", requestId);
  const res = await fetch("/api/documents/upload", {
    method: "POST",
    body: form,
    credentials: "include",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data;
}

export default function DocumentsVault() {
  const { issued, requests, employeeRequests, uploads, loading, refetch } = useMyDocuments();
  const [tab, setTab] = useState<Tab>("issued");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  // Request Document Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [reqCategory, setReqCategory] = useState("bonafide");
  const [reqTitle, setReqTitle] = useState("");
  const [reqReason, setReqReason] = useState("");

  const [createReq, { loading: creating }] = useMutation<{
    createEmployeeDocumentRequest: { success: boolean; error?: string | null; id?: string | null };
  }>(CREATE_EMPLOYEE_DOCUMENT_REQUEST);

  const handleRequestDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reqCategory === "other" && !reqTitle.trim()) {
      toast.error("Please enter a custom document title");
      return;
    }
    try {
      const res = await createReq({
        variables: {
          input: {
            category: reqCategory,
            customTitle: reqCategory === "other" ? reqTitle.trim() : "",
            reason: reqReason.trim(),
          },
        },
      });
      if (res.data?.createEmployeeDocumentRequest?.error) {
        throw new Error(res.data.createEmployeeDocumentRequest.error);
      }
      toast.success("Document request submitted to HR!");
      setModalOpen(false);
      setReqCategory("bonafide");
      setReqTitle("");
      setReqReason("");
      setTab("employeeRequests");
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Failed to submit document request");
    }
  };

  const onUpload = async (requestId: string, file?: File | null) => {
    if (!file) return;
    setUploadingId(requestId);
    try {
      await uploadForRequest(requestId, file);
      toast.success("Document uploaded and submitted to HR!");
      await refetch();
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploadingId(null);
    }
  };

  const openRequests = requests.filter((r: any) => r.status === "open");
  const pendingEmpRequests = employeeRequests.filter((r: any) => r.status === "pending");

  // Filtered Issued Docs
  const filteredIssued = useMemo(() => {
    return issued.filter((doc: any) => {
      const matchCat = categoryFilter === "all" || doc.category === categoryFilter;
      const matchSearch =
        !searchQuery ||
        (doc.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.category || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.financialYear || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [issued, categoryFilter, searchQuery]);
  const [issuedPage, setIssuedPage] = useState(1);
  const [requestsPage, setRequestsPage] = useState(1);
  const [empRequestsPage, setEmpRequestsPage] = useState(1);
  const [uploadsPage, setUploadsPage] = useState(1);

  const ISSUED_PAGE_SIZE = 8;
  const REQS_PAGE_SIZE = 6;
  const EMP_REQS_PAGE_SIZE = 6;
  const UPLOADS_PAGE_SIZE = 9;

  useEffect(() => {
    setIssuedPage(1);
  }, [categoryFilter, searchQuery]);

  const totalIssuedPages = Math.ceil(filteredIssued.length / ISSUED_PAGE_SIZE);
  const paginatedIssued = useMemo(() => {
    const start = (issuedPage - 1) * ISSUED_PAGE_SIZE;
    return filteredIssued.slice(start, start + ISSUED_PAGE_SIZE);
  }, [filteredIssued, issuedPage]);

  const totalRequestsPages = Math.ceil(requests.length / REQS_PAGE_SIZE);
  const paginatedRequests = useMemo(() => {
    const start = (requestsPage - 1) * REQS_PAGE_SIZE;
    return requests.slice(start, start + REQS_PAGE_SIZE);
  }, [requests, requestsPage]);

  const totalEmpRequestsPages = Math.ceil(employeeRequests.length / EMP_REQS_PAGE_SIZE);
  const paginatedEmpRequests = useMemo(() => {
    const start = (empRequestsPage - 1) * EMP_REQS_PAGE_SIZE;
    return employeeRequests.slice(start, start + EMP_REQS_PAGE_SIZE);
  }, [employeeRequests, empRequestsPage]);

  const totalUploadsPages = Math.ceil(uploads.length / UPLOADS_PAGE_SIZE);
  const paginatedUploads = useMemo(() => {
    const start = (uploadsPage - 1) * UPLOADS_PAGE_SIZE;
    return uploads.slice(start, start + UPLOADS_PAGE_SIZE);
  }, [uploads, uploadsPage]);

  return (
    <div className="w-full space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <PageHeader
        eyebrow="DOCUMENT VAULT & COMPLIANCE"
        title="Documents & Certificates"
        description="Download Form 16 tax summaries and official company certificates, fulfill HR upload requests, and store verified credentials."
        actions={
          <Button
            size="sm"
            onClick={() => setModalOpen(true)}
            className="gap-2 text-xs font-semibold cursor-pointer shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Request Document</span>
          </Button>
        }
      />

      {/* KPI Stats Overview Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {/* KPI 1 */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Official Issued</span>
            <FileCheck className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{issued.length}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Form 16 &amp; letters</p>
        </div>

        {/* KPI 2 */}
        <div
          className={cn(
            "rounded-2xl border p-4 shadow-xs transition-colors",
            openRequests.length > 0
              ? "border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400"
              : "border-border bg-card text-muted-foreground"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Action Required</span>
            <AlertCircle className={cn("h-4 w-4", openRequests.length > 0 ? "text-amber-500" : "text-muted-foreground/60")} />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{openRequests.length}</p>
          <p className="mt-0.5 text-[11px]">
            {openRequests.length > 0 ? "Uploads requested by HR" : "No pending uploads"}
          </p>
        </div>

        {/* KPI 3 */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">My Requests</span>
            <Send className="h-4 w-4 text-sky-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{employeeRequests.length}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {pendingEmpRequests.length > 0 ? `${pendingEmpRequests.length} pending review` : "All fulfilled"}
          </p>
        </div>

        {/* KPI 4 */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Vault Uploads</span>
            <UploadCloud className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{uploads.length}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Verified credentials</p>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-muted/40 rounded-2xl border border-border/80">
        {[
          { key: "issued" as const, label: "Issued Documents", icon: FileCheck, count: issued.length },
          { key: "requests" as const, label: "Action Required", icon: AlertCircle, count: openRequests.length, highlight: openRequests.length > 0 },
          { key: "employeeRequests" as const, label: "My Requests to HR", icon: Send, count: employeeRequests.length },
          { key: "uploads" as const, label: "My Vault Uploads", icon: UploadCloud, count: uploads.length },
        ].map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap",
                active
                  ? "bg-background text-foreground shadow-xs font-bold border border-border/40"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className={cn("w-3.5 h-3.5", active ? "text-primary" : "text-muted-foreground")} />
              <span>{t.label}</span>
              {t.count > 0 && (
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                    t.highlight
                      ? "bg-amber-500 text-white animate-pulse"
                      : active
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="py-2">
          <PageSkeleton variant="inline" />
        </div>
      )}

      {/* TAB 1: ISSUED DOCUMENTS */}
      {tab === "issued" && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl border border-border bg-card shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search issued documents, letters, or FY..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl bg-background"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {["all", "form_16", "letter", "salary_certificate", "bonafide"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap",
                    categoryFilter === cat
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "bg-muted/60 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {cat === "all" ? "All" : cat.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>

          {filteredIssued.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center text-muted-foreground border border-dashed border-border rounded-2xl bg-card/50 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">No issued documents found</h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Official TRACES Form 16 PDFs, appointment letters, and certificates will appear here once published by HR.
                </p>
              </div>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {paginatedIssued.map((doc: any) => {
              const isForm16 = doc.category?.includes("form") || doc.category?.includes("16");
              return (
                <div
                  key={doc.id}
                  className="rounded-2xl border border-border bg-card p-4 shadow-xs hover:border-primary/40 hover:shadow-sm transition-all flex flex-col justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                        isForm16
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : "bg-primary/10 text-primary border-primary/20"
                      )}
                    >
                      {isForm16 ? <FileSpreadsheet className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                          {doc.category?.replace(/_/g, " ")}
                        </span>
                        {doc.financialYear && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                            FY {doc.financialYear}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-foreground mt-1.5 truncate group-hover:text-primary transition-colors">
                        {doc.title}
                      </h4>

                      {doc.notes && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{doc.notes}</p>
                      )}

                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-2 font-mono">
                        <Calendar className="w-3 h-3 text-muted-foreground/70" />
                        <span>Published {moment(doc.publishedAt || doc.createdAt).format("MMM D, YYYY")}</span>
                      </div>
                    </div>
                  </div>

                  {doc.downloadUrl && (
                    <div className="pt-2 border-t border-border/60 flex items-center justify-end">
                      <Button asChild size="sm" variant="outline" className="h-8 gap-1.5 text-xs font-semibold cursor-pointer">
                        <a href={doc.downloadUrl} target="_blank" rel="noreferrer">
                          <Download className="h-3.5 w-3.5 text-primary" />
                          <span>Download PDF</span>
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {totalIssuedPages > 1 && (
            <Pagination
              currentPage={issuedPage}
              totalPages={totalIssuedPages}
              onPageChange={setIssuedPage}
              total={filteredIssued.length}
              pageSize={ISSUED_PAGE_SIZE}
              label="documents"
            />
          )}
        </div>
      )}

      {/* TAB 2: ACTION REQUIRED (HR DOCUMENT REQUESTS) */}
      {tab === "requests" && (
        <div className="space-y-4">
          {requests.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center text-muted-foreground border border-dashed border-border rounded-2xl bg-card/50 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">No pending requests</h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  You are fully compliant! There are no documents requested by your HR department at this time.
                </p>
              </div>
            </div>
          )}

          <div className="grid gap-3">
            {paginatedRequests.map((req: any) => {
              const isFulfilled = req.status === "fulfilled";
              const isUploading = uploadingId === req.id;
              const isOverdue = req.dueAt && moment(req.dueAt).isBefore(moment(), "day") && !isFulfilled;

              return (
                <div
                  key={req.id}
                  className={cn(
                    "rounded-2xl border p-5 shadow-xs transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4",
                    isFulfilled
                      ? "bg-card border-border/80"
                      : isOverdue
                      ? "bg-rose-500/[0.03] border-rose-500/30"
                      : "bg-card border-amber-500/30 shadow-sm"
                  )}
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                        {req.category?.replace(/_/g, " ")}
                      </span>

                      {isFulfilled ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                          <Check className="w-3 h-3" />
                          Fulfilled
                        </span>
                      ) : (
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border",
                            isOverdue
                              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                          )}
                        >
                          <Clock className="w-3 h-3" />
                          {isOverdue ? "Overdue" : "Pending Upload"}
                        </span>
                      )}

                      {req.dueAt && (
                        <span className="text-[11px] text-muted-foreground font-mono">
                          Due: {moment(req.dueAt).format("MMM D, YYYY")}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-foreground">{req.title}</h4>
                    {req.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed">{req.description}</p>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-2 w-full md:w-auto justify-end">
                    {isFulfilled ? (
                      req.fileUrl && (
                        <Button asChild size="sm" variant="outline" className="h-8 gap-1.5 text-xs font-semibold">
                          <a href={req.fileUrl} target="_blank" rel="noreferrer">
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span>View Submitted Document</span>
                          </a>
                        </Button>
                      )
                    ) : (
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          className="hidden"
                          disabled={isUploading}
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            onUpload(req.id, f);
                          }}
                        />
                        <Button
                          asChild
                          size="sm"
                          disabled={isUploading}
                          className="h-8 gap-2 text-xs font-semibold shadow-xs"
                        >
                          <span>
                            {isUploading ? (
                              <>
                                <Loader className="w-3.5 h-3.5 animate-spin" />
                                <span>Uploading...</span>
                              </>
                            ) : (
                              <>
                                <UploadCloud className="w-3.5 h-3.5" />
                                <span>Upload File</span>
                              </>
                            )}
                          </span>
                        </Button>
                      </label>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {totalRequestsPages > 1 && (
            <Pagination
              currentPage={requestsPage}
              totalPages={totalRequestsPages}
              onPageChange={setRequestsPage}
              total={requests.length}
              pageSize={REQS_PAGE_SIZE}
              label="requirements"
            />
          )}
        </div>
      )}

      {/* TAB 3: MY REQUESTS TO HR */}
      {tab === "employeeRequests" && (
        <div className="space-y-4">
          {employeeRequests.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center text-muted-foreground border border-dashed border-border rounded-2xl bg-card/50 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">No requests submitted</h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Need an official letter for visa, address proof, or bonafide? Click &quot;Request Document&quot; above to ask HR.
                </p>
              </div>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {paginatedEmpRequests.map((req: any) => {
              const isIssued = req.status === "issued";
              const isRejected = req.status === "rejected";

              return (
                <div
                  key={req.id}
                  className="rounded-2xl border border-border bg-card p-4 shadow-xs flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                        {req.category?.replace(/_/g, " ")}
                      </span>

                      {isIssued ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                          <Check className="w-3 h-3" />
                          Issued &amp; Ready
                        </span>
                      ) : isRejected ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25">
                          <XCircle className="w-3 h-3" />
                          Declined
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                          <Clock className="w-3 h-3" />
                          Pending Review
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-foreground">
                      {req.category === "other" && req.customTitle ? req.customTitle : req.category?.replace(/_/g, " ")}
                    </h4>

                    {req.reason && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        Reason: {req.reason}
                      </p>
                    )}

                    {isRejected && req.rejectedReason && (
                      <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-2.5 text-xs text-rose-600 dark:text-rose-400">
                        <span className="font-bold block">HR Note:</span>
                        {req.rejectedReason}
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
                      <Clock className="w-3 h-3 text-muted-foreground/70" />
                      <span>Requested {moment(req.createdAt).fromNow()}</span>
                    </div>
                  </div>

                  {isIssued && req.issuedDocumentUrl && (
                    <div className="pt-2 border-t border-border/60 flex items-center justify-end">
                      <Button asChild size="sm" className="h-8 gap-1.5 text-xs font-semibold shadow-xs">
                        <a href={req.issuedDocumentUrl} target="_blank" rel="noreferrer">
                          <Download className="h-3.5 w-3.5" />
                          <span>Download Certificate</span>
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {totalEmpRequestsPages > 1 && (
            <Pagination
              currentPage={empRequestsPage}
              totalPages={totalEmpRequestsPages}
              onPageChange={setEmpRequestsPage}
              total={employeeRequests.length}
              pageSize={EMP_REQS_PAGE_SIZE}
              label="requests"
            />
          )}
        </div>
      )}

      {/* TAB 4: MY VAULT UPLOADS */}
      {tab === "uploads" && (
        <div className="space-y-4">
          {uploads.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center text-muted-foreground border border-dashed border-border rounded-2xl bg-card/50 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">No uploads in vault</h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Documents you upload during onboarding or for HR compliance requests will be cataloged here.
                </p>
              </div>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedUploads.map((doc: any) => {
              const isVerified = doc.verificationStatus === "approved" || doc.verificationStatus === "verified";
              const isRejected = doc.verificationStatus === "rejected";

              return (
                <div
                  key={doc.id}
                  className="rounded-2xl border border-border bg-card p-4 shadow-xs flex flex-col justify-between gap-3 hover:border-primary/40 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                        {doc.category?.replace(/_/g, " ")}
                      </span>

                      {isVerified ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                          <ShieldCheck className="w-3 h-3" />
                          Verified
                        </span>
                      ) : isRejected ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25">
                          <XCircle className="w-3 h-3" />
                          Needs Revision
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/25">
                          <Clock className="w-3 h-3" />
                          In Review
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-foreground truncate">{doc.title || doc.fileName}</h4>
                    <p className="text-xs text-muted-foreground font-mono truncate">{doc.fileName}</p>

                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
                      <Calendar className="w-3 h-3 text-muted-foreground/70" />
                      <span>Uploaded {moment(doc.createdAt).format("MMM D, YYYY")}</span>
                    </div>
                  </div>

                  {doc.fileUrl && (
                    <div className="pt-2 border-t border-border/60 flex items-center justify-end">
                      <Button asChild size="sm" variant="outline" className="h-8 gap-1.5 text-xs font-semibold cursor-pointer">
                        <a href={doc.fileUrl} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>View File</span>
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {totalUploadsPages > 1 && (
            <Pagination
              currentPage={uploadsPage}
              totalPages={totalUploadsPages}
              onPageChange={setUploadsPage}
              total={uploads.length}
              pageSize={UPLOADS_PAGE_SIZE}
              label="uploads"
            />
          )}
        </div>
      )}

      {/* ========================================================
          REQUEST DOCUMENT MODAL
         ======================================================== */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Send className="w-4 h-4 text-primary" />
              Request Official Document from HR
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Select the type of certificate or verification letter you require. Your HR team will process and issue your PDF.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRequestDocument} className="space-y-4 pt-2">
            {/* Category Cards */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                1. Document Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {DOCUMENT_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setReqCategory(cat.value)}
                    className={cn(
                      "p-3 rounded-xl border text-left transition-all cursor-pointer",
                      reqCategory === cat.value
                        ? "bg-primary/5 border-primary shadow-xs ring-1 ring-primary"
                        : "bg-background border-border hover:bg-muted/40"
                    )}
                  >
                    <p className={cn("text-xs font-bold", reqCategory === cat.value ? "text-primary" : "text-foreground")}>
                      {cat.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{cat.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {reqCategory === "other" && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                  Custom Title <span className="text-destructive">*</span>
                </label>
                <Input
                  required
                  value={reqTitle}
                  onChange={(e) => setReqTitle(e.target.value)}
                  placeholder="e.g. NOC Letter or Project Certification..."
                  className="text-xs font-medium"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                Purpose / Additional Context (Optional)
              </label>
              <Textarea
                rows={3}
                value={reqReason}
                onChange={(e) => setReqReason(e.target.value)}
                placeholder="State the purpose (e.g. Applying for Schengen visa appointment on Nov 15th)..."
                className="text-xs leading-relaxed"
              />
            </div>

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-[11px] text-muted-foreground flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>Standard processing takes 1–2 business days. You will receive an email notification when your certificate is issued.</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setModalOpen(false)}
                className="text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={creating}
                className="gap-1.5 text-xs font-semibold cursor-pointer shadow-xs"
              >
                {creating ? (
                  <>
                    <Loader className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Request</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
