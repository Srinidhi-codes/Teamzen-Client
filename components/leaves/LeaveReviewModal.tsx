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
        </PremiumModal>
    );
}
