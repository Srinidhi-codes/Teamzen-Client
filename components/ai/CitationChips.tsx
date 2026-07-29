"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import type { PolicySource } from "@/lib/api/assistant";
import { PolicyPdfDialog } from "./PolicyPdfDialog";

interface CitationChipsProps {
    sources: PolicySource[];
}

function dedupeSources(sources: PolicySource[]): PolicySource[] {
    const seen = new Set<string>();
    const result: PolicySource[] = [];
    for (const src of sources) {
        const key = `${src.file_id ?? src.title}-${src.page_number ?? "x"}`;
        if (seen.has(key)) continue;
        seen.add(key);
        result.push(src);
    }
    return result;
}

export function CitationChips({ sources }: CitationChipsProps) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<{ url: string; title: string; page?: number | null } | null>(null);

    const unique = dedupeSources(sources).filter((s) => s.title);
    if (unique.length === 0) return null;

    return (
        <>
            <div className="flex flex-wrap gap-2 pt-1">
                {unique.map((src, idx) => {
                    const label =
                        src.page_number != null
                            ? `${src.title} · p.${src.page_number}`
                            : src.title;
                    const canOpen = Boolean(src.file_url);
                    return (
                        <button
                            key={`${src.file_id}-${src.page_number}-${idx}`}
                            type="button"
                            disabled={!canOpen}
                            onClick={() => {
                                if (!src.file_url) return;
                                setSelected({
                                    url: src.file_url,
                                    title: src.title,
                                    page: src.page_number,
                                });
                                setOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-700 transition-colors hover:bg-emerald-500/15 disabled:cursor-default disabled:opacity-60 dark:text-emerald-400"
                            title={canOpen ? "Open source document" : "Document URL unavailable"}
                        >
                            <FileText className="h-3 w-3 shrink-0" />
                            <span className="max-w-[200px] truncate">{label}</span>
                        </button>
                    );
                })}
            </div>
            <PolicyPdfDialog
                open={open}
                onOpenChange={setOpen}
                url={selected?.url}
                title={selected?.title}
                page={selected?.page}
            />
        </>
    );
}
