"use client";

import { useState, useEffect } from "react";
import { ProfileSection } from "./ProfileSection";
import { useToast } from "@/components/common/ToastProvider";
import { useGraphQLChangePassword, useGraphQLUser } from "@/lib/api/graphqlHooks";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useUser } from "@/lib/api/hooks";
import client from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { Loader2, ShieldCheck, ShieldAlert, KeyRound, Copy, Check } from "lucide-react";
import { DevicesManager } from "./DevicesManager";
import { FaceEnrollmentCard } from "./FaceEnrollmentCard";

type SecurityTabProps = {
  autoOpenFaceEnroll?: boolean;
  onFaceEnrollAutoOpenConsumed?: () => void;
};

export function SecurityTab({
  autoOpenFaceEnroll = false,
  onFaceEnrollAutoOpenConsumed,
}: SecurityTabProps) {
    const { success, error } = useToast();
    const { changePasswordAsync, isLoading } = useGraphQLChangePassword();
    const { refetch: refetchUser } = useGraphQLUser();
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
            await refetchUser();
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
            await refetchUser();
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
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ProfileSection title="Account protection" icon={ShieldCheck}>
                <div className="space-y-3">
                    <div
                        className={`flex items-start justify-between gap-4 rounded-lg border px-4 py-3.5 ${
                            is2FAEnabled
                                ? "border-emerald-500/25 bg-emerald-500/10"
                                : "border-border bg-muted/50"
                        }`}
                    >
                        <div className="min-w-0 space-y-1">
                            <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                                {is2FAEnabled ? (
                                    <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                    <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                )}
                                Two-factor authentication
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {is2FAEnabled
                                    ? "Your account is protected with a one-time code."
                                    : "Add an extra step at sign-in with Google Authenticator or similar."}
                            </p>
                        </div>
                        <label className="relative inline-flex shrink-0 cursor-pointer items-center">
                            <input
                                type="checkbox"
                                className="peer sr-only"
                                checked={is2FAEnabled}
                                onChange={handleToggle2FA}
                                disabled={isVerifying}
                            />
                            <div className="relative h-6 w-11 rounded-full bg-muted-foreground/25 after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-background after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-ring" />
                        </label>
                    </div>
                    <FaceEnrollmentCard
                        embedded
                        autoOpen={autoOpenFaceEnroll}
                        onAutoOpenConsumed={onFaceEnrollAutoOpenConsumed}
                    />
                </div>
            </ProfileSection>

            <ProfileSection title="Change password" icon={KeyRound}>
                <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">
                            Current password
                        </label>
                        <Input
                            type="password"
                            name="current_password"
                            placeholder="Enter current password"
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">
                            New password
                        </label>
                        <Input
                            type="password"
                            name="new_password"
                            placeholder="Enter new password"
                            required
                            minLength={8}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">
                            Confirm new password
                        </label>
                        <Input
                            type="password"
                            name="confirm_password"
                            placeholder="Confirm new password"
                            required
                            minLength={8}
                        />
                    </div>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Updating…" : "Update password"}
                    </Button>
                </form>
            </ProfileSection>

            <div className="lg:col-span-2">
                <DevicesManager />
            </div>

            {/* Setup 2FA Modal */}
            {showSetupModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm">
                    <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-lg sm:p-8">
                        <form onSubmit={handleEnable2FA} className="space-y-6">
                            <div className="text-center space-y-2">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                    <KeyRound className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold tracking-tight text-foreground">Enable authenticator app</h3>
                                <p className="text-xs text-muted-foreground">
                                    Scan the QR code below using your authenticator app (e.g. Google Authenticator).
                                </p>
                            </div>

                            {/* QR Code Container */}
                            <div className="flex justify-center p-2">
                                {provisioningUri && (
                                    <img 
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(provisioningUri)}`} 
                                        alt="2FA QR Code" 
                                        className="rounded-xl border border-border bg-white"
                                    />
                                )}
                            </div>

                            {/* Manual Setup Key */}
                            <div className="rounded-lg border border-border bg-muted/50 p-4">
                                <p className="mb-1.5 text-xs font-medium text-muted-foreground">Setup key</p>
                                <div className="flex items-center justify-between gap-2">
                                    <code className="break-all font-mono text-xs text-foreground select-all">{secret}</code>
                                    <button
                                        type="button"
                                        onClick={handleCopySecret}
                                        className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                                    >
                                        {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Verification Code */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground">Verification code</label>
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
                                    className="flex-1"
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-lg sm:p-8">
                        <form onSubmit={handleDisable2FA} className="space-y-6">
                            <div className="text-center space-y-2">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                                    <ShieldAlert className="h-6 w-6 text-destructive" />
                                </div>
                                <h3 className="text-lg font-semibold tracking-tight text-foreground">Disable two-factor auth</h3>
                                <p className="text-xs text-muted-foreground">
                                    Please enter the current 6-digit code from your authenticator app to confirm disabling.
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground">Verification code</label>
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
                                    variant="destructive"
                                    className="flex-1"
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
