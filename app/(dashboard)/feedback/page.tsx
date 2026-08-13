"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { FEEDBACK_LIST } from "@/lib/graphql/feedback/queries";
import { CREATE_FEEDBACK } from "@/lib/graphql/feedback/mutations";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { PageHeader } from "@/components/common/PageHeader";
import { FormInput } from "@/components/common/FormInput";
import { FormTextarea } from "@/components/common/FormTextArea";
import { FormSelect } from "@/components/common/FormSelect";
import { PhotoOverlay } from "@/components/common/PhotoOverlay";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import axios from "axios";
import { EmptyState } from "@/components/common/EmptyState";
import { EmptyImages } from "@/lib/brand-images";
import {
  MessageSquare,
  Paperclip,
  Send,
  Megaphone,
  ExternalLink,
  ImageIcon,
  X,
} from "lucide-react";

type FeedbackItem = {
  id: string;
  title: string;
  message: string;
  category: string;
  status: string;
  visibility: string;
  adminReply?: string;
  repliedAt?: string;
  createdAt: string;
  attachmentCount?: number;
  author?: { id: string; firstName?: string; lastName?: string; email?: string };
  repliedBy?: { firstName?: string; lastName?: string } | null;
  attachments?: { id: string; fileName?: string; fileUrl?: string }[];
};

const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "bug", label: "Bug" },
  { value: "feature", label: "Feature request" },
  { value: "praise", label: "Praise" },
];

function mediaHref(url?: string | null) {
  if (!url) return "#";
  if (url.startsWith("http")) return url;
  const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/api\/?$/, "");
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

function isImageAttachment(fileName?: string, fileUrl?: string) {
  const name = (fileName || fileUrl || "").toLowerCase();
  return /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(name);
}

async function uploadAttachments(feedbackId: string, files: File[]) {
  for (const file of files) {
    const form = new FormData();
    form.append("feedback_id", feedbackId);
    form.append("file", file);
    await axios.post(`/api${API_ENDPOINTS.FEEDBACK_ATTACHMENTS}`, form, {
      withCredentials: true,
    });
  }
}

export default function FeedbackPage() {
  const [tab, setTab] = useState<"mine" | "org" | "new">("mine");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("general");
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ src: string; name: string } | null>(null);

  const { data, loading, refetch } = useQuery(FEEDBACK_LIST, {
    variables: {
      category: tab === "org" ? "admin_share" : undefined,
    },
    skip: tab === "new",
  }) as {
    data?: { feedbackList?: FeedbackItem[] };
    loading: boolean;
    refetch: () => void;
  };

  const [createFeedback] = useMutation<any>(CREATE_FEEDBACK);

  const items = useMemo(() => {
    const list = data?.feedbackList || [];
    if (tab === "org") return list.filter((i) => i.visibility === "org");
    return list.filter((i) => i.visibility === "private");
  }, [data, tab]);

  const selected = useMemo(
    () => items.find((i) => i.id === selectedId) || items[0] || null,
    [items, selectedId]
  );

  const handleSubmit = async () => {
    if (title.trim().length < 3) {
      toast.error("Title must be at least 3 characters");
      return;
    }
    if (message.trim().length < 10) {
      toast.error("Message must be at least 10 characters");
      return;
    }
    setSaving(true);
    try {
      const { data: res } = await createFeedback({
        variables: {
          input: {
            title: title.trim(),
            message: message.trim(),
            category,
            visibility: "private",
          },
        },
      });
      const payload = res?.createFeedback;
      if (!payload?.success) {
        toast.error(payload?.error || "Failed to submit");
        return;
      }
      if (files.length && payload.feedback?.id) {
        await uploadAttachments(payload.feedback.id, files);
      }
      toast.success("Feedback submitted — admins have been notified");
      setTitle("");
      setMessage("");
      setFiles([]);
      setCategory("general");
      setTab("mine");
      refetch();
    } catch (e: any) {
      toast.error(e?.message || "Failed to submit");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Feedback"
        description="Share ideas and issues with admins, or read updates shared with the organization."
      />

      <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-muted/40 p-1">
        {[
          { id: "mine" as const, label: "My feedback", icon: MessageSquare },
          { id: "org" as const, label: "From admin", icon: Megaphone },
          { id: "new" as const, label: "Submit", icon: Send },
        ].map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
                active
                  ? "bg-background font-medium text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "new" && (
        <div className="mx-auto max-w-2xl rounded-xl border border-border bg-card p-5 sm:p-6">
          <h3 className="text-sm font-semibold">Submit feedback</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Private to admins. Attach screenshots or files (max 10MB each). Use AI write to polish your message.
          </p>
          <div className="mt-5 space-y-4">
            <FormInput
              label="Title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief summary"
            />
            <FormSelect
              label="Category"
              value={category}
              onValueChange={setCategory}
              options={CATEGORIES}
            />
            <FormTextarea
              label="Message"
              required
              rows={7}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your feedback in detail…"
            />
            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">
                Attachments
              </label>
              <input
                type="file"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
                className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium"
              />
              {files.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {files.map((f) => (
                    <li key={f.name} className="flex items-center gap-2">
                      <Paperclip className="h-3 w-3" />
                      {f.name}
                      <button
                        type="button"
                        className="text-destructive"
                        onClick={() => setFiles((prev) => prev.filter((x) => x !== f))}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Button disabled={saving} onClick={handleSubmit} className="w-full sm:w-auto">
              {saving ? "Submitting…" : "Submit feedback"}
            </Button>
          </div>
        </div>
      )}

      {(tab === "mine" || tab === "org") && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold">
                {tab === "org" ? "Admin updates" : "Your submissions"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {loading ? "Loading…" : `${items.length} items`}
              </p>
            </div>
            <div className="max-h-[65vh] divide-y divide-border overflow-y-auto">
              {!loading && items.length === 0 && (
                <EmptyState
                  src={EmptyImages.feedback}
                  title={tab === "org" ? "No admin shares yet" : "No feedback yet"}
                  description={
                    tab === "org"
                      ? "Org-wide updates from admin will appear here."
                      : "You haven’t submitted feedback yet."
                  }
                  size="default"
                />
              )}
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={cn(
                    "block w-full px-4 py-3 text-left hover:bg-muted/50",
                    selected?.id === item.id && "bg-muted/60"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-1 text-sm font-medium">{item.title}</p>
                    <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
                      {item.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString()}
                    {item.adminReply ? " · Replied" : ""}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            {!selected ? (
              <p className="py-16 text-center text-sm text-muted-foreground">Select an item</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold">{selected.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {selected.category.replace("_", " ")} ·{" "}
                    {new Date(selected.createdAt).toLocaleString()}
                  </p>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{selected.message}</p>
                {(selected.attachments?.length || 0) > 0 && (
                  <ul className="space-y-2">
                    {selected.attachments!.map((a) => {
                      const href = mediaHref(a.fileUrl);
                      const image = isImageAttachment(a.fileName, a.fileUrl);
                      if (image) {
                        return (
                          <li key={a.id}>
                            <button
                              type="button"
                              onClick={() =>
                                setPreview({
                                  src: href,
                                  name: a.fileName || "Attachment",
                                })
                              }
                              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                            >
                              <ImageIcon className="h-3.5 w-3.5" />
                              {a.fileName || "Attachment"}
                            </button>
                          </li>
                        );
                      }
                      return (
                        <li key={a.id}>
                          <a
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            {a.fileName || "Attachment"}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                )}
                {selected.adminReply && (
                  <div className="rounded-lg border border-border bg-muted/40 p-3">
                    <p className="text-xs font-medium text-muted-foreground">Admin reply</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm">{selected.adminReply}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      <PhotoOverlay
        open={Boolean(preview)}
        onOpenChange={(open) => !open && setPreview(null)}
        src={preview?.src}
        name={preview?.name}
      />
    </div>
  );
}
