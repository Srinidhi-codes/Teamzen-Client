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

import { PremiumModal } from "@/components/common/PremiumModal";

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
        <PremiumModal
            isOpen={isOpen}
            onClose={onClose}
            title="Request Leave"
            subtitle="Leave Request"
            badge={`#${viewDetails.id.slice(-8)}`}
            icon={FileText}
        >
            <div className="space-y-10">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Leave Type</label>
                        <p className="text-base sm:text-lg font-black italic text-primary">{viewDetails.leaveType.name}</p>
                    </div>
                    <div className="space-y-1 border-l sm:border-l-0 sm:pl-0 pl-4 border-border/50">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Duration</label>
                        <p className="text-base sm:text-lg font-black tabular-nums">
                            {viewDetails.durationDays} Day{viewDetails.durationDays !== 1 ? 's' : ''}
                            {viewDetails.halfDayPeriod && viewDetails.halfDayPeriod !== 'full_day' && (
                                <span className="ml-2 text-[10px] sm:text-xs text-primary/60 italic uppercase tracking-wider">
                                    ({viewDetails.halfDayPeriod.replace('_', ' ')})
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="space-y-1 flex flex-col items-start">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Status</label>
                        <Badge variant={getStatusVariant(viewDetails.status)}>{viewDetails.status}</Badge>
                    </div>
                </div>

                <div className="space-y-2 bg-muted/30 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-border/50 w-full sm:w-fit">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-primary" /> Duration
                    </label>
                    <p className="text-xs sm:text-sm font-black text-foreground uppercase flex flex-wrap items-center gap-2 sm:gap-3">
                        {moment(viewDetails.fromDate).format("DD MMM YY")}
                        <ArrowRight className="w-4 h-4 text-primary opacity-30" />
                        {moment(viewDetails.toDate).format("DD MMM YY")}
                    </p>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <Info className="w-3 h-3 text-primary" /> Reason
                    </label>
                    <p className="text-sm font-medium text-foreground/80 leading-relaxed italic border-l-4 border-primary/20 pl-4 sm:pl-6">
                        "{viewDetails.reason}"
                    </p>
                </div>

                <div className="flex justify-end pt-4">
                    <Button variant="secondary" onClick={onClose} className="w-full sm:w-auto px-10 h-12 rounded-xl sm:rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/5">
                        Close
                    </Button>
                </div>
            </div>
        </PremiumModal>
    );
}
