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
} from "lucide-react";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/common/FormSelect";
import { DatePickerSimple } from "@/components/ui/datePicker";
import { Textarea } from "@/components/ui/textarea";

interface LeaveRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    formData: any;
    setFormData: (data: any) => void;
    onSubmit: (e: React.FormEvent) => void;
    leaveBalanceData: any[];
    isLoading: boolean;
    calculateDays: () => number;
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
}: LeaveRequestModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="p-0 border-none bg-transparent shadow-none w-full min-w-fit">
                <div className="bg-card rounded-[3rem] w-full shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] border border-border overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
                    <div className="relative p-10 pb-8 bg-linear-to-br from-primary/20 via-primary/5 to-background text-primary">
                        <div className="absolute top-0 right-0 p-10 opacity-10">
                            <FileText className="w-32 h-32 rotate-12" />
                        </div>
                        <div className="relative z-10 flex justify-between items-start">
                            <div>
                                <h2 className="text-4xl font-black text-black tracking-tighter leading-none mb-3">
                                    Initiate Leave
                                </h2>
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-sm border border-white/10">
                                        NEW REQUEST
                                    </span>
                                    <p className="text-primary-foreground/60 text-[10px] font-black uppercase tracking-widest">Leave Protocol</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-10 overflow-y-auto max-h-[70vh]">
                        <form onSubmit={onSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FormSelect
                                    label="Leave Type"
                                    value={formData.leaveTypeId}
                                    onValueChange={(value) => setFormData({ ...formData, leaveTypeId: value })}
                                    placeholder="Select Category"
                                    options={leaveBalanceData?.map((b: any) => ({
                                        label: `${b.leaveType.name} (${Number(b.totalEntitled) + Number(b.carried_forward) - Number(b.used) - Number(b.pendingApproval)} units)`,
                                        value: b.leaveType.id
                                    })) || []}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <DatePickerSimple
                                        label="Start Phase"
                                        value={formData.fromDate}
                                        onChange={(date) => setFormData({ ...formData, fromDate: moment(date).format("YYYY-MM-DD") })}
                                    />
                                    <DatePickerSimple
                                        label="End Phase"
                                        value={formData.toDate}
                                        onChange={(date) => setFormData({ ...formData, toDate: moment(date).format("YYYY-MM-DD") })}
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

                            <div className="space-y-2">
                                <label className="text-premium-label ml-1">Reason</label>
                                <Textarea
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    placeholder="Enter detailed reason (min 10 chars)..."
                                />
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
                                    {isLoading && <Loader2 />}
                                    Submit Request
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
