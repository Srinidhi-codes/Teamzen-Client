import { Card } from "@/components/common/Card";
import { EditableField } from "@/components/common/EditableField";
import { EditableSelectField } from "@/components/common/EditableSelectField";
import { UserFormData } from "./types";

interface EmploymentTabProps {
    formData: Partial<UserFormData>;
    isEditing: boolean;
    handleInputChange: (field: keyof UserFormData, value: string) => void;
    errors: Record<string, string>;
    user: any;
}

export function EmploymentTab({
    formData,
    isEditing,
    handleInputChange,
    errors,
    user,
}: EmploymentTabProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Employment Details" hover gradient>
                <div className="grid grid-rows-2 grid-cols-2 gap-6">
                    <EditableField
                        label="Employee ID"
                        value={formData.employee_id || ""}
                        icon="🆔"
                        editable={isEditing}
                        onChange={(value) => handleInputChange("employee_id", value)}
                        error={errors.employee_id}
                        placeholder="EMP-001"
                    />
                    <EditableField
                        label="Designation"
                        value={formData.designation || ""}
                        icon="💼"
                        editable={isEditing}
                        onChange={(value) => handleInputChange("designation", value)}
                        error={errors.designation}
                        placeholder="Software Engineer"
                    />
                    <EditableField
                        label="Department"
                        value={formData.department || ""}
                        icon="🏢"
                        editable={isEditing}
                        onChange={(value) => handleInputChange("department", value)}
                        error={errors.department}
                        placeholder="Engineering"
                    />
                    <EditableSelectField
                        label="Employment Type"
                        value={formData.employment_type || "full_time"}
                        icon="📋"
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
                        value={formData.date_of_joining || ""}
                        icon="📅"
                        type="date"
                        editable={isEditing}
                        onChange={(value) => handleInputChange("date_of_joining", value)}
                        error={errors.date_of_joining}
                    />
                    <EditableField
                        label="Manager"
                        value={formData.manager || ""}
                        icon="👔"
                        editable={isEditing}
                        onChange={(value) => handleInputChange("manager", value)}
                        error={errors.manager}
                        placeholder="Manager's Name"
                    />
                </div>
            </Card>

            <Card title="Work Statistics" hover gradient>
                <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-700">
                                Attendance Rate
                            </span>
                            <span className="text-2xl font-bold text-green-600">94.5%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full"
                                style={{ width: "94.5%" }}
                            ></div>
                        </div>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-700">
                                Leave Balance
                            </span>
                            <span className="text-2xl font-bold text-blue-600">12 days</span>
                        </div>
                        <p className="text-xs text-gray-600">Out of 20 annual leaves</p>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-700">
                                Tenure
                            </span>
                            <span className="text-2xl font-bold text-purple-600">
                                {user.date_of_joining
                                    ? Math.floor(
                                        (new Date().getTime() -
                                            new Date(user.date_of_joining).getTime()) /
                                        (1000 * 60 * 60 * 24 * 365)
                                    )
                                    : 0}{" "}
                                years
                            </span>
                        </div>
                        <p className="text-xs text-gray-600">
                            Since{" "}
                            {user.date_of_joining
                                ? new Date(user.date_of_joining).toLocaleDateString()
                                : "N/A"}
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
