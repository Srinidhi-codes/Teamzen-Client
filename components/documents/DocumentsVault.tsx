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

type Tab = "issued" | "requests" | "uploads";

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
  const { issued, requests, uploads, loading, refetch } = useMyDocuments();
  const [tab, setTab] = useState<Tab>("issued");
  const [uploadingId, setUploadingId] = useState<string | null>(null);

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

      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        {(
          [
            ["issued", "Issued", issued.length],
            ["requests", "Requests", openRequests.length],
            ["uploads", "My uploads", uploads.length],
          ] as const
        ).map(([key, label, count]) => (
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
            <span className="ml-1.5 tabular-nums opacity-80">({count})</span>
          </button>
        ))}
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground">Loading documents…</p>
      )}

      {tab === "issued" && (
        <div className="grid gap-3 md:grid-cols-2">
          {issued.length === 0 && !loading && (
            <Card className="col-span-full flex flex-col items-center gap-2 p-8 text-center text-muted-foreground">
              <FolderOpen className="h-8 w-8 opacity-50" />
              <p>No issued documents yet. Form 16 and letters will appear here.</p>
            </Card>
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
            <Card className="p-8 text-center text-muted-foreground">
              No document requests from HR.
            </Card>
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

      {tab === "uploads" && (
        <div className="space-y-3">
          {uploads.length === 0 && !loading && (
            <Card className="p-8 text-center text-muted-foreground">
              You have not uploaded any documents yet.
            </Card>
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
