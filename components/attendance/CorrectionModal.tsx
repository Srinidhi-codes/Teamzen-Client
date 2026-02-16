"use client";

import { useState } from "react";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/ui/button";
import {
    X,
    Calendar,
    Clock,
    ArrowRight,
    History,
    FileText,
    Zap,
    CheckCircle2,
    Info
} from "lucide-react";
import moment from "moment";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export type AttendanceRow = {
    id: string;
    attendanceDate: string;
    loginTime?: string | null;
    logoutTime?: string | null;
    correctionReason?: string | null;
};

type Props = {
    record: AttendanceRow;
    onClose: () => void;
    onSubmit?: (data: CorrectionPayload) => Promise<void> | void;
};

export type CorrectionPayload = {
    attendanceRecordId: string;
    correctedLoginTime: string;
    correctedLogoutTime: string;
    reason: string;
};

export function CorrectionModal({ record, onClose, onSubmit }: Props) {
    const [form, setForm] = useState<CorrectionPayload>({
        attendanceRecordId: record.id,
        correctedLoginTime: record.loginTime ?? "",
        correctedLogoutTime: record.logoutTime ?? "",
        reason: record.correctionReason ?? "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const update = (key: keyof CorrectionPayload, value: string) => {
        setForm((p) => ({ ...p, [key]: value }));
        setErrors((e) => ({ ...e, [key]: "" }));
    };

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.correctedLoginTime) e.correctedLoginTime = "Required";
        if (!form.correctedLogoutTime) e.correctedLogoutTime = "Required";
        if (!form.reason || form.reason.length < 10)
            e.reason = "Min 10 characters";

        if (form.correctedLoginTime && form.correctedLogoutTime) {
            const l = moment(`2000-01-01T${form.correctedLoginTime}`);
            const o = moment(`2000-01-01T${form.correctedLogoutTime}`);
            if (o.isSameOrBefore(l)) e.correctedLogoutTime = "Must be after entry";
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const submit = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            await onSubmit?.(form);
            // onClose(); // Removed onClose from try block as per new code
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-card rounded-[3rem] w-full max-w-2xl shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] border border-border overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
                {/* Header */}
                <div className="relative p-10 pb-8 border-b bg-linear-to-br from-primary/10 via-background to-background text-primary">
                    <div className="absolute top-0 right-0 p-10 opacity-10">
                        <History className="w-32 h-32 rotate-12" />
                    </div>
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <h2 className="text-black text-4xl font-black tracking-tighter leading-none mb-3">
                                Attendance Correction
                            </h2>
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-sm border border-white/10">
                                    #{record.id.slice(-8)}
                                </span>
                                <p className="text-primary text-[10px] font-black uppercase tracking-widest">Attendance Adjustment</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 text-gray-500 hover:text-red-500 hover:scale-110 transition-all duration-300 flex items-center justify-center active:scale-90"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="p-10 space-y-10 overflow-y-auto max-h-[60vh] custom-scrollbar">
                    {/* Record Info */}
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                <Calendar className="w-3 h-3 text-primary" /> Attendance Date
                            </label>
                            <p className="text-lg font-black">{moment(record.attendanceDate).format("MMMM DD, YYYY")}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                Original Data
                            </label>
                            <div className="flex items-center gap-3 text-sm font-bold opacity-60">
                                <span className="tabular-nums">{record.loginTime || "N/A"}</span>
                                <ArrowRight className="w-3 h-3" />
                                <span className="tabular-nums">{record.logoutTime || "N/A"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-muted/30 p-8 rounded-4xl border border-border/50">
                        <div className="space-y-2">
                            <label className="text-premium-label ml-1">Corrected Login Time</label>
                            <div className="relative">
                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                                <input
                                    type="time"
                                    step="1"
                                    value={form.correctedLoginTime}
                                    onChange={(e) => update("correctedLoginTime", e.target.value)}
                                    className={`input pl-12 ${errors.correctedLoginTime ? 'border-destructive' : ''}`}
                                />
                            </div>
                            {errors.correctedLoginTime && <p className="text-[9px] font-black text-destructive uppercase tracking-widest ml-1">{errors.correctedLoginTime}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-premium-label ml-1">Corrected Logout Time</label>
                            <div className="relative">
                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                                <input
                                    type="time"
                                    step="1"
                                    value={form.correctedLogoutTime}
                                    onChange={(e) => update("correctedLogoutTime", e.target.value)}
                                    className={`input pl-12 ${errors.correctedLogoutTime ? 'border-destructive' : ''}`}
                                />
                            </div>
                            {errors.correctedLogoutTime && <p className="text-[9px] font-black text-destructive uppercase tracking-widest ml-1">{errors.correctedLogoutTime}</p>}
                        </div>
                    </div>

                    {/* Rationale */}
                    <div className="space-y-3">
                        <label className="text-premium-label ml-1 flex items-center gap-2">
                            <FileText className="w-3 h-3 text-primary" /> Reason
                        </label>
                        <textarea
                            rows={3}
                            value={form.reason}
                            onChange={(e) => update("reason", e.target.value)}
                            className={`textarea min-h-[120px] ${errors.reason ? 'border-destructive' : ''}`}
                            placeholder="Provide a detailed explanation for this attendance correction..."
                        />
                        {errors.reason && <p className="text-[9px] font-black text-destructive uppercase tracking-widest ml-1">{errors.reason}</p>}
                    </div>

                    <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 flex gap-4">
                        <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">
                            Submission of this adjustment initiates an <span className="text-primary font-bold italic">Attendance Correction</span>.
                            HQ will review the attendance markers against original attendance logs.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-10 border-t border-border bg-muted/10 flex justify-end gap-4">
                    <Button variant="outline" onClick={onClose} className="px-10 h-14 rounded-2xl font-black text-[11px] uppercase tracking-widest">
                        Cancel
                    </Button>
                    <Button
                        onClick={submit}
                        disabled={loading}
                        className="btn-primary px-12 h-14 rounded-2xl shadow-xl shadow-primary/20"
                    >
                        {loading ? <LoadingSpinner /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                        Submit Correction
                    </Button>
                </div>
            </div>
        </div>
    );
}
