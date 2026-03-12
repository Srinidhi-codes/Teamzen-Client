"use client";

import React from "react";
import moment from "moment";
import {
    X,
    FileText,
    Calendar,
    CheckCircle2,
    Info,
    ChevronRight,
    Loader2,
    AlertTriangle
} from "lucide-react";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/common/FormSelect";
import { DatePickerSimple } from "@/components/ui/datePicker";
import { Textarea } from "@/components/ui/textarea";

import { PremiumModal } from "@/components/common/PremiumModal";

interface LeaveRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    formData: any;
    setFormData: (data: any) => void;
    onSubmit: (e: React.FormEvent) => void;
    leaveBalanceData: any[];
    isLoading: boolean;
    calculateDays: () => number;
    errors?: Record<string, string>;
    teamLeavesData?: any[];
}

export function LeaveRequestModal({
    isOpen,
    onClose,
    formData,
    setFormData,
    onSubmit,
    leaveBalanceData,
    isLoading,
    calculateDays,
    errors = {},
    teamLeavesData = [],
}: LeaveRequestModalProps) {
    const overlappingLeaves = React.useMemo(() => {
        if (!formData.fromDate || !formData.toDate || !teamLeavesData.length) return [];

        const start = moment(formData.fromDate);
        const end = moment(formData.toDate);

        return teamLeavesData.filter((leave: any) => {
            const leaveStart = moment(leave.fromDate);
            const leaveEnd = moment(leave.toDate);
            return leaveStart.isSameOrBefore(end) && leaveEnd.isSameOrAfter(start);
        });
    }, [formData.fromDate, formData.toDate, teamLeavesData]);
    return (
        <PremiumModal
            isOpen={isOpen}
            onClose={onClose}
            title="Initiate Leave"
            subtitle="Leave Protocol"
            badge="NEW REQUEST"
            icon={FileText}
        >
            <form onSubmit={onSubmit} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <FormSelect
                        label="Leave Type"
                        value={formData.leaveTypeId}
                        onValueChange={(value) => setFormData({ ...formData, leaveTypeId: value })}
                        placeholder="Select Category"
                        options={leaveBalanceData?.map((b: any) => ({
                            label: `${b.leaveType.name} (${Number(b.availableBalance || 0)} units)`,
                            value: b.leaveType.id
                        })) || []}
                        error={errors.leaveTypeId}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <DatePickerSimple
                            label="Start Phase"
                            value={formData.fromDate}
                            onChange={(date) => {
                                const newDate = moment(date).format("YYYY-MM-DD");
                                setFormData({
                                    ...formData,
                                    fromDate: newDate,
                                    halfDayPeriod: newDate === formData.toDate ? formData.halfDayPeriod : "full_day"
                                });
                            }}
                            error={errors.fromDate}
                            disablePast
                            maxDate={formData.toDate || undefined}
                        />
                        <DatePickerSimple
                            label="End Phase"
                            value={formData.toDate}
                            onChange={(date) => {
                                const newDate = moment(date).format("YYYY-MM-DD");
                                setFormData({
                                    ...formData,
                                    toDate: newDate,
                                    halfDayPeriod: newDate === formData.fromDate ? formData.halfDayPeriod : "full_day"
                                });
                            }}
                            error={errors.toDate}
                            disablePast
                            minDate={formData.fromDate || undefined}
                        />
                    </div>
                </div>

                {formData.fromDate && formData.toDate && formData.fromDate === formData.toDate && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                        <FormSelect
                            label="Day Allocation"
                            value={formData.halfDayPeriod}
                            onValueChange={(value) => setFormData({ ...formData, halfDayPeriod: value })}
                            placeholder="Select Portion"
                            options={[
                                { label: "Full Operational Day", value: "full_day" },
                                { label: "First Half (Morning)", value: "first_half" },
                                { label: "Second Half (Afternoon)", value: "second_half" },
                            ]}
                        />
                    </div>
                )}

                {calculateDays() > 0 && (
                    <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-primary/5 border border-primary/20 flex items-center justify-between animate-in zoom-in-95">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase text-primary/60 tracking-widest">Calculated Duration</p>
                            <p className="text-xl sm:text-2xl font-black tabular-nums">{calculateDays()} Operational Days</p>
                        </div>
                        <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-primary opacity-20" />
                    </div>
                )}

                {overlappingLeaves.length > 0 && (
                    <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 sm:gap-4 animate-in slide-in-from-top-4 duration-500">
                        <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 shrink-0 mt-1" />
                        <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">Availability Conflict Alert</p>
                            <p className="text-[11px] sm:text-xs font-medium text-amber-900/80 leading-relaxed">
                                <span className="font-bold">Sync Alert:</span> {overlappingLeaves.length} colleague{overlappingLeaves.length === 1 ? '' : 's'} also scheduled for leave during this window:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {overlappingLeaves.map((leave: any) => (
                                    <span key={leave.id} className="px-2 py-1 bg-amber-500/20 rounded-lg text-[10px] font-black text-amber-700 border border-amber-500/10">
                                        {leave.user.firstName}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-premium-label ml-1">Reason</label>
                    <Textarea
                        value={formData.reason}
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                        placeholder="Enter detailed reason (min 10 chars)..."
                    />
                    {errors.reason && <p className="text-[10px] font-bold text-destructive uppercase tracking-widest ml-1">{errors.reason}</p>}
                </div>

                <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-muted/30 border border-border/50 flex items-start gap-3 sm:gap-4">
                    <Info className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0 mt-1" />
                    <p className="text-[11px] sm:text-xs font-medium text-muted-foreground leading-relaxed">
                        Submission triggers an automated validation sequence.
                        Verify <span className="text-primary font-bold">Policy Compliance</span> before proceeding.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row justify-end pt-4 gap-3 sm:gap-4">
                    <Button variant="outline" type="button" onClick={onClose} className="w-full sm:w-auto px-10 h-12 sm:h-14 rounded-xl sm:rounded-2xl font-black text-[11px] uppercase tracking-widest order-2 sm:order-1">
                        Cancel
                    </Button>
                    <Button type="submit" className="w-full sm:w-auto btn-primary px-12 h-12 sm:h-14 rounded-xl sm:rounded-2xl shadow-xl shadow-primary/20 order-1 sm:order-2" disabled={isLoading}>
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        Request Leave
                    </Button>
                </div>
            </form>
        </PremiumModal>
    );
}
