"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/common/Card";
import { useToast } from "@/components/common/ToastProvider";
import { useGraphQLChangePassword } from "@/lib/api/graphqlHooks";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useUser } from "@/lib/api/hooks";
import client from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { Loader2, ShieldCheck, ShieldAlert, KeyRound, Copy, Check } from "lucide-react";
import { DevicesManager } from "./DevicesManager";

export function SecurityTab() {
    const { success, error } = useToast();
    const { changePasswordAsync, isLoading } = useGraphQLChangePassword();
    const { user } = useUser();

    // 2FA States
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [showSetupModal, setShowSetupModal] = useState(false);
    const [showDisableModal, setShowDisableModal] = useState(false);
    const [secret, setSecret] = useState("");
    const [provisioningUri, setProvisioningUri] = useState("");
    const [verifyCode, setVerifyCode] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (user) {
            setIs2FAEnabled(!!user.isTotpEnabled);
        }
    }, [user]);

    const handleCopySecret = () => {
        navigator.clipboard.writeText(secret);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleToggle2FA = async () => {
        if (is2FAEnabled) {
            // Initiate disabling
            setVerifyCode("");
            setShowDisableModal(true);
        } else {
            // Initiate setup
            setIsVerifying(true);
            try {
                const response = await client.post(API_ENDPOINTS.TOTP_SETUP);
                setSecret(response.data.secret);
                setProvisioningUri(response.data.provisioning_uri);
                setVerifyCode("");
                setShowSetupModal(true);
            } catch (err: any) {
                error(err.response?.data?.error || "Failed to initialize 2FA setup");
            } finally {
                setIsVerifying(false);
            }
        }
    };

    const handleEnable2FA = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!verifyCode) return;
        setIsVerifying(true);
        try {
            await client.post(API_ENDPOINTS.TOTP_ENABLE, { code: verifyCode });
            setIs2FAEnabled(true);
            setShowSetupModal(false);
            success("Two-factor authentication enabled successfully!");
            // Refresh user page/state
            window.location.reload();
        } catch (err: any) {
            error(err.response?.data?.error || "Invalid verification code");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleDisable2FA = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!verifyCode) return;
        setIsVerifying(true);
        try {
            await client.post(API_ENDPOINTS.TOTP_DISABLE, { code: verifyCode });
            setIs2FAEnabled(false);
            setShowDisableModal(false);
            success("Two-factor authentication disabled successfully.");
            window.location.reload();
        } catch (err: any) {
            error(err.response?.data?.error || "Invalid verification code");
        } finally {
            setIsVerifying(false);
        }
    };

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
            error(err.message || "Failed to change password. Please try again.");
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
                    <div className={`p-4 border rounded-xl transition-all duration-300 ${
                        is2FAEnabled 
                            ? "bg-green-50 border-green-200" 
                            : "bg-amber-50 border-amber-200"
                    }`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                                    {is2FAEnabled ? (
                                        <ShieldCheck className="w-5 h-5 text-green-600" />
                                    ) : (
                                        <ShieldAlert className="w-5 h-5 text-amber-600" />
                                    )}
                                    Two-Factor Auth (2FA)
                                </p>
                                <p className="text-xs text-gray-600 mt-0.5">
                                    {is2FAEnabled 
                                        ? "Account is secured with Google Authenticator."
                                        : "Enhance account safety using authenticator app codes."
                                    }
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={is2FAEnabled}
                                    onChange={handleToggle2FA}
                                    disabled={isVerifying}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>
                    </div>
                </div>
            </Card>

            <DevicesManager />

            {/* Setup 2FA Modal */}
            {showSetupModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs animate-fade-in">
                    <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
                        <form onSubmit={handleEnable2FA} className="space-y-6">
                            <div className="text-center space-y-2">
                                <div className="mx-auto w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center">
                                    <KeyRound className="w-6 h-6 text-indigo-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Enable Authenticator App</h3>
                                <p className="text-xs text-gray-500">
                                    Scan the QR code below using your authenticator app (e.g. Google Authenticator).
                                </p>
                            </div>

                            {/* QR Code Container */}
                            <div className="flex justify-center p-2">
                                {provisioningUri && (
                                    <img 
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(provisioningUri)}`} 
                                        alt="2FA QR Code" 
                                        className="border-4 border-white shadow-md rounded-xl bg-white"
                                    />
                                )}
                            </div>

                            {/* Manual Setup Key */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/60">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Secret Setup Key</p>
                                <div className="flex items-center justify-between gap-2">
                                    <code className="text-xs font-mono text-gray-800 break-all select-all">{secret}</code>
                                    <button 
                                        type="button" 
                                        onClick={handleCopySecret}
                                        className="text-gray-500 hover:text-indigo-600 p-1 rounded hover:bg-gray-200/50 transition-colors"
                                    >
                                        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Verification Code */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Verification Code</label>
                                <Input
                                    type="text"
                                    required
                                    maxLength={6}
                                    placeholder="Enter 6-digit code"
                                    value={verifyCode}
                                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                                    className="text-center tracking-widest text-lg font-mono"
                                />
                            </div>

                            {/* Form Actions */}
                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowSetupModal(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isVerifying}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white"
                                >
                                    {isVerifying ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : "Verify & Enable"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Disable 2FA Modal */}
            {showDisableModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs animate-fade-in">
                    <div className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-2xl border border-gray-100">
                        <form onSubmit={handleDisable2FA} className="space-y-6">
                            <div className="text-center space-y-2">
                                <div className="mx-auto w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                                    <ShieldAlert className="w-6 h-6 text-red-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Disable 2-Factor Auth</h3>
                                <p className="text-xs text-gray-500">
                                    Please enter the current 6-digit code from your authenticator app to confirm disabling.
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Verification Code</label>
                                <Input
                                    type="text"
                                    required
                                    maxLength={6}
                                    placeholder="000000"
                                    value={verifyCode}
                                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                                    className="text-center tracking-widest text-lg font-mono"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowDisableModal(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isVerifying}
                                    className="flex-1 bg-red-600 hover:bg-red-500 text-white"
                                >
                                    {isVerifying ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : "Disable"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
