"use client";

import { FileText, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface PolicyPdfDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    url?: string | null;
    title?: string | null;
    page?: number | null;
}

export function PolicyPdfDialog({ open, onOpenChange, url, title, page }: PolicyPdfDialogProps) {
    const pageHash = page != null ? `page=${page}` : "toolbar=0";
    const src = url ? `${url}#${pageHash}` : undefined;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="fixed top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 bottom-auto flex h-[85dvh] max-h-[90dvh] w-[95vw] max-w-5xl flex-col gap-0 overflow-hidden p-0 rounded-2xl border shadow-2xl">
                <DialogHeader className="border-b border-border px-5 py-4 text-left">
                    <DialogTitle className="flex items-center gap-2 text-base">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {title || "Policy document"}
                        {page != null ? (
                            <span className="text-sm font-normal text-muted-foreground">
                                · page {page}
                            </span>
                        ) : null}
                    </DialogTitle>
                    <DialogDescription>Cited policy source</DialogDescription>
                </DialogHeader>
                <div className="relative min-h-0 flex-1 bg-muted/40">
                    {src ? (
                        <iframe
                            src={src}
                            className="h-full w-full border-none"
                            title={title || "Policy document"}
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
