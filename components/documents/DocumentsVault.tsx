"use client";

import { useState } from "react";
import { Download, FileText, Upload, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import moment from "moment";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMyDocuments } from "@/lib/graphql/documents/documentsHook";
import { cn } from "@/lib/utils";
import { CREATE_EMPLOYEE_DOCUMENT_REQUEST } from "@/lib/graphql/documents/mutations";
import { useMutation } from "@apollo/client/react";
import { Modal } from "@/components/common/Modal";
import { FormSelect } from "@/components/common/FormSelect";
import { EmptyState } from "@/components/common/EmptyState";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

type Tab = "issued" | "requests" | "employeeRequests" | "uploads";

async function uploadForRequest(requestId: string, file: File) {
  const form = new FormData();
  form.append("file", file);
  form.append("request_id", requestId);
  // No trailing slash — Next.js 308-redirects `/api/.../` and can break multipart POSTs.
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
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const [createReq, { loading: creating }] = useMutation<{
    createEmployeeDocumentRequest: { success: boolean; error?: string | null; id?: string | null };
  }>(CREATE_EMPLOYEE_DOCUMENT_REQUEST);
  const [modalOpen, setModalOpen] = useState(false);
  const [reqCategory, setReqCategory] = useState("bonafide");
  const [reqTitle, setReqTitle] = useState("");
  const [reqReason, setReqReason] = useState("");

  const handleRequestDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createReq({
        variables: {
          input: {
            category: reqCategory,
            customTitle: reqTitle,
            reason: reqReason,
          },
        },
      });
      if (res.data?.createEmployeeDocumentRequest?.error) {
        throw new Error(res.data.createEmployeeDocumentRequest.error);
      }
      toast.success("Document requested successfully!");
      setModalOpen(false);
      setReqCategory("bonafide");
      setReqTitle("");
      setReqReason("");
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Failed to request document");
    }
  };

  const openRequests = requests.filter((r: any) => r.status === "open");

  const onUpload = async (requestId: string, file?: File | null) => {
    if (!file) return;
    setUploadingId(requestId);
    try {
      await uploadForRequest(requestId, file);
      toast.success("Document uploaded");
      await refetch();
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Download Form 16 and certificates, or upload files HR has requested."
      />

      <div className="flex flex-wrap gap-2 border-b border-border pb-2 justify-between items-center">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["issued", "Issued"],
              ["requests", "Action required"],
              ["employeeRequests", "My requests"],
              ["uploads", "My uploads"],
            ] as const
          ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              tab === key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            {label}
          </button>
        ))}
        </div>
        
        <Button size="sm" onClick={() => setModalOpen(true)}>Request Document</Button>
        
        <Modal 
          isOpen={modalOpen} 
          onClose={() => setModalOpen(false)}
          title="Request a document"
          onConfirm={handleRequestDocument as any}
          confirmText="Submit request"
          isLoading={creating}
        >
          <div className="space-y-4">
            <div>
              <FormSelect
                label="Document type"
                options={[
                  { value: "bonafide", label: "Bonafide Certificate" },
                  { value: "visa", label: "Visa Letter" },
                  { value: "address_proof", label: "Address Proof" },
                  { value: "experience", label: "Experience Letter" },
                  { value: "salary_certificate", label: "Salary Certificate" },
                  { value: "other", label: "Other" },
                ]}
                value={reqCategory}
                onValueChange={setReqCategory}
              />
            </div>
            {reqCategory === "other" && (
              <div>
                <label className="text-sm font-medium mb-1 block text-muted-foreground">Custom document title</label>
                <Input 
                  required 
                  value={reqTitle} 
                  onChange={e => setReqTitle(e.target.value)} 
                  placeholder="E.g., Custom Tax Letter" 
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium mb-1 block text-muted-foreground">Reason (Optional)</label>
              <Textarea 
                value={reqReason} 
                onChange={e => setReqReason(e.target.value)} 
                placeholder="Why do you need this document?" 
                className="resize-none h-24 bg-background"
              />
            </div>
          </div>
        </Modal>
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground">Loading documents…</p>
      )}

      {tab === "issued" && (
        <div className="grid gap-3 md:grid-cols-2">
          {issued.length === 0 && !loading && (
            <div className="col-span-full">
              <EmptyState 
                className="rounded-xl border bg-card"
                size="wide"
                src="/images/empty/empty-payslip.webp" 
                title="No issued documents yet" 
                description="Form 16 and official letters will appear here."
              />
            </div>
          )}
          {issued.map((doc: any) => (
            <Card key={doc.id} className="flex items-start justify-between gap-3 p-4">
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 shrink-0 text-primary" />
                  <p className="truncate font-medium">{doc.title}</p>
                </div>
                <p className="text-xs text-muted-foreground capitalize">
                  {doc.category?.replace(/_/g, " ")}
                  {doc.financialYear ? ` · FY ${doc.financialYear}` : ""}
                  {doc.publishedAt
                    ? ` · ${moment(doc.publishedAt).format("ll")}`
                    : ""}
                </p>
              </div>
              {doc.downloadUrl && (
                <Button asChild size="sm" variant="outline">
                  <a href={doc.downloadUrl} target="_blank" rel="noreferrer">
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                    Download
                  </a>
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}

      {tab === "requests" && (
        <div className="space-y-3">
          {requests.length === 0 && !loading && (
            <EmptyState 
              className="rounded-xl border bg-card"
              size="wide"
              src="/images/empty/empty-payslip.webp" 
              title="No pending HR requests" 
              description="You have no document requests from HR."
            />
          )}
          {requests.map((req: any) => (
            <Card key={req.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{req.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {req.category?.replace(/_/g, " ")} · {req.status}
                    {req.dueAt ? ` · due ${moment(req.dueAt).format("ll")}` : ""}
                  </p>
                  {req.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{req.description}</p>
                  )}
                  {req.verificationStatus && (
                    <p className="mt-1 text-xs">
                      Verification: {req.verificationStatus}
                    </p>
                  )}
                </div>
                {req.status === "open" && (
                  <label className="inline-flex cursor-pointer items-center">
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      disabled={uploadingId === req.id}
                      onChange={(e) => onUpload(req.id, e.target.files?.[0])}
                    />
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted">
                      <Upload className="h-3.5 w-3.5" />
                      {uploadingId === req.id ? "Uploading…" : "Upload"}
                    </span>
                  </label>
                )}
                {req.fileUrl && (
                  <Button asChild size="sm" variant="ghost">
                    <a href={req.fileUrl} target="_blank" rel="noreferrer">
                      View file
                    </a>
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "employeeRequests" && (
        <div className="space-y-4">
          {employeeRequests.length === 0 && !loading && (
            <EmptyState 
              className="rounded-xl border bg-card"
              size="wide"
              src="/images/empty/empty-payslip.webp" 
              title="No requests made" 
              description="You haven't requested any documents from HR."
              action={{ label: "Request your first document", onClick: () => setModalOpen(true) }}
            />
          )}
          <div className="grid gap-4 md:grid-cols-2">
            {employeeRequests.map((req: any) => (
              <div key={req.id} className="group relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
                <div className="flex flex-col gap-3 h-full">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full border shadow-sm",
                        req.status === "issued" ? "bg-primary/10 text-primary border-primary/20" :
                        req.status === "rejected" ? "bg-destructive/10 text-destructive border-destructive/20" :
                        "bg-muted text-muted-foreground border-border/50"
                      )}>
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground tracking-tight line-clamp-1">
                          {req.category === "other" ? req.customTitle : req.category.replace(/_/g, " ")}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {moment(req.createdAt).format("MMM D, YYYY")}
                        </p>
                      </div>
                    </div>
                    
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      req.status === "issued" ? "bg-primary/10 text-primary" :
                      req.status === "rejected" ? "bg-destructive/10 text-destructive" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {req.status}
                    </span>
                  </div>
                  
                  {req.reason && (
                    <div className="mt-2 bg-muted/30 p-3 rounded-lg border border-border/30 text-sm text-foreground/80 leading-relaxed italic">
                      "{req.reason}"
                    </div>
                  )}
                  
                  {req.rejectedReason && (
                    <div className="mt-2 bg-destructive/10 text-destructive text-xs p-3 rounded-lg border border-destructive/20 font-medium">
                      Rejected: {req.rejectedReason}
                    </div>
                  )}

                  <div className="flex-1" />
                  
                  {req.issuedDocumentUrl && (
                    <div className="pt-3 mt-1 border-t border-border/50 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button asChild size="sm" variant="default" className="w-full sm:w-auto shadow-sm">
                        <a href={req.issuedDocumentUrl} target="_blank" rel="noreferrer">
                          <Download className="mr-2 h-3.5 w-3.5" />
                          Download Document
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "uploads" && (
        <div className="space-y-3">
          {uploads.length === 0 && !loading && (
            <EmptyState 
              className="rounded-xl border bg-card"
              size="wide"
              src="/images/empty/empty-payslip.webp" 
              title="No uploads" 
              description="You have not uploaded any documents yet."
            />
          )}
          {uploads.map((doc: any) => (
            <Card key={doc.id} className="flex items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium">{doc.title || doc.fileName}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {doc.category?.replace(/_/g, " ")} · {doc.verificationStatus}
                  {doc.source ? ` · ${doc.source.replace(/_/g, " ")}` : ""}
                </p>
              </div>
              {doc.fileUrl && (
                <Button asChild size="sm" variant="outline">
                  <a href={doc.fileUrl} target="_blank" rel="noreferrer">
                    Open
                  </a>
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
