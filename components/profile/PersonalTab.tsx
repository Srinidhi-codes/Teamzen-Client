import { EditableField } from "@/components/common/EditableField";
import { EditableSelectField } from "@/components/common/EditableSelectField";
import { ProfileMetaRow, ProfileSection } from "./ProfileSection";
import { UserFormData } from "./types";
import moment from "moment";
import Link from "next/link";
import {
  AtSign,
  Cake,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  User,
  VenusAndMars,
  XCircle,
} from "lucide-react";

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
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <ProfileSection title="Basic information" icon={User} className="lg:col-span-8">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <EditableField
                        label="First Name"
                        value={formData.first_name || ""}
                        icon={<User />}
                        editable={isEditing}
                        onChange={(value) => handleInputChange("first_name", value)}
                        error={errors.first_name}
                        required
                        placeholder="John"
                    />
                    <EditableField
                        label="Last Name"
                        value={formData.last_name || ""}
                        icon={<User />}
                        editable={isEditing}
                        onChange={(value) => handleInputChange("last_name", value)}
                        error={errors.last_name}
                        required
                        placeholder="Doe"
                    />
                    <EditableField
                        label="Username"
                        value={formData.username || ""}
                        icon={<AtSign />}
                        editable={false}
                        onChange={(value) => handleInputChange("username", value)}
                        error={errors.username}
                        required
                        placeholder="johndoe"
                    />
                    <EditableField
                        label="Email"
                        value={formData.email || ""}
                        icon={<Mail />}
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
                        icon={<Phone />}
                        type="tel"
                        editable={isEditing}
                        onChange={(value) => handleInputChange("phone_number", value)}
                        error={errors.phone_number}
                        placeholder="10-digit number"
                    />
                    <EditableField
                        label="Date of Birth"
                        value={moment(formData.date_of_birth || "").format("ll")}
                        icon={<Cake />}
                        type="date"
                        editable={isEditing}
                        onChange={(value) => handleInputChange("date_of_birth", value)}
                        error={errors.date_of_birth}
                    />
                    <EditableSelectField
                        label="Gender"
                        value={formData.gender || "unspecified"}
                        icon={<VenusAndMars />}
                        editable={isEditing}
                        onChange={(value) => handleInputChange("gender", value)}
                        options={[
                            { value: "unspecified", label: "Not specified" },
                            { value: "male", label: "Male" },
                            { value: "female", label: "Female" },
                            { value: "other", label: "Other" },
                        ]}
                    />
                </div>
            </ProfileSection>

            <div className="space-y-6 lg:col-span-4">
                <ProfileSection title="Office" icon={MapPin}>
                    <EditableField
                        label="Office Location"
                        value={formData.office_location || ""}
                        icon={<MapPin />}
                        editable={false}
                        onChange={(value) => handleInputChange("office_location", value)}
                        error={errors.office_location}
                        placeholder="e.g. New York HQ"
                    />
                </ProfileSection>

                <ProfileSection title="Account status">
                    <ProfileMetaRow label="Active">
                        {user.is_active ? (
                            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="h-4 w-4" />
                                Active
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 text-destructive">
                                <XCircle className="h-4 w-4" />
                                Inactive
                            </span>
                        )}
                    </ProfileMetaRow>
                    <ProfileMetaRow label="Verified">
                        {user.is_verified ? (
                            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="h-4 w-4" />
                                Verified
                            </span>
                        ) : (
                            <div className="space-y-1">
                                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                                    <XCircle className="h-4 w-4" />
                                    Not verified
                                </span>
                                <p className="text-xs text-muted-foreground leading-snug">
                                    Completes when all required{" "}
                                    <Link
                                        href="/onboarding"
                                        className="underline underline-offset-2 hover:text-foreground"
                                    >
                                        onboarding
                                    </Link>{" "}
                                    tasks and documents are done.
                                </p>
                            </div>
                        )}
                    </ProfileMetaRow>
                    <ProfileMetaRow label="Member since">
                        {user.dateOfJoining ? moment(user.dateOfJoining).format("ll") : "—"}
                    </ProfileMetaRow>
                </ProfileSection>
            </div>
        </div>
    );
}
