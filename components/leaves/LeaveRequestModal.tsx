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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

                    <div className="grid grid-cols-2 gap-4">
                        <DatePickerSimple
                            label="Start Phase"
                            value={formData.fromDate}
                            onChange={(date) => setFormData({ ...formData, fromDate: moment(date).format("YYYY-MM-DD") })}
                            error={errors.fromDate}
                        />
                        <DatePickerSimple
                            label="End Phase"
                            value={formData.toDate}
                            onChange={(date) => setFormData({ ...formData, toDate: moment(date).format("YYYY-MM-DD") })}
                            error={errors.toDate}
                        />
                    </div>
                </div>

                {calculateDays() > 0 && (
                    <div className="p-6 rounded-3xl bg-primary/5 border border-primary/20 flex items-center justify-between animate-in zoom-in-95">
                        <div className="space-y-1">
                            <p className="text-premium-label text-primary">Calculated Duration</p>
                            <p className="text-2xl font-black">{calculateDays()} Operational Days</p>
                        </div>
                        <CheckCircle2 className="w-10 h-10 text-primary opacity-20" />
                    </div>
                )}

                {overlappingLeaves.length > 0 && (
                    <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-4 animate-in slide-in-from-top-4 duration-500">
                        <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-1" />
                        <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">Team Availability Alert</p>
                            <p className="text-xs font-medium text-amber-900/80 leading-relaxed">
                                <span className="font-bold">Coordination Note:</span> {overlappingLeaves.length} team {overlappingLeaves.length === 1 ? 'member is' : 'members are'} also on leave during this period:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {overlappingLeaves.map((leave: any) => (
                                    <span key={leave.id} className="px-3 py-1 bg-amber-500/20 rounded-full text-[10px] font-black text-amber-700 border border-amber-500/20">
                                        {leave.user.firstName} {leave.user.lastName || ''}
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

                <div className="p-6 rounded-3xl bg-muted/30 border border-border/50 flex items-start gap-4">
                    <Info className="w-6 h-6 text-primary shrink-0 mt-1" />
                    <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                        Submission of this request triggers a validation sequence with the regional head.
                        Ensure your <span className="text-primary font-bold">Leave Policy</span> supports the requested units.
                    </p>
                </div>

                <div className="flex justify-end pt-4 gap-4">
                    <Button variant="outline" type="button" onClick={onClose} className="px-10 h-14 rounded-2xl font-black text-[11px] uppercase tracking-widest">
                        Cancel
                    </Button>
                    <Button type="submit" className="btn-primary px-12 h-14 rounded-2xl shadow-xl shadow-primary/20" disabled={isLoading}>
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        Submit Request
                    </Button>
                </div>
            </form>
        </PremiumModal>
    );
}
