"use client";

import { useState } from "react";
import {
    Calendar,
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
            if (o.isSameOrBefore(l)) e.correctedLogoutTime = "Must be after check-in";
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const submit = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            await onSubmit?.(form);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (timeStr?: string | null) => timeStr ? moment(timeStr, "HH:mm:ss").format("hh:mm A") : "—";

    return (
        <PremiumModal
            isOpen={true}
            onClose={onClose}
            title="Attendance correction"
            subtitle={`Request a change for ${moment(record.attendanceDate).format("MMMM DD, YYYY")}`}
            badge="Correction request"
            icon={Calendar}
        >
            <div className="space-y-8">
                <div className="p-6 sm:p-8 space-y-6 sm:space-y-8 overflow-y-auto overflow-x-hidden custom-scrollbar">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 relative">
                        <div className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card border border-border shadow-sm items-center justify-center z-10 text-muted-foreground/60">
                            <ArrowRight className="w-5 h-5" />
                        </div>

                        <div className="bg-red-300/5 p-5 sm:p-6 rounded-xl border border-red-500/30">
                            <h3 className="text-xs font-medium text-red-600 mb-3 sm:mb-4 ml-1">Recorded times</h3>
                            <div className="space-y-3 sm:space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-red-600">Check in</span>
                                    <span className="text-sm font-semibold text-red-600">{formatTime(record.actualLoginTime)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-red-600">Check out</span>
                                    <span className="text-sm font-semibold text-red-600">{formatTime(record.actualLogoutTime)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-emerald-300/5 p-5 sm:p-6 rounded-xl border border-emerald-500/30">
                            <h3 className="text-xs font-medium text-emerald-600 mb-3 sm:mb-4 ml-1">Requested times</h3>
                            <div className="space-y-3 sm:space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-emerald-600/80">Check in</span>
                                    <span className="text-sm font-semibold text-emerald-600">{formatTime(form.correctedLoginTime)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-emerald-600/80">Check out</span>
                                    <span className="text-sm font-semibold text-emerald-600">{formatTime(form.correctedLogoutTime)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 bg-muted/30 p-6 sm:p-8 rounded-xl border border-border/50">
                        <div className="space-y-2">
                            <FormInput
                                label="Corrected check in"
                                type="time"
                                step="1"
                                value={form.correctedLoginTime}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => update("correctedLoginTime", e.target.value)}
                                className={`input h-9 transition-all ${errors.correctedLoginTime ? 'border-destructive' : ''}`}
                            />
                            {errors.correctedLoginTime && <p className="text-xs text-destructive ml-1">{errors.correctedLoginTime}</p>}
                        </div>

                        <div className="space-y-2">
                            <FormInput
                                label="Corrected check out"
                                type="time"
                                step="1"
                                value={form.correctedLogoutTime}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => update("correctedLogoutTime", e.target.value)}
                                className={`input h-9 transition-all ${errors.correctedLogoutTime ? 'border-destructive' : ''}`}
                            />
                            {errors.correctedLogoutTime && <p className="text-xs text-destructive ml-1">{errors.correctedLogoutTime}</p>}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <FormTextarea
                            label="Reason"
                            rows={3}
                            value={form.reason}
                            onChange={(e) => update("reason", e.target.value)}
                            placeholder="Explain why this correction is needed"
                        />
                        {errors.reason && <p className="text-xs text-destructive ml-1">{errors.reason}</p>}
                    </div>
                    <div className="p-4 sm:p-6 rounded-xl bg-primary/5 border border-primary/20 flex gap-3 sm:gap-4">
                        <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Your request will be reviewed by your manager. Times may be checked against system logs.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-6">
                    <button
                        onClick={onClose}
                        className="btn-outline h-9 px-6 rounded-md text-sm font-medium order-2 sm:order-1"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={submit}
                        disabled={loading}
                        className="btn-primary h-9 px-6 rounded-md gap-2 text-sm font-medium order-1 sm:order-2"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Submit request
                    </button>
                </div>
            </div>
        </PremiumModal>
    );
}
