"use client";

import React from "react";
import moment from "moment";
import {
    FileText,
    Calendar,
    ArrowRight,
    Info,
} from "lucide-react";
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
            title="Leave details"
            subtitle={`Request #${viewDetails.id.slice(-8)}`}
            icon={FileText}
        >
            <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-1">
                        <label className="text-sm text-muted-foreground">Leave type</label>
                        <p className="text-base font-medium text-foreground">{viewDetails.leaveType.name}</p>
                    </div>
                    <div className="space-y-1 border-l sm:border-l-0 sm:pl-0 pl-4 border-border">
                        <label className="text-sm text-muted-foreground">Duration</label>
                        <p className="text-base font-medium tabular-nums">
                            {viewDetails.durationDays} day{viewDetails.durationDays !== 1 ? 's' : ''}
                            {viewDetails.halfDayPeriod && viewDetails.halfDayPeriod !== 'full_day' && (
                                <span className="ml-2 text-xs text-muted-foreground">
                                    ({viewDetails.halfDayPeriod.replace('_', ' ')})
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="space-y-1 flex flex-col items-start">
                        <label className="text-sm text-muted-foreground mb-1">Status</label>
                        <Badge variant={getStatusVariant(viewDetails.status)}>{viewDetails.status}</Badge>
                    </div>
                </div>

                <div className="space-y-2 bg-muted/30 p-4 rounded-xl border border-border w-full sm:w-fit">
                    <label className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" /> Dates
                    </label>
                    <p className="text-sm font-medium text-foreground flex flex-wrap items-center gap-2">
                        {moment(viewDetails.fromDate).format("DD MMM YYYY")}
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        {moment(viewDetails.toDate).format("DD MMM YYYY")}
                    </p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm text-muted-foreground flex items-center gap-2">
                        <Info className="w-3.5 h-3.5" /> Reason
                    </label>
                    <p className="text-sm text-foreground/80 leading-relaxed border-l-2 border-border pl-4">
                        {viewDetails.reason}
                    </p>
                </div>

                <div className="flex justify-end pt-2">
                    <Button variant="secondary" onClick={onClose} className="h-9 rounded-md px-6 text-sm font-medium">
                        Close
                    </Button>
                </div>
            </div>
        </PremiumModal>
    );
}
