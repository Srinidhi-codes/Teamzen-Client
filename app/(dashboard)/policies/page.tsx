"use client"
import { useState } from "react";
import { usePolicies } from "@/lib/api/hooks";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/components/common/PageHeader";

import { Loader2, FileText, Maximize2, RotateCcw } from "lucide-react";
import moment from "moment";

export default function PoliciesPage() {
    const { policies, isLoading } = usePolicies();

    const [isViewOpen, setIsViewOpen] = useState(false);
    const [selectedPdf, setSelectedPdf] = useState<{ url: string; title: string } | null>(null);
    const [zoom, setZoom] = useState(1);

    return (
        <div className="p-4 sm:p-6 space-y-6 animate-fade-in">
            <PageHeader
                title="Policies"
                description="Company policies and reference documents."
                actions={
                    <button
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center gap-2 h-9 px-3 bg-muted/50 hover:bg-primary/10 hover:text-primary border border-border rounded-md text-sm font-medium transition-colors"
                        title="Refresh"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Refresh
                    </button>
                }
            />

            {isLoading ? (
                <div className="flex flex-col items-center justify-center p-12 space-y-3">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Loading…</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {policies?.map((policy: any) => (
                        <div key={policy.id} className="group bg-card rounded-xl p-6 border border-border hover:border-primary/20 transition-colors flex flex-col min-h-[200px]">
                            <div className="flex flex-col h-full">
                                <div className="flex justify-between items-start mb-4 gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-base leading-tight mb-1 line-clamp-1">{policy.title}</h3>
                                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                <span>{moment(policy.created_at).format("MMM D, YYYY")}</span>
                                                <span className="w-1 h-1 rounded-full bg-border" />
                                                <span>{policy.file_size ? (policy.file_size / 1024 / 1024).toFixed(2) + ' MB' : '0 MB'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-medium capitalize shrink-0 ${policy.is_processed ? 'bg-emerald-500/10 text-emerald-600' : 'bg-orange-500/10 text-orange-600'}`}>
                                        {policy.is_processed ? 'Ready' : 'Processing'}
                                    </span>
                                </div>

                                {policy.description ? (
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                        {policy.description}
                                    </p>
                                ) : (
                                    <div className="grow" />
                                )}

                                <div className="mt-auto flex justify-between items-center pt-4 border-t border-border/50">
                                    <button
                                        onClick={() => {
                                            setSelectedPdf({
                                                url: policy.file_url || policy.file,
                                                title: policy.title
                                            });
                                            setIsViewOpen(true);
                                            setZoom(1);
                                        }}
                                        className="text-sm font-medium text-primary hover:text-primary/80"
                                    >
                                        View document
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {!isLoading && policies?.length === 0 && (
                        <div className="col-span-full text-center p-8 text-muted-foreground border border-dashed rounded-xl bg-muted/20">
                            No policies uploaded yet.
                        </div>
                    )}
                </div>
            )}

            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="max-w-7xl w-[95vw] h-[90vh] sm:h-[85vh] flex flex-col p-0 overflow-hidden rounded-xl border shadow-lg">
                    <DialogHeader className="p-4 sm:p-6 pb-4 border-b bg-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <DialogTitle className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="font-semibold truncate max-w-[200px] sm:max-w-sm">{selectedPdf?.title}</span>
                                <span className="text-xs text-muted-foreground">Document</span>
                            </div>
                        </DialogTitle>

                        <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-md self-end sm:self-auto">
                            <button
                                onClick={() => {
                                    if (selectedPdf?.url) window.open(selectedPdf.url, '_blank')
                                }}
                                className="w-9 h-9 rounded-md hover:bg-background flex items-center justify-center transition-all"
                                title="Open in new tab"
                            >
                                <Maximize2 className="w-4 h-4" />
                            </button>
                        </div>
                    </DialogHeader>
                    <div className="grow bg-[#525659] relative overflow-auto custom-scrollbar flex items-center justify-center p-4">
                        {selectedPdf?.url ? (
                            <div
                                className="origin-top transition-transform duration-200 shadow-lg bg-white w-full h-full min-h-[500px]"
                                style={{
                                    transform: `scale(${zoom})`,
                                    height: `${100 / zoom}%`,
                                    width: `${100 / zoom}%`
                                }}
                            >
                                <iframe
                                    src={`${selectedPdf.url}#toolbar=0&navpanes=0&scrollbar=0`}
                                    className="w-full h-full border-none"
                                    title={selectedPdf.title}
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                                <Loader2 className="w-6 h-6 animate-spin" />
                                <p className="text-sm">Loading…</p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
