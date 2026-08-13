import { EditableField } from "@/components/common/EditableField";
import { EditableSelectField } from "@/components/common/EditableSelectField";
import { ProfileSection } from "./ProfileSection";
import { UserFormData } from "./types";
import moment from "moment";
import { Briefcase, Building, Calendar, Clipboard, IdCard, User } from "lucide-react";

interface EmploymentTabProps {
    formData: Partial<UserFormData>;
    isEditing: boolean;
    handleInputChange: (field: keyof UserFormData, value: string) => void;
    errors: Record<string, string>;
    user: any;
}

function StatTile({
    label,
    value,
    hint,
    bar,
}: {
    label: string;
    value: string;
    hint?: string;
    bar?: number;
}) {
    return (
        <div className="rounded-lg bg-muted/50 px-4 py-3.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
            {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
            {typeof bar === "number" ? (
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border">
                    <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.min(100, Math.max(0, bar))}%` }}
                    />
                </div>
            ) : null}
        </div>
    );
}

export function EmploymentTab({
    formData,
    isEditing,
    handleInputChange,
    errors,
    user,
}: EmploymentTabProps) {
    const attendance = Number(user.attendance_rate) || 0;

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <ProfileSection title="Employment details" icon={Briefcase} className="lg:col-span-8">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <EditableField
                        label="Employee ID"
                        value={formData.employee_id || ""}
                        icon={<IdCard />}
                        editable={false}
                        onChange={(value) => handleInputChange("employee_id", value)}
                        error={errors.employee_id}
                        placeholder="EMP-001"
                    />
                    <EditableField
                        label="Designation"
                        value={formData.designation || ""}
                        icon={<Briefcase />}
                        editable={isEditing}
                        onChange={(value) => handleInputChange("designation", value)}
                        error={errors.designation}
                        placeholder="Software Engineer"
                    />
                    <EditableField
                        label="Department"
                        value={formData.department || ""}
                        icon={<Building />}
                        editable={isEditing}
                        onChange={(value) => handleInputChange("department", value)}
                        error={errors.department}
                        placeholder="Engineering"
                    />
                    <EditableSelectField
                        label="Employment Type"
                        value={formData.employment_type || "full_time"}
                        icon={<Clipboard />}
                        editable={isEditing}
                        onChange={(value) => handleInputChange("employment_type", value)}
                        options={[
                            { value: "full_time", label: "Full Time" },
                            { value: "part_time", label: "Part Time" },
                            { value: "contract", label: "Contract" },
                            { value: "intern", label: "Intern" },
                        ]}
                    />
                    <EditableField
                        label="Date of Joining"
                        value={moment(formData.date_of_joining).format("ll") || ""}
                        icon={<Calendar />}
                        type="date"
                        editable={isEditing}
                        onChange={(value) => handleInputChange("date_of_joining", value)}
                        error={errors.date_of_joining}
                    />
                    <EditableField
                        label="Manager"
                        value={formData.manager || ""}
                        icon={<User />}
                        editable={isEditing}
                        onChange={(value) => handleInputChange("manager", value)}
                        error={errors.manager}
                        placeholder="Manager's Name"
                    />
                </div>
            </ProfileSection>

            <ProfileSection title="Work statistics" className="lg:col-span-4">
                <div className="space-y-3">
                    <StatTile
                        label="Attendance rate"
                        value={`${attendance}%`}
                        bar={attendance}
                    />
                    <StatTile
                        label="Leave balance"
                        value={`${user.leave_balance || 0} days`}
                        hint={`Of ${user.total_leave_entitlement || 0} annual leaves`}
                    />
                    <StatTile
                        label="Tenure"
                        value={user.tenure_display || "0m"}
                        hint={
                            user.dateOfJoining
                                ? `Since ${moment(user.dateOfJoining).format("ll")}`
                                : "Join date not set"
                        }
                    />
                </div>
            </ProfileSection>
        </div>
    );
}
