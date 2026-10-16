"use client";

import React from "react";
import moment from "moment";
import {
    FileText,
    CheckCircle2,
    Info,
    Loader2,
    AlertTriangle,
    AlertCircle,
    XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/common/FormSelect";
import { DatePickerSimple } from "@/components/ui/datePicker";
import { Textarea } from "@/components/ui/textarea";

import { PremiumModal } from "@/components/common/PremiumModal";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store/useStore";

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
    myLeavesData?: any[];
    serverError?: string | null;
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
    myLeavesData = [],
    serverError,
}: LeaveRequestModalProps) {
    const { user } = useStore();

    // Weekend days according to organization setting (0: Mon ... 5: Sat, 6: Sun). Defaults to Saturday & Sunday [5, 6].
    const orgWeekendDays: number[] = React.useMemo(() => {
        const raw = user?.organization?.weekendDays;
        if (Array.isArray(raw) && raw.length > 0) {
            return raw;
        }
        return [5, 6];
    }, [user?.organization?.weekendDays]);

    // Analyze if the selected range touches or falls entirely on weekends
    const weekendAnalysis = React.useMemo(() => {
        if (!formData.fromDate || !formData.toDate) {
            return { isAllWeekend: false, hasWeekend: false, weekendDaysCount: 0, weekendDayNames: [] as string[], totalDays: 0 };
        }
        const from = moment(formData.fromDate).startOf("day");
        const to = moment(formData.toDate).startOf("day");
        if (to.isBefore(from)) {
            return { isAllWeekend: false, hasWeekend: false, weekendDaysCount: 0, weekendDayNames: [], totalDays: 0 };
        }

        const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        let totalDays = 0;
        let weekendCount = 0;
        const weekendNamesSet = new Set<string>();

        const curr = from.clone();
        while (curr.isSameOrBefore(to)) {
            totalDays++;
            const pyWeekday = curr.isoWeekday() - 1; // 0=Mon ... 5=Sat, 6=Sun
            if (orgWeekendDays.includes(pyWeekday)) {
                weekendCount++;
                weekendNamesSet.add(DAY_NAMES[pyWeekday] || curr.format("dddd"));
            }
            curr.add(1, "days");
        }

        const isAllWeekend = totalDays > 0 && weekendCount === totalDays;
        const hasWeekend = weekendCount > 0;
        const weekendDayNames = Array.from(weekendNamesSet);

        return {
            isAllWeekend,
            hasWeekend,
            weekendDaysCount: weekendCount,
            weekendDayNames,
            totalDays,
        };
    }, [formData.fromDate, formData.toDate, orgWeekendDays]);

    // 1. Balance calculations & soft error check
    const selectedBalance = React.useMemo(() => {
        if (!formData.leaveTypeId || !leaveBalanceData?.length) return null;
        return leaveBalanceData.find(
            (b: any) => String(b.leaveType?.id) === String(formData.leaveTypeId)
        );
    }, [formData.leaveTypeId, leaveBalanceData]);

    const availableBalance = selectedBalance ? Number(selectedBalance.availableBalance ?? 0) : null;
    const requestedDuration = calculateDays();

    // Soft error: duration exceeds the remaining available balance
    const isInsufficientBalance = Boolean(
        selectedBalance &&
        requestedDuration > 0 &&
        availableBalance !== null &&
        requestedDuration > availableBalance
    );

    // 2. Check if the user already applied for an active leave on these dates (duplicate / overlap)
    const myOverlappingLeave = React.useMemo(() => {
        if (!formData.fromDate || !formData.toDate || !myLeavesData?.length) return null;

        const start = moment(formData.fromDate).startOf("day");
        const end = moment(formData.toDate).startOf("day");

        return myLeavesData.find((leave: any) => {
            const status = (leave.status || "").toLowerCase();
            // Active requests: pending or approved
            if (status !== "pending" && status !== "approved") return false;

            const leaveStart = moment(leave.fromDate).startOf("day");
            const leaveEnd = moment(leave.toDate).startOf("day");
            return leaveStart.isSameOrBefore(end) && leaveEnd.isSameOrAfter(start);
        });
    }, [formData.fromDate, formData.toDate, myLeavesData]);

    // 3. Team overlap check (informational)
    const overlappingLeaves = React.useMemo(() => {
        if (!formData.fromDate || !formData.toDate || !teamLeavesData?.length) return [];

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
        >
            <form onSubmit={onSubmit} className="space-y-6">
                {/* Server Error Soft Banner (e.g., from GraphQL exception or network error) */}
                {serverError && (
                    <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 flex items-start gap-3 text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
                        <XCircle className="w-5 h-5 shrink-0 mt-0.5 text-destructive" />
                        <div className="space-y-1 flex-1">
                            <p className="text-sm font-semibold text-destructive">Submission Failed</p>
                            <p className="text-xs text-destructive/90 leading-relaxed">{serverError}</p>
                        </div>
                    </div>
                )}

                {/* Soft Error: User Already Applied For These Dates */}
                {myOverlappingLeave && (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-900 dark:text-amber-200 animate-in fade-in slide-in-from-top-1 duration-200">
                        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div className="space-y-1 flex-1">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                                    Already Applied For These Dates
                                </p>
                                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300">
                                    {myOverlappingLeave.status}
                                </span>
                            </div>
                            <p className="text-xs text-amber-800/90 dark:text-amber-200/90 leading-relaxed">
                                You already have a <strong>{myOverlappingLeave.status}</strong> request for <strong>{myOverlappingLeave.leaveType?.name || 'Leave'}</strong> from{" "}
                                <strong>{moment(myOverlappingLeave.fromDate).format("MMM DD, YYYY")}</strong> to{" "}
                                <strong>{moment(myOverlappingLeave.toDate).format("MMM DD, YYYY")}</strong>. Overlapping leave requests are not permitted.
                            </p>
                        </div>
                    </div>
                )}

                {/* Soft Error: Insufficient Leave Balance */}
                {isInsufficientBalance && (
                    <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/25 flex items-start gap-3 text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-destructive" />
                        <div className="space-y-1.5 flex-1">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold text-destructive">
                                    Insufficient Leave Balance
                                </p>
                                <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-destructive/15 text-destructive">
                                    Shortfall: {(requestedDuration - (availableBalance ?? 0)).toFixed(1)} day{(requestedDuration - (availableBalance ?? 0)) !== 1 ? 's' : ''}
                                </span>
                            </div>
                            <p className="text-xs text-destructive/90 leading-relaxed">
                                You are requesting <strong>{requestedDuration} day{requestedDuration !== 1 ? 's' : ''}</strong>, but only have <strong>{availableBalance ?? 0} day{(availableBalance ?? 0) !== 1 ? 's' : ''}</strong> available for <strong>{selectedBalance?.leaveType?.name || 'this category'}</strong>. Please adjust your dates or choose another leave category.
                            </p>
                        </div>
                    </div>
                )}

                {/* Soft Warning: Selected Dates Fall Entirely on Weekend */}
                {weekendAnalysis.isAllWeekend && (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-900 dark:text-amber-200 animate-in fade-in slide-in-from-top-1 duration-200">
                        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div className="space-y-1 flex-1">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                                    Weekend Selected ({weekendAnalysis.weekendDayNames.join(" & ")})
                                </p>
                                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300">
                                    Weekly Off
                                </span>
                            </div>
                            <p className="text-xs text-amber-800/90 dark:text-amber-200/90 leading-relaxed">
                                The selected date{weekendAnalysis.totalDays > 1 ? "s fall" : " falls"} on your organization's non-working weekend ({weekendAnalysis.weekendDayNames.join(", ")}). You do not need to apply for leave on weekly offs.
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <FormSelect
                        label="Leave Type"
                        value={formData.leaveTypeId}
                        onValueChange={(value) => setFormData({ ...formData, leaveTypeId: value })}
                        placeholder="Select leave type"
                        options={leaveBalanceData?.map((b: any) => ({
                            label: `${b.leaveType.name} (${Number(b.availableBalance || 0)} days available)`,
                            value: b.leaveType.id
                        })) || []}
                        error={errors.leaveTypeId || (isInsufficientBalance ? `Exceeds available balance (${availableBalance} days)` : undefined)}
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

                {/* Duration Display Box with Live Balance Context */}
                {requestedDuration > 0 && (
                    <div className={cn(
                        "p-4 rounded-xl border flex items-center justify-between transition-colors",
                        isInsufficientBalance
                            ? "bg-destructive/5 border-destructive/30"
                            : "bg-primary/5 border-primary/20"
                    )}>
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                                <p className="text-sm text-muted-foreground">Requested Duration</p>
                                {selectedBalance && (
                                    <span className={cn(
                                        "text-xs font-medium",
                                        isInsufficientBalance ? "text-destructive" : "text-muted-foreground"
                                    )}>
                                        • {availableBalance} days available
                                    </span>
                                )}
                            </div>
                            <p className={cn(
                                "text-xl font-semibold tabular-nums",
                                isInsufficientBalance ? "text-destructive" : "text-foreground"
                            )}>
                                {requestedDuration} day{requestedDuration !== 1 ? 's' : ''}
                            </p>
                            {weekendAnalysis.hasWeekend && (
                                <p className="text-xs text-muted-foreground pt-1 flex items-center gap-1.5">
                                    <Info className="w-3.5 h-3.5 text-primary shrink-0" />
                                    Excludes {weekendAnalysis.weekendDaysCount} weekend day{weekendAnalysis.weekendDaysCount !== 1 ? 's' : ''} ({weekendAnalysis.weekendDayNames.join(", ")}) per policy
                                </p>
                            )}
                        </div>
                        {isInsufficientBalance ? (
                            <AlertCircle className="w-6 h-6 text-destructive/70" />
                        ) : (
                            <CheckCircle2 className="w-6 h-6 text-primary/40" />
                        )}
                    </div>
                )}

                {/* Team Overlap (Warning only) */}
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
                    <Button
                        type="submit"
                        className="h-9 rounded-md btn-primary px-6 text-sm font-medium order-1 sm:order-2"
                        disabled={isLoading || isInsufficientBalance || !!myOverlappingLeave || weekendAnalysis.isAllWeekend}
                    >
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        {isInsufficientBalance
                            ? "Insufficient balance"
                            : myOverlappingLeave
                            ? "Leave already applied"
                            : weekendAnalysis.isAllWeekend
                            ? "Weekend dates selected"
                            : "Request leave"}
                    </Button>
                </div>
            </form>
        </PremiumModal>
    );
}
