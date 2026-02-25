import { Card } from "@/components/common/Card";
import { useToast } from "@/components/common/ToastProvider";
import { useGraphQLChangePassword } from "@/lib/api/graphqlHooks";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface SecurityTabProps {
    onLogoutAll: () => void; // Or handle internally
}

export function SecurityTab() {
    const { success, error } = useToast();
    const { changePasswordAsync, isLoading } = useGraphQLChangePassword();

    const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);
        const currentPassword = formData.get("current_password") as string;
        const newPassword = formData.get("new_password") as string;
        const confirmPassword = formData.get("confirm_password") as string;

        if (newPassword !== confirmPassword) {
            error("New passwords do not match");
            return;
        }

        if (newPassword.length < 8) {
            error("Password must be at least 8 characters long");
            return;
        }

        try {
            await changePasswordAsync({
                oldPassword: currentPassword,
                newPassword: newPassword,
            });

            success("Password changed successfully!");
            form.reset();
        } catch (err: any) {
            console.error("Error changing password:", err);
            // Try to show specific error from backend
            error(err.message || "Failed to change password. Please try again.");
        }
    };

    const handleLogoutAll = async () => {
        if (confirm("Are you sure you want to logout from all devices?")) {
            try {
                // Logout remains REST as it involves cookie management which is often simpler/handled by existing REST view
                await fetch("/api/users/logout-all/", { method: "POST" });
                window.location.href = "/login";
            } catch (err) {
                console.error("Error logging out:", err);
                error("Failed to logout from all devices");
            }
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in transition-all duration-500">
            <Card title="Change Password" hover gradient>
                <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Current Password
                        </label>
                        <Input
                            type="password"
                            name="current_password"
                            placeholder="Enter current password"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            New Password
                        </label>
                        <Input
                            type="password"
                            name="new_password"
                            placeholder="Enter new password"
                            required
                            minLength={8}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Confirm New Password
                        </label>
                        <Input
                            type="password"
                            name="confirm_password"
                            placeholder="Confirm new password"
                            required
                            minLength={8}
                        />
                    </div>
                    <Button
                        type="submit"
                        className="btn-primary"
                        disabled={isLoading}
                    >
                        {isLoading ? "Updating..." : "Update Password"}
                    </Button>
                </form>
            </Card>

            <Card title="Security Settings" hover gradient>
                <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-gray-900">
                                    Two-Factor Authentication
                                </p>
                                <p className="text-sm text-gray-600">
                                    Add extra security to your account
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <p className="font-semibold text-gray-900 mb-2">
                            Active Sessions
                        </p>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">🖥️ Windows • Chrome</span>
                                <span className="badge badge-success">Current</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">📱 Android • App</span>
                                <button className="text-red-600 hover:underline font-medium">
                                    Revoke
                                </button>
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={handleLogoutAll}
                        className="w-full"
                        variant="destructive"
                    >
                        Logout All Devices
                    </Button>
                </div>
            </Card>
        </div>
    );
}
