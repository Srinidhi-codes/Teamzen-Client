import { Card } from "@/components/common/Card";
import { EditableField } from "@/components/common/EditableField";
import { EditableSelectField } from "@/components/common/EditableSelectField";
import { UserFormData } from "./types";
import moment from "moment";
import { CheckCircle, CircleXIcon } from "lucide-react";

interface PersonalTabProps {
    formData: Partial<UserFormData>;
    isEditing: boolean;
    handleInputChange: (field: keyof UserFormData, value: string) => void;
    errors: Record<string, string>;
    user: any;
}

export function PersonalTab({
    formData,
    isEditing,
    handleInputChange,
    errors,
    user,
}: PersonalTabProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Basic Information" hover gradient>
                <div className="grid grid-rows-2 grid-cols-2 gap-6">
                    <EditableField
                        label="First Name"
                        value={formData.first_name || ""}
                        icon="👤"
                        editable={isEditing}
                        onChange={(value) => handleInputChange("first_name", value)}
                        error={errors.first_name}
                        required
                        placeholder="John"
                    />
                    <EditableField
                        label="Last Name"
                        value={formData.last_name || ""}
                        icon="👤"
                        editable={isEditing}
                        onChange={(value) => handleInputChange("last_name", value)}
                        error={errors.last_name}
                        required
                        placeholder="Doe"
                    />
                    <EditableField
                        label="Username"
                        value={formData.username || ""}
                        icon="@"
                        editable={isEditing}
                        onChange={(value) => handleInputChange("username", value)}
                        error={errors.username}
                        required
                        placeholder="johndoe"
                    />
                    <EditableField
                        label="Email"
                        value={formData.email || ""}
                        icon="📧"
                        type="email"
                        editable={isEditing}
                        onChange={(value) => handleInputChange("email", value)}
                        error={errors.email}
                        required
                        placeholder="john@example.com"
                    />
                    <EditableField
                        label="Phone Number"
                        value={formData.phone_number || ""}
                        icon="📱"
                        type="tel"
                        editable={isEditing}
                        onChange={(value) => handleInputChange("phone_number", value)}
                        error={errors.phone_number}
                        placeholder="10-digit number"
                    />
                    <EditableField
                        label="Date of Birth"
                        value={moment(formData.date_of_birth || "").format("ll")}
                        icon="🎂"
                        type="date"
                        editable={isEditing}
                        onChange={(value) => handleInputChange("date_of_birth", value)}
                        error={errors.date_of_birth}
                    />
                    <EditableSelectField
                        label="Gender"
                        value={formData.gender || ""}
                        icon="⚧"
                        editable={isEditing}
                        onChange={(value) => handleInputChange("gender", value)}
                        options={[
                            { value: "", label: "Not specified" },
                            { value: "male", label: "Male" },
                            { value: "female", label: "Female" },
                            { value: "other", label: "Other" },
                        ]}
                    />
                </div>
            </Card>

            <Card title="Contact & Location" hover gradient>
                <div className="space-y-4">
                    <EditableField
                        label="Office Location"
                        value={formData.office_location || ""}
                        icon="📍"
                        editable={isEditing}
                        onChange={(value) => handleInputChange("office_location", value)}
                        error={errors.office_location}
                        placeholder="e.g. New York HQ"
                    />
                    <div className="p-4 bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                            Account Status
                        </p>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Active</span>
                                <span
                                    className={`badge ${user.is_active ? "badge-success" : "badge-danger"
                                        }`}
                                >
                                    {user.is_active ? <CheckCircle className="text-green-500" /> : <CircleXIcon className="text-red-500" />}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Verified</span>
                                <span
                                    className={`badge ${user.is_verified ? "badge-success" : "badge-warning"
                                        }`}
                                >
                                    {user.is_verified ? <CheckCircle className="text-green-500" /> : <CircleXIcon className="text-red-500" />}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Member Since</span>
                                <span className="text-sm font-semibold text-gray-900">
                                    {moment(user.dateOfJoining || "").format("ll")}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
