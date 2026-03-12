"use client"
import { useState, useEffect } from "react";
import { useGraphQLUser, useGraphQLUpdateUser } from "@/lib/api/graphqlHooks";
import { useUpdateUser as useRestUpdateUser } from "@/lib/api/hooks"; // Keep REST for image upload if needed
import { useToast } from "@/components/common/ToastProvider";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileTabs } from "./ProfileTabs";
import { PersonalTab } from "./PersonalTab";
import { EmploymentTab } from "./EmploymentTab";
import { FinancialTab } from "./FinancialTab";
import { SecurityTab } from "./SecurityTab";
import { UserFormData } from "./types";
import { userProfileSchema } from "@/lib/schemas";
import { z } from "zod";
import { Button } from "../ui/button";
import { Briefcase, DollarSign, IndianRupee, Loader2, Lock, User } from "lucide-react";

export default function ProfilePage() {
  const { user, isLoading: isUserLoading, error: userError } = useGraphQLUser();
  const { updateUserAsync: updateGraphQLUser, isLoading: isUpdatingGraphQL } =
    useGraphQLUpdateUser();
  const { updateUserAsync: updateRestUser } = useRestUpdateUser(); // REST hook for file upload

  const { toast, success, error } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<UserFormData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when user data loads
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.firstName || "",
        last_name: user.lastName || "",
        username: user.username || "",
        email: user.email || "",
        phone_number: user.phoneNumber || "",
        date_of_birth: user.dateOfBirth || "",
        gender: user.gender || "",
        office_location: user.officeLocation?.name || "",
        employee_id: user.id || "",
        designation: user.designation?.name || "",
        department: user.department?.name || "",
        employment_type: user.employmentType || "full_time",
        date_of_joining: user.dateOfJoining || "",
        manager: user.manager
          ? `${user.manager.firstName} ${user.manager.lastName}`
          : "",
        bank_account_number: user.bankAccountNumber || "",
        bank_ifsc_code: user.bankIfscCode || "",
        pan_number: user.panNumber || "",
        aadhar_number: user.aadharNumber || "",
        uan_number: user.uanNumber || "",
      });
    }
  }, [user]);

  const tabs = [
    { id: "personal", label: "Personal Info", icon: <User /> },
    { id: "employment", label: "Employment", icon: <Briefcase /> },
    { id: "financial", label: "Financial", icon: <IndianRupee /> },
    { id: "security", label: "Security", icon: <Lock /> },
  ];

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };


  const validateForm = (): boolean => {
    try {
      userProfileSchema.parse(formData);
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        (err as any).errors.forEach((e: any) => {
          if (e.path[0]) {
            newErrors[e.path[0] as string] = e.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      error("Please fix the validation errors before saving");
      return;
    }

    setIsSaving(true);
    try {
      await updateGraphQLUser(formData);
      success("Profile updated successfully!");
      setIsEditing(false);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      // Try to parse GraphQL errors if possible, or use message
      error(err.message || "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      // Reset form data using the snake_case mapping from camelCase user
      setFormData({
        first_name: user.firstName || "",
        last_name: user.lastName || "",
        username: user.username || "",
        email: user.email || "",
        phone_number: user.phoneNumber || "",
        date_of_birth: user.dateOfBirth || "",
        gender: user.gender || "",
        // office_location: user.office_location || "", 
        employee_id: user.employeeId || "",
        // designation: user.designation || "", 
        // department: user.department || "", 
        employment_type: user.employmentType || "full_time",
        date_of_joining: user.dateOfJoining || "",
        manager: user.manager
          ? `${user.manager.firstName} ${user.manager.lastName}`
          : "",
        bank_account_number: user.bankAccountNumber || "",
        bank_ifsc_code: user.bankIfscCode || "",
        pan_number: user.panNumber || "",
        aadhar_number: user.aadharNumber || "",
        uan_number: user.uanNumber || "",
      });
    }
    setErrors({});
    setIsEditing(false);
  };

  const handleProfilePictureUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      error("File size must be less than 5MB");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("profile_picture", file);

      // Use REST hook for file upload
      await updateRestUser(formData);
      success("Profile picture updated successfully!");
      // Invalidating GraphQL queries would be ideal here to refresh the image
      window.location.reload();
    } catch (err: any) {
      console.error("Error uploading profile picture:", err);
      let errorMsg = "Failed to upload profile picture.";
      if (err.response?.data) {
        // Extract the first error message if available
        const data = err.response.data;
        const firstKey = Object.keys(data)[0];
        if (firstKey) {
          const firstErr = data[firstKey];
          errorMsg += ` ${firstKey}: ${Array.isArray(firstErr) ? firstErr[0] : firstErr}`;
        }
      }
      error(errorMsg);
    }
  };

  if (!user && isUserLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="spinner w-12 h-12"></div>
      </div>
    );
  }

  // Check for GraphQL errors if user is missing
  if (!user && userError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="text-red-500 text-xl font-bold mb-2">Error Loading Profile</div>
        <p className="text-gray-600 mb-4">{userError.message}</p>
        <button onClick={() => window.location.reload()} className="btn-primary">Retry</button>
      </div>
    );
  }

  // If user is null but not loading, something went wrong (e.g. auth), but we'll show empty or redirect usually.
  if (!user) return null;

  // Adapt user object for ProfileHeader which might expect specific fields
  const userForHeader = {
    ...user,
    first_name: user.firstName,
    last_name: user.lastName,
    profile_picture: user.profilePictureUrl,
    is_active: user.isActive,
    is_verified: user.isVerified,
    employment_type: user.employmentType,

    designation: user.designation?.name || "",
    department: user.department?.name || "",
    office_location: user.officeLocation?.name || "",

    attendance_rate: user.attendanceRate,
    leave_balance: user.leaveBalance,
    total_leave_entitlement: user.totalLeaveEntitlement,
    tenure_display: user.tenureDisplay,
  };

  return (
    <div className="space-y-6 animate-fade-in mb-24">
      <ProfileHeader
        user={userForHeader}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        onCancel={handleCancel}
        onUploadPhoto={handleProfilePictureUpload}
      />

      <ProfileTabs
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="animate-fade-in">
        {activeTab === "personal" && (
          <PersonalTab
            formData={formData}
            isEditing={isEditing}
            handleInputChange={handleInputChange}
            errors={errors}
            user={userForHeader}
          />
        )}

        {activeTab === "employment" && (
          <EmploymentTab
            formData={formData}
            isEditing={isEditing}
            handleInputChange={handleInputChange}
            errors={errors}
            user={userForHeader}
          />
        )}

        {activeTab === "financial" && (
          <FinancialTab
            formData={formData}
            isEditing={isEditing}
            handleInputChange={handleInputChange}
            errors={errors}
            user={userForHeader}
          />
        )}

        {activeTab === "security" && <SecurityTab />}
      </div>

      {isEditing && activeTab !== "security" && (
        <div className="glass-dark p-4 sm:p-6 rounded-2xl border border-white/30 shadow-2xl flex flex-col sm:flex-row justify-end items-center gap-3 sm:gap-4 animate-slide-up sticky bottom-4 z-20 mx-2 sm:mx-0">
          <Button
            onClick={handleCancel}
            variant={"outline"}
            disabled={isSaving}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button
            className="btn-primary w-full sm:w-auto order-1 sm:order-2"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving Changes
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
