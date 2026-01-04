import { Card } from "@/components/common/Card";
import { EditableField } from "@/components/common/EditableField";
import { UserFormData } from "./types";

interface FinancialTabProps {
    formData: Partial<UserFormData>;
    isEditing: boolean;
    handleInputChange: (field: keyof UserFormData, value: string) => void;
    errors: Record<string, string>;
    user: any;
}

export function FinancialTab({
    formData,
    isEditing,
    handleInputChange,
    errors,
    user,
}: FinancialTabProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Bank Details" hover gradient>
                <div className="space-y-4">
                    <EditableField
                        label="Bank Account Number"
                        value={formData.bank_account_number || ""}
                        icon="🏦"
                        editable={isEditing}
                        onChange={(value) =>
                            handleInputChange("bank_account_number", value)
                        }
                        error={errors.bank_account_number}
                        sensitive
                        placeholder="Account Number"
                    />
                    <EditableField
                        label="IFSC Code"
                        value={formData.bank_ifsc_code || ""}
                        icon="🔢"
                        editable={isEditing}
                        onChange={(value) =>
                            handleInputChange("bank_ifsc_code", value.toUpperCase())
                        }
                        error={errors.bank_ifsc_code}
                        placeholder="e.g., SBIN0001234"
                    />
                    {!user.bank_account_number && (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                            <p className="text-sm text-yellow-800 flex items-center">
                                <svg
                                    className="w-5 h-5 mr-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                                Please add your bank details to receive salary payments
                            </p>
                        </div>
                    )}
                </div>
            </Card>

            <Card title="Tax Information" hover gradient>
                <div className="space-y-4">
                    <EditableField
                        label="PAN Number"
                        value={formData.pan_number || ""}
                        icon="🆔"
                        editable={isEditing}
                        onChange={(value) =>
                            handleInputChange("pan_number", value.toUpperCase())
                        }
                        error={errors.pan_number}
                        sensitive
                        placeholder="e.g., ABCDE1234F"
                    />
                    <EditableField
                        label="Aadhar Number"
                        value={formData.aadhar_number || ""}
                        icon="🪪"
                        editable={isEditing}
                        onChange={(value) => handleInputChange("aadhar_number", value)}
                        error={errors.aadhar_number}
                        sensitive
                        placeholder="12-digit number"
                    />
                    <EditableField
                        label="UAN Number"
                        value={formData.uan_number || ""}
                        icon="📋"
                        editable={isEditing}
                        onChange={(value) => handleInputChange("uan_number", value)}
                        error={errors.uan_number}
                        placeholder="Universal Account Number"
                    />
                    {(!user.pan_number || !user.aadhar_number) && (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                            <p className="text-sm text-yellow-800 flex items-center">
                                <svg
                                    className="w-5 h-5 mr-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                                Tax documents are required for payroll processing
                            </p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
