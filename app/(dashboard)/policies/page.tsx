"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { usePolicies, useAskPolicy } from "@/lib/api/hooks";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";
import { PageSkeleton } from "@/components/common/PageSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { toast } from "sonner";
import {
  FileText,
  Maximize2,
  Minimize2,
  Printer,
  ExternalLink,
  X,
  Search,
  Sparkles,
  Send,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Clock,
  Calendar,
  Layers,
  Zap,
  RotateCcw,
  Info,
} from "lucide-react";
import moment from "moment";

// Suggested questions derived from company policies (Leave Policy & Attendance Policy)
const SUGGESTED_QUESTIONS = [
  {
    category: "Leaves",
    icon: "🏖️",
    label: "Leave Entitlements",
    query: "How many casual, sick, and earned leaves are employees entitled to per year?",
  },
  {
    category: "Attendance",
    icon: "⏰",
    label: "Core Hours & Buffer",
    query: "What are the core working hours, grace period, and late check-in penalties?",
  },
  {
    category: "Attendance",
    icon: "📍",
    label: "Geofence Rules",
    query: "How does the geofenced location attendance verification work?",
  },
  {
    category: "Leaves",
    icon: "🔄",
    label: "Carry Forward Policy",
    query: "Can unused leave balances be encashed or carried forward to next year?",
  },
  {
    category: "Attendance",
    icon: "📝",
    label: "Regularization",
    query: "What is the procedure for attendance regularization if I forget to check in?",
  },
  {
    category: "Leaves",
    icon: "👶",
    label: "Parental Leaves",
    query: "What are the rules and duration for maternity and paternity leaves?",
  },
];

// Helper to extract category for a policy document
const getPolicyCategory = (p: any): { id: string; label: string } => {
  const text = `${p?.title || ""} ${p?.description || ""}`.toLowerCase();
  if (
    text.includes("leave") ||
    text.includes("vacation") ||
    text.includes("holiday") ||
    text.includes("pto") ||
    text.includes("absence") ||
    text.includes("sick") ||
    text.includes("maternity") ||
    text.includes("paternity")
  ) {
    return { id: "leave", label: "Leaves" };
  }
  if (
    text.includes("attendance") ||
    text.includes("check-in") ||
    text.includes("clock") ||
    text.includes("shift") ||
    text.includes("working hour") ||
    text.includes("geofence") ||
    text.includes("regularization")
  ) {
    return { id: "attendance", label: "Attendance" };
  }
  if (
    text.includes("conduct") ||
    text.includes("ethics") ||
    text.includes("discipline") ||
    text.includes("harassment") ||
    text.includes("compliance")
  ) {
    return { id: "conduct", label: "Conduct & Ethics" };
  }
  if (
    text.includes("travel") ||
    text.includes("expense") ||
    text.includes("reimbursement") ||
    text.includes("allowance")
  ) {
    return { id: "travel", label: "Travel & Expense" };
  }
  if (
    text.includes("security") ||
    text.includes("privacy") ||
    text.includes("data") ||
    text.includes("cyber") ||
    text.includes("it policy")
  ) {
    return { id: "security", label: "IT & Security" };
  }
  if (
    text.includes("payroll") ||
    text.includes("salary") ||
    text.includes("compensation") ||
    text.includes("benefit")
  ) {
    return { id: "payroll", label: "Payroll & Benefits" };
  }
  return { id: "general", label: "General" };
};

const matchesSearch = (p: any, query: string) => {
  if (!query) return true;
  const q = query.toLowerCase().trim();
  const title = (p?.title || "").toLowerCase();
  const desc = (p?.description || "").toLowerCase();
  const org = (p?.organization_name || "").toLowerCase();
  const cat = getPolicyCategory(p);
  return (
    title.includes(q) ||
    desc.includes(q) ||
    org.includes(q) ||
    cat.label.toLowerCase().includes(q) ||
    cat.id.toLowerCase().includes(q)
  );
};

// Session Cache Key for Policy AI Q&A
const POLICY_AI_CACHE_KEY = "lms_policy_ai_session_cache_v1";

const normalizeQuery = (text: string) => text.trim().toLowerCase().replace(/[?.,!]+$/, "");

const getSessionStorageCache = (): Record<string, any> => {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(POLICY_AI_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveSessionStorageCache = (key: string, data: any) => {
  if (typeof window === "undefined") return;
  try {
    const cache = getSessionStorageCache();
    cache[key] = data;
    sessionStorage.setItem(POLICY_AI_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore quota errors
  }
};

interface InsightCardData {
  title?: string;
  message?: string;
  type?: string;
  topic?: string;
}

const parsePolicyAnswer = (raw: string): { cleanAnswer: string; insightCard: InsightCardData | null } => {
  if (!raw) return { cleanAnswer: "", insightCard: null };

  const match = raw.match(/\[INSIGHT_CARD\]([\s\S]*?)\[\/INSIGHT_CARD\]/i);
  if (!match) {
    return { cleanAnswer: raw.trim(), insightCard: null };
  }

  const rawCard = match[1];
  const cleanAnswer = raw.replace(match[0], "").trim();

  const cardData: InsightCardData = {};
  rawCard.split("\n").forEach((line) => {
    const colonIdx = line.indexOf(":");
    if (colonIdx !== -1) {
      const key = line.slice(0, colonIdx).trim().toLowerCase();
      const val = line.slice(colonIdx + 1).trim();
      if (key === "title") cardData.title = val;
      if (key === "message") cardData.message = val;
      if (key === "type") cardData.type = val;
      if (key === "topic") cardData.topic = val;
    }
  });

  return { cleanAnswer, insightCard: cardData.title || cardData.message ? cardData : null };
};

export default function PoliciesPage() {
  const { policies, isLoading } = usePolicies();
  const askPolicyMutation = useAskPolicy();

  // Viewer Modal State
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<{ url: string; title: string; id?: number } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const POLICIES_PER_PAGE = 6;

  // Ask AI State & In-Session Cache
  const [aiQuery, setAiQuery] = useState("");
  const [aiAnswer, setAiAnswer] = useState<{
    query: string;
    answer: string;
    sources: Array<{ title: string; file_id?: number; file_url?: string; page_number?: number }>;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // In-memory cache ref for zero-latency instant lookup + token savings
  const aiCacheRef = useRef<Map<string, { query: string; answer: string; sources: any[]; timestamp: number }>>(new Map());
  const [cachedKeys, setCachedKeys] = useState<Record<string, boolean>>({});
  const [isCurrentAnswerCached, setIsCurrentAnswerCached] = useState<boolean>(false);

  // Load existing session cache into memory on mount
  useEffect(() => {
    const stored = getSessionStorageCache();
    const keysMap: Record<string, boolean> = {};
    Object.entries(stored).forEach(([k, v]) => {
      aiCacheRef.current.set(k, v as any);
      keysMap[k] = true;
    });
    setCachedKeys(keysMap);
  }, []);

  // Parsed Answer with Structured Insight Card
  const parsedAnswer = useMemo(() => {
    return parsePolicyAnswer(aiAnswer?.answer || "");
  }, [aiAnswer?.answer]);

  // Available categories derived dynamically from policies
  const availableCategories = useMemo(() => {
    const list: Array<{ id: string; label: string; count: number }> = [
      { id: "all", label: "All", count: policies && Array.isArray(policies) ? policies.length : 0 },
    ];

    const counts: Record<string, number> = {};
    if (policies && Array.isArray(policies)) {
      policies.forEach((p: any) => {
        const cat = getPolicyCategory(p);
        counts[cat.id] = (counts[cat.id] || 0) + 1;
      });
    }

    // Always ensure Leaves and Attendance tabs are available
    list.push({ id: "leave", label: "Leaves", count: counts["leave"] || 0 });
    list.push({ id: "attendance", label: "Attendance", count: counts["attendance"] || 0 });

    // Include any other dynamic categories discovered in policies
    if (policies && Array.isArray(policies)) {
      policies.forEach((p: any) => {
        const cat = getPolicyCategory(p);
        if (cat.id !== "leave" && cat.id !== "attendance" && !list.some((c) => c.id === cat.id)) {
          list.push({ id: cat.id, label: cat.label, count: counts[cat.id] || 0 });
        }
      });
    }

    return list;
  }, [policies]);

  // Handle Search Input Change with Auto-Category Detection
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);

    const trimmed = val.trim().toLowerCase();
    if (!trimmed || !policies || !Array.isArray(policies)) return;

    // If a specific category tab is selected
    if (categoryFilter !== "all") {
      const hasMatchInCurrent = policies.some(
        (p: any) => getPolicyCategory(p).id === categoryFilter && matchesSearch(p, trimmed)
      );

      // If current category has 0 matches, but another category does, auto-switch tab!
      if (!hasMatchInCurrent) {
        const globalMatches = policies.filter((p: any) => matchesSearch(p, trimmed));
        if (globalMatches.length > 0) {
          const matchCatIds = Array.from(new Set(globalMatches.map((p: any) => getPolicyCategory(p).id)));
          if (matchCatIds.length === 1) {
            setCategoryFilter(matchCatIds[0]);
          } else {
            setCategoryFilter("all");
          }
        }
      }
    }
  };

  // Handle Category Tab Selection with Search Clearing if Incompatible
  const handleSelectCategory = (catId: string) => {
    setCategoryFilter(catId);
    setCurrentPage(1);

    // If an existing search query has no match in newly selected category, clear search
    if (searchQuery.trim() && catId !== "all" && policies && Array.isArray(policies)) {
      const hasMatch = policies.some(
        (p: any) => getPolicyCategory(p).id === catId && matchesSearch(p, searchQuery.trim())
      );
      if (!hasMatch) {
        setSearchQuery("");
      }
    }
  };

  // Handle Print
  const handlePrint = () => {
    if (!selectedPdf?.url) return;
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.focus();
        iframeRef.current.contentWindow.print();
        return;
      }
    } catch {
      // Cross-origin fallback
    }
    const printWindow = window.open(selectedPdf.url, "_blank");
    if (printWindow) {
      printWindow.addEventListener("load", () => {
        printWindow.print();
      });
    }
  };

  // Handle Ask AI with Session Caching (prevents redundant API calls & token consumption)
  const handleAskAi = async (queryText?: string, forceRefresh = false) => {
    const q = (queryText || aiQuery).trim();
    if (!q) {
      toast.error("Please enter a question");
      return;
    }
    if (queryText) {
      setAiQuery(queryText);
    }

    const cacheKey = normalizeQuery(q);

    // 1. Check Session Cache if not forcing a refresh
    if (!forceRefresh) {
      // Check in-memory map
      const memCached = aiCacheRef.current.get(cacheKey);
      if (memCached) {
        setAiAnswer({
          query: memCached.query,
          answer: memCached.answer,
          sources: memCached.sources || [],
        });
        setIsCurrentAnswerCached(true);
        return;
      }

      // Check sessionStorage
      const sessionCached = getSessionStorageCache()[cacheKey];
      if (sessionCached) {
        aiCacheRef.current.set(cacheKey, sessionCached);
        setCachedKeys((prev) => ({ ...prev, [cacheKey]: true }));
        setAiAnswer({
          query: sessionCached.query,
          answer: sessionCached.answer,
          sources: sessionCached.sources || [],
        });
        setIsCurrentAnswerCached(true);
        return;
      }
    }

    // 2. Cache miss or forced refresh: call API
    setIsCurrentAnswerCached(false);
    try {
      const res = await askPolicyMutation.mutateAsync({ query: q });
      const entry = {
        query: q,
        answer: res.answer,
        sources: res.sources || [],
        timestamp: Date.now(),
      };

      // Store in memory ref and sessionStorage
      aiCacheRef.current.set(cacheKey, entry);
      saveSessionStorageCache(cacheKey, entry);
      setCachedKeys((prev) => ({ ...prev, [cacheKey]: true }));

      setAiAnswer({
        query: q,
        answer: res.answer,
        sources: res.sources || [],
      });
      if (forceRefresh) {
        toast.success("Answer refreshed with latest policy context");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to get policy answer");
    }
  };

  // Copy AI answer to clipboard
  const handleCopyAnswer = () => {
    if (!aiAnswer?.answer) return;
    navigator.clipboard.writeText(aiAnswer.answer);
    setCopied(true);
    toast.success("Answer copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  // Filtered & Paginated Policies with Cross-Category Search Fallback
  const { filteredPolicies, searchNotice } = useMemo(() => {
    if (!policies || !Array.isArray(policies)) {
      return { filteredPolicies: [], searchNotice: null };
    }

    const trimmed = searchQuery.trim().toLowerCase();

    // 1. If category filter is "all", filter by search query across all policies
    if (categoryFilter === "all") {
      const result = trimmed ? policies.filter((p: any) => matchesSearch(p, trimmed)) : policies;
      return { filteredPolicies: result, searchNotice: null };
    }

    // 2. Filter within the selected category
    const inCategoryPolicies = policies.filter(
      (p: any) => getPolicyCategory(p).id === categoryFilter
    );
    const inCategoryMatches = trimmed
      ? inCategoryPolicies.filter((p: any) => matchesSearch(p, trimmed))
      : inCategoryPolicies;

    if (inCategoryMatches.length > 0) {
      return { filteredPolicies: inCategoryMatches, searchNotice: null };
    }

    // 3. Fallback: If 0 matches in current category, but matches exist in other categories:
    if (trimmed) {
      const globalMatches = policies.filter((p: any) => matchesSearch(p, trimmed));
      if (globalMatches.length > 0) {
        const currentTab = availableCategories.find((c) => c.id === categoryFilter);
        const currentLabel = currentTab ? currentTab.label : "selected category";
        const otherCat = getPolicyCategory(globalMatches[0]);

        return {
          filteredPolicies: globalMatches,
          searchNotice: {
            currentLabel,
            matchCount: globalMatches.length,
            suggestedCatId: otherCat.id,
            suggestedCatLabel: otherCat.label,
          },
        };
      }
    }

    // 4. Truly 0 matches anywhere
    return { filteredPolicies: [], searchNotice: null };
  }, [policies, categoryFilter, searchQuery, availableCategories]);

  const totalPages = Math.max(1, Math.ceil(filteredPolicies.length / POLICIES_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * POLICIES_PER_PAGE;
  const paginatedPolicies = filteredPolicies.slice(startIndex, startIndex + POLICIES_PER_PAGE);

  return (
    <div className="w-full space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <PageHeader
        eyebrow="Company Knowledge"
        title="Policies & Guidelines"
        description="Official company policies, compliance documents, and intelligent AI assistant."
      />

      {/* AI Copilot Card */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/[0.07] via-background to-emerald-500/[0.04] p-5 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 border border-primary/20 shadow-xs">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-foreground">
                  Policy AI Assistant
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-primary/10 text-primary border border-primary/20">
                  RAG Powered
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Ask any question answered directly with citations from our official PDF policies.
              </p>
            </div>
          </div>
        </div>

        {/* Search / Ask AI Input Bar */}
        <div className="relative flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAskAi();
              }}
              placeholder="e.g. How many days in advance should I apply for vacation?"
              className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-border bg-background/90 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/60 shadow-xs"
            />
            {aiQuery && (
              <button
                type="button"
                onClick={() => setAiQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button
            onClick={() => handleAskAi()}
            disabled={askPolicyMutation.isPending || !aiQuery.trim()}
            className="h-10 px-4 gap-2 font-medium shrink-0 shadow-xs"
          >
            {askPolicyMutation.isPending ? (
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Ask AI</span>
          </Button>
        </div>

        {/* Suggested Questions Pills */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Suggested questions from company PDFs:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((item, idx) => {
              const itemKey = normalizeQuery(item.query);
              const isCached = !!cachedKeys[itemKey];
              const isActive = aiAnswer?.query && normalizeQuery(aiAnswer.query) === itemKey;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAskAi(item.query)}
                  className={`group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all hover:shadow-xs active:scale-98 ${
                    isActive
                      ? "bg-primary/10 border-primary text-foreground shadow-xs font-semibold ring-1 ring-primary/25"
                      : "bg-background/80 hover:bg-background border-border/80 hover:border-primary/40 text-foreground/90"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                  {isCached && (
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"
                      title="Answer cached in session (instant)"
                    />
                  )}
                  <ArrowRight
                    className={`w-3 h-3 transition-all ${
                      isActive
                        ? "text-primary opacity-100"
                        : "text-muted-foreground opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Answer Display */}
        {askPolicyMutation.isPending && (
          <div className="mt-5 p-4 rounded-xl bg-card border border-primary/20 space-y-3 animate-pulse">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <Sparkles className="w-4 h-4 animate-spin" />
              Consulting official policy documents...
            </div>
            <div className="h-4 bg-muted/60 rounded-md w-3/4" />
            <div className="h-4 bg-muted/60 rounded-md w-5/6" />
            <div className="h-4 bg-muted/60 rounded-md w-2/3" />
          </div>
        )}

        {aiAnswer && !askPolicyMutation.isPending && (
          <div className="mt-5 rounded-xl border border-primary/20 bg-card p-5 space-y-4 shadow-sm animate-in fade-in duration-200">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-border/60">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Policy Copilot Answer
                    </h4>
                    {isCurrentAnswerCached && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <Zap className="w-2.5 h-2.5 text-emerald-500 fill-emerald-500" />
                        Cached
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-foreground italic mt-0.5 truncate max-w-xl">
                    &ldquo;{aiAnswer.query}&rdquo;
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAskAi(aiAnswer.query, true)}
                  disabled={askPolicyMutation.isPending}
                  className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
                  title="Ask again (re-query AI without cache)"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${askPolicyMutation.isPending ? "animate-spin" : ""}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyAnswer}
                  className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAiAnswer(null)}
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Answer Content */}
            <div className="text-sm leading-relaxed text-foreground/95 whitespace-pre-line space-y-2">
              {parsedAnswer.cleanAnswer}
            </div>

            {/* Structured Insight Card if present */}
            {parsedAnswer.insightCard && (
              <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                  <Info className="w-4 h-4 text-primary" />
                </div>
                <div className="space-y-1 min-w-0">
                  {parsedAnswer.insightCard.title && (
                    <h5 className="text-xs font-bold text-foreground">
                      {parsedAnswer.insightCard.title}
                    </h5>
                  )}
                  {parsedAnswer.insightCard.message && (
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {parsedAnswer.insightCard.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Document Sources */}
            {aiAnswer.sources && aiAnswer.sources.length > 0 && (
              <div className="pt-3 border-t border-border/50 flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  Sources Cited:
                </span>
                {aiAnswer.sources.map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      // Find matching policy file from list
                      const match = policies?.find((p: any) => p.title === src.title || p.id === src.file_id);
                      const url = src.file_url || match?.file_url || match?.file;
                      if (url) {
                        setSelectedPdf({
                          url,
                          title: src.title,
                          id: src.file_id || match?.id,
                        });
                        setIsViewOpen(true);
                      } else {
                        toast.info(`Source: ${src.title}`);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-muted/50 hover:bg-muted text-foreground border border-border/60 hover:border-primary/40 transition-all"
                  >
                    <FileText className="w-3 h-3 text-primary" />
                    <span>{src.title}</span>
                    {src.page_number && <span className="text-[10px] text-muted-foreground">(p. {src.page_number})</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Policies Document Library Section */}
      <div className="space-y-4">
        {/* Section Header & Search/Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
          <div>
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              Company Policy Library
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Browse, view in fullscreen, or print official company policies.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search policies..."
                className="pl-8 pr-7 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary w-full sm:w-56"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-xl border border-border/80 overflow-x-auto max-w-full">
              {availableCategories.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleSelectCategory(tab.id)}
                  className={`px-3.5 py-1.5 text-xs rounded-lg font-medium transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    categoryFilter === tab.id
                      ? "bg-background text-foreground shadow-xs font-semibold border border-border/40"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        categoryFilter === tab.id
                          ? "bg-muted font-bold text-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cross-Category Search Fallback Notice */}
        {searchNotice && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:px-4 rounded-xl bg-primary/10 border border-primary/20 text-xs text-foreground animate-fade-in shadow-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary shrink-0 animate-pulse" />
              <span>
                No policies match &ldquo;<strong>{searchQuery}</strong>&rdquo; in <strong>{searchNotice.currentLabel}</strong>. Showing{" "}
                <strong>{searchNotice.matchCount}</strong> result{searchNotice.matchCount > 1 ? "s" : ""} from other categories.
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCategoryFilter(searchNotice.suggestedCatId);
                  setCurrentPage(1);
                }}
                className="h-7 px-2.5 text-xs bg-background hover:bg-muted font-medium shadow-xs"
              >
                Switch to {searchNotice.suggestedCatLabel}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCategoryFilter("all");
                  setCurrentPage(1);
                }}
                className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground"
              >
                View All
              </Button>
            </div>
          </div>
        )}

        {/* Policy Cards Grid */}
        {isLoading && !policies ? (
          <PageSkeleton variant="inline" />
        ) : filteredPolicies.length === 0 ? (
          searchQuery ? (
            <div className="text-center p-10 text-muted-foreground border rounded-2xl bg-card space-y-2">
              <FileText className="w-8 h-8 text-muted-foreground/60 mx-auto" />
              <h4 className="text-sm font-semibold text-foreground">No policies found</h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No policies match your search term "{searchQuery}".
              </p>
              <div className="flex items-center justify-center gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("all");
                    setCurrentPage(1);
                  }}
                  className="h-8 text-xs mt-2"
                >
                  Clear Search & Reset Filters
                </Button>
              </div>
            </div>
          ) : (
            <EmptyState
              src="/images/empty/empty-payslip.webp"
              title="No company policies found"
              description="Official company policies, compliance documents, and employee handbooks will appear here."
              size="wide"
            />
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedPolicies.map((policy: any) => {
              const fileUrl = policy.file_url || policy.file;
              const formattedDate = moment(policy.created_at).format("MMM D, YYYY");
              const sizeMb = policy.file_size ? (policy.file_size / 1024 / 1024).toFixed(2) + " MB" : null;
              const category = getPolicyCategory(policy);

              return (
                <div
                  key={policy.id}
                  className="group relative bg-card rounded-2xl p-5 border border-border/80 hover:border-primary/40 transition-all duration-200 flex flex-col justify-between hover:shadow-sm"
                >
                  <div>
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 group-hover:scale-105 transition-transform">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h3
                            className="font-semibold text-sm leading-tight text-foreground truncate"
                            title={policy.title}
                          >
                            {policy.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-muted-foreground/70" />
                              {formattedDate}
                            </span>
                            {sizeMb && (
                              <span className="text-[11px] text-muted-foreground font-mono">
                                · {sizeMb}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="rounded-md px-2 py-0.5 text-[10px] font-medium tracking-wide bg-primary/10 text-primary border border-primary/20">
                          {category.label}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-4">
                      {policy.description || "Official company document for organizational governance and operational procedures."}
                    </p>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="h-8 text-xs font-medium px-3.5 gap-1.5"
                      onClick={() => {
                        setSelectedPdf({
                          url: fileUrl,
                          title: policy.title,
                          id: policy.id,
                        });
                        setIsFullscreen(false);
                        setIsViewOpen(true);
                      }}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      View document
                    </Button>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs px-2.5 gap-1 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          handleAskAi(`What are the key rules and guidelines stated in the ${policy.title}?`);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        title={`Ask AI about ${policy.title}`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                        <span className="hidden sm:inline">Ask AI</span>
                      </Button>

                      {fileUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          onClick={() => window.open(fileUrl, "_blank")}
                          title="Open PDF in new tab"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Footer */}
        {filteredPolicies.length > POLICIES_PER_PAGE && (
          <div className="pt-4 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{startIndex + 1}</span> to{" "}
              <span className="font-semibold text-foreground">
                {Math.min(startIndex + POLICIES_PER_PAGE, filteredPolicies.length)}
              </span>{" "}
              of <span className="font-semibold text-foreground">{filteredPolicies.length}</span> documents
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="h-8 px-2.5 text-xs gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                        safePage === pageNum
                          ? "bg-primary text-primary-foreground font-bold shadow-xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent hover:border-border"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="h-8 px-2.5 text-xs gap-1"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Redesigned Document Viewer Dialog with Fullscreen & Print */}
      <Dialog
        open={isViewOpen}
        onOpenChange={(open) => {
          setIsViewOpen(open);
          if (!open) setIsFullscreen(false);
        }}
      >
        <DialogContent
          showCloseButton={false}
          className={
            isFullscreen
              ? "!fixed !inset-0 !top-0 !left-0 !translate-x-0 !translate-y-0 !w-screen !h-screen !max-w-none !max-h-none !rounded-none z-[250] flex flex-col p-0 border-0 bg-background shadow-none"
              : "fixed top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 bottom-auto max-w-6xl w-[94vw] h-[88dvh] sm:h-[86vh] max-h-[92dvh] flex flex-col p-0 overflow-hidden rounded-2xl border border-border/80 shadow-2xl z-[201]"
          }
        >
          {/* Header with Unified Aligned Toolbar (No Overlap) */}
          <DialogHeader className="p-4 sm:p-5 pb-3 border-b border-border/70 bg-card flex flex-row items-center justify-between gap-3 shrink-0">
            <DialogTitle className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm sm:text-base text-foreground truncate max-w-[200px] sm:max-w-md">
                  {selectedPdf?.title || "Policy Document"}
                </span>
                <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Official Company Document
                </span>
              </div>
            </DialogTitle>

            {/* Unified Action Toolbar */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Print Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="h-8 px-2.5 sm:px-3 text-xs gap-1.5 text-foreground hover:bg-muted font-medium"
                title="Print this policy"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Print</span>
              </Button>

              {/* Fullscreen Toggle Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="h-8 px-2.5 sm:px-3 text-xs gap-1.5 text-foreground hover:bg-muted font-medium"
                title={isFullscreen ? "Exit full screen" : "Expand to full screen"}
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Exit Fullscreen</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Fullscreen</span>
                  </>
                )}
              </Button>

              {/* Open in New Tab Button */}
              {selectedPdf?.url && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(selectedPdf.url, "_blank")}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  title="Open in new window"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              )}

              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsViewOpen(false);
                  setIsFullscreen(false);
                }}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors ml-1"
                title="Close viewer"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* Document Content Viewport */}
          <div className="grow bg-[#525659] relative overflow-hidden flex items-center justify-center">
            {selectedPdf?.url ? (
              <iframe
                ref={iframeRef}
                id="policy-pdf-iframe"
                src={`${selectedPdf.url}#toolbar=0&navpanes=0`}
                className="w-full h-full border-none bg-white"
                title={selectedPdf.title}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-white/80 space-y-2">
                <div className="w-10 h-10 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <p className="text-xs">Loading document...</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
