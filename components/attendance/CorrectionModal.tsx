"use client";

import { useState } from "react";

export type AttendanceRow = {
    id: string;
    attendanceDate: string;
    loginTime?: string | null;
    logoutTime?: string | null;
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
    console.log(record, "RECORD")
    const [form, setForm] = useState<CorrectionPayload>({
        attendanceRecordId: record.id,
        correctedLoginTime: record.loginTime ?? "",
        correctedLogoutTime: record.logoutTime ?? "",
        reason: "",
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
            e.reason = "Minimum 10 characters";

        if (form.correctedLoginTime && form.correctedLogoutTime) {
            const l = new Date(`2000-01-01T${form.correctedLoginTime}`);
            const o = new Date(`2000-01-01T${form.correctedLogoutTime}`);
            if (o <= l) e.correctedLogoutTime = "Must be after login time";
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const submit = async () => {
        if (!validate()) return;

        setLoading(true);
        try {
            await onSubmit?.(form);
            onClose();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-xl shadow-xl animate-scale-in text-black">
                {/* Header */}
                <div className="p-5 border-b flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold">Attendance Correction</h2>
                        <p className="text-sm text-gray-500">
                            {new Date(record.attendanceDate).toDateString()}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                    {/* Original */}
                    <div className="bg-gray-50 p-3 rounded-lg text-sm">
                        <p className="font-semibold mb-1">Original</p>
                        <div className="flex justify-between font-mono">
                            <span>{record.loginTime || "--:--:--"}</span>
                            <span>{record.logoutTime || "--:--:--"}</span>
                        </div>
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium">Login</label>
                            <input
                                type="time"
                                step="1"
                                value={form.correctedLoginTime}
                                onChange={(e) => update("correctedLoginTime", e.target.value)}
                                className="w-full"
                            />
                            {errors.correctedLoginTime && (
                                <p className="text-xs text-red-600">{errors.correctedLoginTime}</p>
                            )}
                        </div>

                        <div>
                            <label className="text-sm font-medium">Logout</label>
                            <input
                                type="time"
                                step="1"
                                value={form.correctedLogoutTime}
                                onChange={(e) => update("correctedLogoutTime", e.target.value)}
                                className="w-full"
                            />
                            {errors.correctedLogoutTime && (
                                <p className="text-xs text-red-600">{errors.correctedLogoutTime}</p>
                            )}
                        </div>
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="text-sm font-medium">Reason</label>
                        <textarea
                            rows={3}
                            value={form.reason}
                            onChange={(e) => update("reason", e.target.value)}
                            className="w-full"
                        />
                        {errors.reason && (
                            <p className="text-xs text-red-600">{errors.reason}</p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t flex justify-end gap-3">
                    <button onClick={onClose} className="btn-secondary">
                        Cancel
                    </button>
                    <button
                        onClick={submit}
                        disabled={loading}
                        className="btn-success"
                    >
                        {loading ? "Submitting..." : "Submit"}
                    </button>
                </div>
            </div>
        </div>
    );
}
