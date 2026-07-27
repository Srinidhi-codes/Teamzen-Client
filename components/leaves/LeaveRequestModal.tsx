"use client";

import React from "react";
import moment from "moment";
import {
    FileText,
    CheckCircle2,
    Info,
    Loader2,
    AlertTriangle
} from "lucide-react";
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
            title="Request leave"
            subtitle="Submit a new leave request for approval"
            badge="New request"
            icon={FileText}
        >
            <form onSubmit={onSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <FormSelect
                        label="Leave Type"
                        value={formData.leaveTypeId}
                        onValueChange={(value) => setFormData({ ...formData, leaveTypeId: value })}
                        placeholder="Select leave type"
                        options={leaveBalanceData?.map((b: any) => ({
                            label: `${b.leaveType.name} (${Number(b.availableBalance || 0)} days)`,
                            value: b.leaveType.id
                        })) || []}
                        error={errors.leaveTypeId}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <DatePickerSimple
                            label="Start date"
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
                            label="End date"
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
                    <div>
                        <FormSelect
                            label="Half day"
                            value={formData.halfDayPeriod}
                            onValueChange={(value) => setFormData({ ...formData, halfDayPeriod: value })}
                            placeholder="Select portion"
                            options={[
                                { label: "Full day", value: "full_day" },
                                { label: "First half (morning)", value: "first_half" },
                                { label: "Second half (afternoon)", value: "second_half" },
                            ]}
                        />
                    </div>
                )}

                {calculateDays() > 0 && (
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between">
                        <div className="space-y-0.5">
                            <p className="text-sm text-muted-foreground">Duration</p>
                            <p className="text-xl font-semibold tabular-nums">{calculateDays()} day{calculateDays() !== 1 ? 's' : ''}</p>
                        </div>
                        <CheckCircle2 className="w-6 h-6 text-primary/30" />
                    </div>
                )}

                {overlappingLeaves.length > 0 && (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Team overlap</p>
                            <p className="text-sm text-amber-900/80 dark:text-amber-100/80 leading-relaxed">
                                {overlappingLeaves.length} colleague{overlappingLeaves.length === 1 ? '' : 's'} also on leave during this period:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {overlappingLeaves.map((leave: any) => (
                                    <span key={leave.id} className="px-2 py-0.5 bg-amber-500/20 rounded-md text-[11px] font-medium text-amber-700 border border-amber-500/10">
                                        {leave.user.firstName}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-medium ml-1">Reason</label>
                    <Textarea
                        value={formData.reason}
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                        placeholder="Enter reason (minimum 10 characters)..."
                    />
                    {errors.reason && <p className="text-xs font-medium text-destructive ml-1">{errors.reason}</p>}
                </div>

                <div className="p-4 rounded-xl bg-muted/30 border border-border flex items-start gap-3">
                    <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Your request will be sent to your manager for approval. Please check your leave balance before submitting.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row justify-end pt-2 gap-3">
                    <Button variant="outline" type="button" onClick={onClose} className="h-9 rounded-md px-6 text-sm font-medium order-2 sm:order-1">
                        Cancel
                    </Button>
                    <Button type="submit" className="h-9 rounded-md btn-primary px-6 text-sm font-medium order-1 sm:order-2" disabled={isLoading}>
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        Request leave
                    </Button>
                </div>
            </form>
        </PremiumModal>
    );
}
