import { EditableField } from "@/components/common/EditableField";
import { ProfileSection } from "./ProfileSection";
import { UserFormData } from "./types";
import { AlertTriangle, BanknoteIcon, Hash, IdCard } from "lucide-react";

interface FinancialTabProps {
    formData: Partial<UserFormData>;
    isEditing: boolean;
    handleInputChange: (field: keyof UserFormData, value: string) => void;
    errors: Record<string, string>;
    user: any;
}

function Notice({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3.5 py-3 text-sm text-amber-800 dark:text-amber-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{children}</p>
        </div>
    );
}

export function FinancialTab({
    formData,
    isEditing,
    handleInputChange,
    errors,
    user,
}: FinancialTabProps) {
    const hasBank = !!(user.bankAccountNumber || user.bank_account_number || formData.bank_account_number);
    const hasPan = !!(user.panNumber || user.pan_number || formData.pan_number);
    const hasAadhar = !!(user.aadharNumber || user.aadhar_number || formData.aadhar_number);

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ProfileSection
                title="Bank details"
                icon={BanknoteIcon}
                description="Used for salary transfers"
            >
                <div className="space-y-3">
                    <EditableField
                        label="Bank Account Number"
                        value={formData.bank_account_number || ""}
                        icon={<BanknoteIcon />}
                        editable={isEditing}
                        onChange={(value) => handleInputChange("bank_account_number", value)}
                        error={errors.bank_account_number}
                        sensitive
                        placeholder="Account Number"
                    />
                    <EditableField
                        label="IFSC Code"
                        value={formData.bank_ifsc_code || ""}
                        icon={<Hash />}
                        editable={isEditing}
                        onChange={(value) => handleInputChange("bank_ifsc_code", value.toUpperCase())}
                        error={errors.bank_ifsc_code}
                        placeholder="e.g., SBIN0001234"
                    />
                    {!hasBank && (
                        <Notice>Add your bank details to receive salary payments.</Notice>
                    )}
                </div>
            </ProfileSection>

            <ProfileSection
                title="Tax information"
                icon={IdCard}
                description="Required for payroll processing"
            >
                <div className="space-y-3">
                    <EditableField
                        label="PAN Number"
                        value={formData.pan_number || ""}
                        icon={<IdCard />}
                        editable={isEditing}
                        onChange={(value) => handleInputChange("pan_number", value.toUpperCase())}
                        error={errors.pan_number}
                        sensitive
                        placeholder="e.g., ABCDE1234F"
                    />
                    <EditableField
                        label="Aadhar Number"
                        value={formData.aadhar_number || ""}
                        icon={<IdCard />}
                        editable={isEditing}
                        onChange={(value) => handleInputChange("aadhar_number", value)}
                        error={errors.aadhar_number}
                        sensitive
                        placeholder="12-digit number"
                    />
                    <EditableField
                        label="UAN Number"
                        value={formData.uan_number || ""}
                        icon={<Hash />}
                        editable={isEditing}
                        onChange={(value) => handleInputChange("uan_number", value)}
                        error={errors.uan_number}
                        placeholder="Universal Account Number"
                    />
                    {(!hasPan || !hasAadhar) && (
                        <Notice>PAN and Aadhar are required for payroll processing.</Notice>
                    )}
                </div>
            </ProfileSection>
        </div>
    );
}
