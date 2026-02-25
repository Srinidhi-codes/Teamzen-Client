"use client";

import React from "react";
import moment from "moment";
import {
    X,
    FileText,
    Calendar,
    ArrowRight,
    Info,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/common/Badge";

interface LeaveReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    viewDetails: any;
    getStatusVariant: (status: string) => "success" | "warning" | "danger" | "info";
}

export function LeaveReviewModal({
    isOpen,
    onClose,
    viewDetails,
    getStatusVariant,
}: LeaveReviewModalProps) {
    if (!viewDetails) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="p-0 border-none bg-transparent shadow-none min-w-fit w-full">
                <div className="bg-card rounded-[3rem] w-full shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] border border-border overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
                    <div className="relative p-10 pb-8 bg-linear-to-br from-primary/20 via-primary/5 to-background text-primary">
                        <div className="absolute top-0 right-0 p-10 opacity-10">
                            <FileText className="w-32 h-32 rotate-12" />
                        </div>
                        <div className="relative z-10 flex justify-between items-start">
                            <div>
                                <h2 className="text-4xl text-black font-black tracking-tighter italic leading-none mb-3">
                                    Request Leave
                                </h2>
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-sm border border-white/10">
                                        #{viewDetails.id.slice(-8)}
                                    </span>
                                    <p className="text-primary-foreground/60 text-[10px] font-black uppercase tracking-widest">Leave Request</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-10 space-y-10">
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Leave Type</label>
                                <p className="text-lg font-black italic text-primary">{viewDetails.leaveType.name}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Duration</label>
                                <p className="text-lg font-black tabular-nums">{viewDetails.durationDays}</p>
                            </div>
                            <div className="space-y-1">
                                <Badge variant={getStatusVariant(viewDetails.status)}>{viewDetails.status}</Badge>
                            </div>
                        </div>

                        <div className="space-y-2 bg-muted/30 p-6 rounded-3xl border border-border/50 max-w-fit">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                <Calendar className="w-3 h-3 text-primary" /> Duration
                            </label>
                            <p className="text-sm font-black text-foreground tracking-widest uppercase flex items-center gap-3">
                                {moment(viewDetails.fromDate).format("MMMM DD")}
                                <ArrowRight className="w-4 h-4 text-primary opacity-30" />
                                {moment(viewDetails.toDate).format("MMMM DD, YYYY")}
                            </p>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                <Info className="w-3 h-3 text-primary" /> Reason
                            </label>
                            <p className="text-sm font-medium text-foreground/80 leading-relaxed italic border-l-4 border-primary/20 pl-6">
                                "{viewDetails.reason}"
                            </p>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button variant="secondary" onClick={onClose} className="px-10">
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
