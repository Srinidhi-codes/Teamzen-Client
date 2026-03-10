"use client";

import { useState } from "react";
import {
    X,
    Calendar,
    Clock,
    ArrowRight,
    CheckCircle2,
    Info,
    Loader2,

} from "lucide-react";
import moment from "moment";
import { FormTextarea } from "../common/FormTextArea";
import { FormInput } from "../common/FormInput";
import { PremiumModal } from "../common/PremiumModal";

export type AttendanceRow = {
    id: string;
    attendanceDate: string;
    actualLoginTime?: string | null;
    actualLogoutTime?: string | null;
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
    const formatDate = (dateStr: string) => moment(dateStr).format("dddd, MMMM DD, YYYY");
    const formatTime = (timeStr?: string | null) => timeStr ? moment(timeStr, "HH:mm:ss").format("hh:mm A") : "--:--";

    return (
        <PremiumModal
            isOpen={true}
            onClose={onClose}
            title="Attendance Correction"
            subtitle={`Requesting Protocol Adjustment for ${moment(record.attendanceDate).format("MMMM DD, YYYY")}`}
            badge="ADJUSTMENT REQUEST"
            icon={Calendar}
        >
            <div className="space-y-8">
                {/* Body */}
                <div className="p-6 sm:p-8 space-y-6 sm:space-y-8 overflow-y-auto overflow-x-hidden custom-scrollbar">
                    {/* Comparison Engine */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 relative">
                        {/* Connecting Arrow */}
                        <div className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card border border-border shadow-sm items-center justify-center z-10 text-muted-foreground/60">
                            <ArrowRight className="w-5 h-5" />
                        </div>

                        <div className="bg-red-300/5 p-5 sm:p-6 rounded-3xl sm:rounded-4xl border border-red-500/30 shadow-sm transition-all duration-300">

                            <h3 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-3 sm:mb-4 ml-1">Original Records</h3>
                            <div className="space-y-3 sm:space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-red-500 uppercase">Check In</span>
                                    <span className="text-xs sm:text-sm font-black text-red-500">{formatTime(record.actualLoginTime)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-red-500 uppercase">Check Out</span>
                                    <span className="text-xs sm:text-sm font-black text-red-500">{formatTime(record.actualLogoutTime)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-emerald-300/5 p-5 sm:p-6 rounded-3xl sm:rounded-4xl border border-emerald-500/30 transition-all duration-300">

                            <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3 sm:mb-4 ml-1">Proposed Correction</h3>
                            <div className="space-y-3 sm:space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-emerald-500/60 uppercase">Check In</span>
                                    <span className="text-xs sm:text-sm font-black text-emerald-500">{formatTime(form.correctedLoginTime)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-emerald-500/60 uppercase">Check Out</span>
                                    <span className="text-xs sm:text-sm font-black text-emerald-500">{formatTime(form.correctedLogoutTime)}</span>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 bg-muted/30 p-6 sm:p-8 rounded-3xl sm:rounded-4xl border border-border/50">
                        <div className="space-y-2">
                            <FormInput
                                label="Corrected Login"
                                type="time"
                                step="1"
                                value={form.correctedLoginTime}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => update("correctedLoginTime", e.target.value)}
                                className={`input h-12 transition-all ${errors.correctedLoginTime ? 'border-destructive' : ''}`}
                            />
                            {errors.correctedLoginTime && <p className="text-[9px] font-black text-destructive uppercase tracking-widest ml-1">{errors.correctedLoginTime}</p>}
                        </div>

                        <div className="space-y-2">
                            <FormInput
                                label="Corrected Logout"
                                type="time"
                                step="1"
                                value={form.correctedLogoutTime}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => update("correctedLogoutTime", e.target.value)}
                                className={`input h-12 transition-all ${errors.correctedLogoutTime ? 'border-destructive' : ''}`}
                            />
                            {errors.correctedLogoutTime && <p className="text-[9px] font-black text-destructive uppercase tracking-widest ml-1">{errors.correctedLogoutTime}</p>}
                        </div>
                    </div>

                    {/* Reason Section */}
                    <div className="space-y-3">
                        <FormTextarea
                            label="Reason"
                            rows={3}
                            value={form.reason}
                            onChange={(e) => update("reason", e.target.value)}
                            placeholder="Provide reason"
                        />
                        {errors.reason && <p className="text-[9px] font-black text-destructive uppercase tracking-widest ml-1">{errors.reason}</p>}
                    </div>
                    <div className="p-4 sm:p-6 rounded-2xl bg-primary/5 border border-primary/20 flex gap-3 sm:gap-4">
                        <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <p className="text-[10px] sm:text-[11px] font-medium text-muted-foreground leading-relaxed">
                            Adjustment submission initiates a <span className="text-primary font-bold italic underline decoration-primary/30">Protocol Review</span>.
                            Markers will be verified against system original logs.
                        </p>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-10">
                    <button
                        onClick={onClose}
                        className="btn-outline h-12 px-8 font-black text-[10px] uppercase tracking-widest order-2 sm:order-1"
                        disabled={loading}
                    >
                        Dismiss
                    </button>
                    <button
                        onClick={submit}
                        disabled={loading}
                        className="btn-primary h-12 px-10 gap-2 font-black text-[10px] uppercase tracking-widest order-1 sm:order-2 shadow-xl shadow-primary/20"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Submit Correction
                    </button>
                </div>
            </div>
        </PremiumModal>
    );
}
