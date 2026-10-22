"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useMutation, useQuery } from "@apollo/client/react";
import { FEEDBACK_LIST } from "@/lib/graphql/feedback/queries";
import { CREATE_FEEDBACK } from "@/lib/graphql/feedback/mutations";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { PageHeader } from "@/components/common/PageHeader";
import { PageSkeleton } from "@/components/common/PageSkeleton";
import { PhotoOverlay } from "@/components/common/PhotoOverlay";
import { Pagination } from "@/components/common/Pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import axios from "axios";
import moment from "moment";
import {
  MessageSquare,
  Paperclip,
  Send,
  Megaphone,
  ExternalLink,
  ImageIcon,
  X,
  UploadCloud,
  Bug,
  Sparkles,
  Heart,
  HelpCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Search,
  Filter,
  PlusCircle,
  FileText,
  Check,
  User,
  ArrowRight,
  AlertCircle,
  Inbox,
  Lock,
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
  updatedAt?: string;
  author?: { id: string; firstName?: string; lastName?: string; email?: string };
  repliedBy?: { id: string; firstName?: string; lastName?: string } | null;
  attachments?: { id: string; fileName?: string; fileUrl?: string; createdAt?: string }[];
};

const CATEGORIES_CONFIG: Record<
  string,
  {
    label: string;
    short: string;
    icon: any;
    badgeClass: string;
    colorClass: string;
    description: string;
  }
> = {
  bug: {
    label: "Bug Report",
    short: "Bug",
    icon: Bug,
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25",
    colorClass: "text-rose-500",
    description: "Report technical glitches, system lag, crashes, or broken behavior",
  },
  feature: {
    label: "Feature Request",
    short: "Feature",
    icon: Sparkles,
    badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25",
    colorClass: "text-purple-500",
    description: "Suggest new tools, workflow ideas, or product enhancements",
  },
  praise: {
    label: "Praise & Kudos",
    short: "Praise",
    icon: Heart,
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
    colorClass: "text-amber-500",
    description: "Celebrate team milestones, appreciate colleagues, or give positive shoutouts",
  },
  general: {
    label: "General Inquiry",
    short: "General",
    icon: HelpCircle,
    badgeClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/25",
    colorClass: "text-sky-500",
    description: "General questions, suggestions, or organizational thoughts",
  },
  admin_share: {
    label: "Company Broadcast",
    short: "Broadcast",
    icon: Megaphone,
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
    colorClass: "text-emerald-500",
    description: "Official announcements and company-wide notifications",
  },
};

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    step: number;
    badgeClass: string;
    dotClass: string;
    description: string;
  }
> = {
  open: {
    label: "Open",
    step: 1,
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
    dotClass: "bg-amber-500",
    description: "Submitted and waiting for initial admin review",
  },
  in_progress: {
    label: "In Progress",
    step: 2,
    badgeClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/25",
    dotClass: "bg-sky-500",
    description: "Actively under investigation by the administrative team",
  },
  resolved: {
    label: "Resolved",
    step: 3,
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
    dotClass: "bg-emerald-500",
    description: "Addressed and finalized by company administrators",
  },
  closed: {
    label: "Closed",
    step: 3,
    badgeClass: "bg-muted text-muted-foreground border-border",
    dotClass: "bg-muted-foreground",
    description: "Ticket has been closed",
  },
};

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

  // Search & Filtering within inbox
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    setPage(1);
  }, [tab, searchQuery, statusFilter, categoryFilter]);

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

  // Raw tab items
  const rawItems = useMemo(() => {
    const list = data?.feedbackList || [];
    if (tab === "org") return list.filter((i) => i.visibility === "org");
    return list.filter((i) => i.visibility === "private");
  }, [data, tab]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return rawItems.filter((item) => {
      // Status filter
      if (statusFilter !== "all") {
        if (statusFilter === "resolved") {
          if (item.status !== "resolved" && item.status !== "closed") return false;
        } else if (item.status !== statusFilter) {
          return false;
        }
      }

      // Category filter
      if (categoryFilter !== "all" && item.category !== categoryFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesMsg = item.message.toLowerCase().includes(q);
        const matchesCat = item.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesMsg && !matchesCat) return false;
      }

      return true;
    });
  }, [rawItems, statusFilter, categoryFilter, searchQuery]);

  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, page, pageSize]);

  // Selected item
  const selected = useMemo(() => {
    if (!filteredItems.length) return null;
    return filteredItems.find((i) => i.id === selectedId) || filteredItems[0];
  }, [filteredItems, selectedId]);

  // Summary Metrics calculations
  const totalSubmissions = rawItems.length;
  const openCount = rawItems.filter((i) => i.status === "open").length;
  const inProgressCount = rawItems.filter((i) => i.status === "in_progress").length;
  const resolvedCount = rawItems.filter((i) => i.status === "resolved" || i.status === "closed").length;
  const repliedCount = rawItems.filter((i) => Boolean(i.adminReply)).length;

  const handleSubmit = async () => {
    if (title.trim().length < 3) {
      toast.error("Please enter a title (at least 3 characters)");
      return;
    }
    if (message.trim().length < 10) {
      toast.error("Please provide more detail in your message (at least 10 characters)");
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
        toast.error(payload?.error || "Failed to submit feedback");
        return;
      }
      if (files.length && payload.feedback?.id) {
        await uploadAttachments(payload.feedback.id, files);
      }
      toast.success("Feedback submitted successfully! Our team will review it.");
      setTitle("");
      setMessage("");
      setFiles([]);
      setCategory("general");
      setTab("mine");
      refetch();
    } catch (e: any) {
      toast.error(e?.message || "Failed to submit feedback");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full space-y-6 pb-20 animate-fade-in">
      {/* Page Header with Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Feedback & Support"
          eyebrow="Help & Support"
          description="Submit tickets, report glitches, suggest features, and track admin resolutions."
        />
        {tab !== "new" && (
          <Button
            onClick={() => setTab("new")}
            className="h-10 px-4 gap-2 font-medium shrink-0 self-start sm:self-auto shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Feedback</span>
          </Button>
        )}
      </div>

      {/* Modern Segmented Navigation Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center bg-muted/40 p-1 rounded-xl border border-border/80">
          {[
            { id: "mine" as const, label: "My Feedback", icon: MessageSquare, count: tab === "mine" ? totalSubmissions : undefined },
            { id: "org" as const, label: "Company Updates", icon: Megaphone, count: tab === "org" ? totalSubmissions : undefined },
            { id: "new" as const, label: "Submit Feedback", icon: Send },
          ].map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                  active
                    ? "bg-background text-foreground shadow-xs font-semibold border border-border/40"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("w-3.5 h-3.5", active && "text-primary")} />
                <span>{t.label}</span>
                {t.count !== undefined && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted font-mono">
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {tab === "mine" && repliedCount > 0 && (
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            {repliedCount} ticket{repliedCount > 1 ? "s" : ""} have official admin responses
          </span>
        )}
      </div>

      {/* VIEW: Submit New Feedback */}
      {tab === "new" && (
        <div className="max-w-3xl mx-auto rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-border/60">
            <div>
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Send className="w-5 h-5 text-primary" />
                Submit New Feedback
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your submission is delivered directly to company operations and administrators.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTab("mine")}
              className="text-xs text-muted-foreground"
            >
              Cancel
            </Button>
          </div>

          {/* Interactive Category Selector Cards */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
              1. Select Feedback Category
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: "bug", ...CATEGORIES_CONFIG.bug },
                { id: "feature", ...CATEGORIES_CONFIG.feature },
                { id: "praise", ...CATEGORIES_CONFIG.praise },
                { id: "general", ...CATEGORIES_CONFIG.general },
              ].map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={cn(
                      "p-3.5 rounded-xl border text-left transition-all flex items-start gap-3",
                      isSelected
                        ? "bg-primary/5 border-primary ring-1 ring-primary/25 shadow-xs"
                        : "bg-background hover:bg-muted/30 border-border/80"
                    )}
                  >
                    <div
                      className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border",
                        cat.badgeClass
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">
                          {cat.label}
                        </span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                        {cat.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subject / Title Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                2. Subject / Title <span className="text-destructive">*</span>
              </label>
              <span className="text-[10px] text-muted-foreground font-mono">
                {title.length}/100
              </span>
            </div>
            <Input
              value={title}
              maxLength={100}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Lag in face recognition attendance module on mobile"
              className="text-xs sm:text-sm h-10 bg-background"
            />
          </div>

          {/* Description Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                3. Detailed Description <span className="text-destructive">*</span>
              </label>
              <span className="text-[10px] text-muted-foreground">
                Minimum 10 characters
              </span>
            </div>
            <Textarea
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Provide context, steps to reproduce if a bug, impact, or specific suggestions..."
              className="text-xs sm:text-sm bg-background leading-relaxed"
            />
          </div>

          {/* Attachments Drag & Drop Zone */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
              4. Attachments (Screenshots or logs)
            </label>

            <div
              onClick={() => document.getElementById("feedback-upload-input")?.click()}
              className="border-2 border-dashed border-border/80 hover:border-primary/50 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-muted/20 hover:bg-muted/30 group"
            >
              <UploadCloud className="w-8 h-8 text-muted-foreground group-hover:text-primary mx-auto transition-colors" />
              <p className="text-xs font-medium text-foreground mt-2">
                Click to browse or drop screenshots & documents
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Supports PNG, JPG, WEBP, PDF up to 10MB each
              </p>
              <input
                id="feedback-upload-input"
                type="file"
                multiple
                onChange={(e) => {
                  if (e.target.files) {
                    setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
                  }
                }}
                className="hidden"
              />
            </div>

            {/* Selected files preview */}
            {files.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-border/80 bg-background text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Paperclip className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate font-medium text-foreground">
                        {file.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
                        ({(file.size / 1024).toFixed(0)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFiles((prev) => prev.filter((_, i) => i !== idx))}
                      className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Privacy Note & Actions */}
          <div className="pt-4 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Visible only to you and authorized company administrators.</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTab("mine")}
                className="h-9 px-4 text-xs"
              >
                Cancel
              </Button>
              <Button
                disabled={saving || !title.trim() || !message.trim()}
                onClick={handleSubmit}
                className="h-9 px-5 gap-2 text-xs font-semibold shadow-sm"
              >
                {saving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Feedback</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: Inbox Split View (Mine or Org Updates) */}
      {(tab === "mine" || tab === "org") && (
        <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm">
          {/* Inbox Filter & Search Toolbar */}
          <div className="p-4 border-b border-border/60 bg-muted/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tickets by title, message..."
                className="w-full pl-9 pr-8 py-2 rounded-xl text-xs border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/60"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Status / Category Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 p-0.5 bg-background rounded-lg border border-border/60">
                {[
                  { id: "all", label: "All" },
                  { id: "open", label: "Open" },
                  { id: "in_progress", label: "In Progress" },
                  { id: "resolved", label: "Resolved" },
                  { id: "closed", label: "Closed" },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStatusFilter(s.id)}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-xs font-medium transition-all",
                      statusFilter === s.id
                        ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Master-Detail Split Pane */}
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] min-h-[580px] h-[650px] divide-y lg:divide-y-0 lg:divide-x divide-border/70">
            {/* Left: Ticket Inbox List */}
            <div className="overflow-y-auto divide-y divide-border/60 bg-muted/[0.08] custom-scrollbar flex flex-col">
              {loading && (
                <div className="p-5 space-y-4">
                  <PageSkeleton variant="list" />
                </div>
              )}

              {!loading && filteredItems.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                    <Inbox className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">
                      {searchQuery || statusFilter !== "all" || categoryFilter !== "all"
                        ? "No matching tickets"
                        : tab === "org"
                        ? "No company updates yet"
                        : "No feedback submitted yet"}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[240px] mx-auto">
                      {searchQuery || statusFilter !== "all" || categoryFilter !== "all"
                        ? "Try clearing filters to see all submissions."
                        : tab === "org"
                        ? "Company-wide announcements from admins will be shown here."
                        : "Have an issue or idea? Click '+ New Feedback' above."}
                    </p>
                  </div>
                  {(searchQuery || statusFilter !== "all" || categoryFilter !== "all") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("all");
                        setCategoryFilter("all");
                      }}
                      className="h-8 text-xs"
                    >
                      Reset Filters
                    </Button>
                  )}
                </div>
              )}

              {!loading &&
                paginatedItems.map((item) => {
                  const isSelected = selected?.id === item.id;
                  const cat = CATEGORIES_CONFIG[item.category] || CATEGORIES_CONFIG.general;
                  const stat = STATUS_CONFIG[item.status] || STATUS_CONFIG.open;
                  const formattedDate = moment(item.createdAt).fromNow();
                  const hasReply = Boolean(item.adminReply);
                  const attachCount = item.attachments?.length || 0;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      className={cn(
                        "w-full text-left p-4 transition-all duration-150 relative flex flex-col gap-2 hover:bg-muted/40",
                        isSelected
                          ? "bg-card border-l-4 border-l-primary shadow-xs"
                          : "border-l-4 border-l-transparent"
                      )}
                    >
                      {/* Top Badges Row */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border",
                            cat.badgeClass
                          )}
                        >
                          <span>{cat.short}</span>
                        </span>

                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                            stat.badgeClass
                          )}
                        >
                          <span className={cn("w-1.5 h-1.5 rounded-full", stat.dotClass)} />
                          <span>{stat.label}</span>
                        </span>
                      </div>

                      {/* Title */}
                      <h4
                        className={cn(
                          "text-xs sm:text-sm font-semibold line-clamp-1 leading-snug",
                          isSelected ? "text-primary" : "text-foreground"
                        )}
                      >
                        {item.title}
                      </h4>

                      {/* Excerpt */}
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {item.message}
                      </p>

                      {/* Bottom Metadata */}
                      <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-muted-foreground/70" />
                          {formattedDate}
                        </span>

                        <div className="flex items-center gap-2">
                          {attachCount > 0 && (
                            <span className="flex items-center gap-0.5 text-muted-foreground">
                              <Paperclip className="w-3 h-3" />
                              <span>{attachCount}</span>
                            </span>
                          )}

                          {hasReply && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                              <Check className="w-2.5 h-2.5" />
                              Replied
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}

              {totalPages > 1 && (
                <div className="p-2 border-t border-border/80 bg-card/60 shrink-0">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    total={filteredItems.length}
                    pageSize={pageSize}
                    label="tickets"
                  />
                </div>
              )}
            </div>

            {/* Right: Selected Ticket Details & Discussion */}
            <div className="overflow-y-auto bg-card p-6 flex flex-col justify-between custom-scrollbar">
              {!selected ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-muted-foreground space-y-2">
                  <Inbox className="w-8 h-8 text-muted-foreground/60" />
                  <p className="text-sm font-medium text-foreground">Select a ticket</p>
                  <p className="text-xs text-muted-foreground">
                    Choose any submission from the left inbox to view full details and admin replies.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Top Metadata Row */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border/60">
                    <div className="flex items-center gap-2 flex-wrap">
                      {(() => {
                        const cat =
                          CATEGORIES_CONFIG[selected.category] || CATEGORIES_CONFIG.general;
                        return (
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border",
                              cat.badgeClass
                            )}
                          >
                            <span>{cat.label}</span>
                          </span>
                        );
                      })()}

                      {(() => {
                        const stat =
                          STATUS_CONFIG[selected.status] || STATUS_CONFIG.open;
                        return (
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
                              stat.badgeClass
                            )}
                          >
                            <span
                              className={cn("w-2 h-2 rounded-full", stat.dotClass)}
                            />
                            <span>{stat.label}</span>
                          </span>
                        );
                      })()}
                    </div>

                    <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{moment(selected.createdAt).format("MMM D, YYYY · h:mm A")}</span>
                    </div>
                  </div>

                  {/* Title & Author Info */}
                  <div className="space-y-2">
                    <h2 className="text-lg sm:text-xl font-bold text-foreground leading-snug">
                      {selected.title}
                    </h2>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-semibold text-[10px]">
                        <User className="w-3 h-3" />
                      </div>
                      <span>
                        Submitted by{" "}
                        <strong className="text-foreground">
                          {selected.author?.firstName
                            ? `${selected.author.firstName} ${selected.author.lastName || ""}`
                            : "You"}
                        </strong>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Lock className="w-3 h-3 text-emerald-500" />
                        Private Ticket
                      </span>
                    </div>
                  </div>

                  {/* Visual Status Workflow Tracker */}
                  <div className="rounded-xl bg-muted/30 border border-border/70 p-4 space-y-3">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                      Resolution Progress
                    </span>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      {/* Step 1 */}
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                          <Check className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-foreground text-[11px]">
                          1. Submitted
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {moment(selected.createdAt).format("MMM D")}
                        </span>
                      </div>

                      {/* Step 2 */}
                      <div className="flex flex-col items-center gap-1.5">
                        <div
                          className={cn(
                            "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                            selected.status === "in_progress" ||
                              selected.status === "resolved" ||
                              selected.adminReply
                              ? "bg-emerald-500 text-white shadow-xs"
                              : "bg-amber-500/20 text-amber-600 border border-amber-500/30"
                          )}
                        >
                          {selected.status === "in_progress" ||
                          selected.status === "resolved" ||
                          selected.adminReply ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Clock className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <span className="font-semibold text-foreground text-[11px]">
                          2. Reviewing
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {selected.adminReply ? "Admin Responded" : "In queue"}
                        </span>
                      </div>

                      {/* Step 3 */}
                      <div className="flex flex-col items-center gap-1.5">
                        <div
                          className={cn(
                            "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                            selected.status === "resolved" || selected.status === "closed"
                              ? "bg-emerald-500 text-white shadow-xs"
                              : "bg-muted text-muted-foreground border border-border"
                          )}
                        >
                          {selected.status === "resolved" ||
                          selected.status === "closed" ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <span className="font-semibold text-foreground text-[11px]">
                          3. Resolution
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {selected.status === "resolved"
                            ? "Complete"
                            : selected.status === "closed"
                            ? "Closed"
                            : "Pending"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Ticket Content Box */}
                  <div className="rounded-2xl border border-border/80 bg-background/80 p-5 space-y-3">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                      Description
                    </span>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/95">
                      {selected.message}
                    </p>
                  </div>

                  {/* Attachments Section */}
                  {selected.attachments && selected.attachments.length > 0 && (
                    <div className="space-y-3">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Paperclip className="w-3.5 h-3.5" />
                        Attachments ({selected.attachments.length})
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selected.attachments.map((a) => {
                          const href = mediaHref(a.fileUrl);
                          const isImg = isImageAttachment(a.fileName, a.fileUrl);

                          return (
                            <div
                              key={a.id}
                              className="group rounded-xl border border-border/80 bg-muted/20 hover:bg-muted/40 p-3 transition-all flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 overflow-hidden relative">
                                  {isImg && (href || a.fileUrl) ? (
                                    <Image
                                      src={href || a.fileUrl || ""}
                                      alt={a.fileName || "preview"}
                                      width={40}
                                      height={40}
                                      className="w-full h-full object-cover"
                                      unoptimized
                                    />
                                  ) : isImg ? (
                                    <ImageIcon className="w-5 h-5" />
                                  ) : (
                                    <FileText className="w-5 h-5" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-foreground truncate">
                                    {a.fileName || "Attachment"}
                                  </p>
                                  <span className="text-[10px] text-muted-foreground">
                                    {isImg ? "Image File" : "Document"}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                {isImg ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      setPreview({
                                        src: href,
                                        name: a.fileName || "Attachment",
                                      })
                                    }
                                    className="h-8 px-2.5 text-xs gap-1"
                                  >
                                    <ImageIcon className="w-3.5 h-3.5" />
                                    <span>Preview</span>
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(href, "_blank")}
                                    className="h-8 px-2.5 text-xs gap-1"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    <span>Open</span>
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Official Admin Reply Card */}
                  {selected.adminReply ? (
                    <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/[0.06] via-card to-transparent p-5 space-y-3 shadow-xs">
                      <div className="flex items-center justify-between gap-2 pb-2 border-b border-emerald-500/20">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                              Official Admin Response
                              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold">
                                Verified
                              </span>
                            </h4>
                            <p className="text-[11px] text-muted-foreground">
                              {selected.repliedBy?.firstName
                                ? `${selected.repliedBy.firstName} ${selected.repliedBy.lastName || ""}`
                                : "Company Administrator"}
                            </p>
                          </div>
                        </div>

                        {selected.repliedAt && (
                          <span className="text-[11px] text-muted-foreground font-mono">
                            {moment(selected.repliedAt).calendar()}
                          </span>
                        )}
                      </div>

                      <p className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed text-foreground/95">
                        {selected.adminReply}
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-border/80 bg-muted/15 p-4 flex items-start gap-3">
                      <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div className="text-xs space-y-0.5">
                        <span className="font-semibold text-foreground block">
                          Awaiting Administrator Review
                        </span>
                        <p className="text-muted-foreground leading-relaxed">
                          Your ticket has been delivered to company management. You will receive
                          notification and updates right here once an administrator reviews it.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Full Photo Preview Overlay */}
      <PhotoOverlay
        open={Boolean(preview)}
        onOpenChange={(open) => !open && setPreview(null)}
        src={preview?.src}
        name={preview?.name}
      />
    </div>
  );
}
