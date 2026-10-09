"use client";

import { handleDownloadCV } from "@/lib/downloadCv";
import { 
    Camera, 
    Edit2, 
    X, 
    Download, 
    Briefcase, 
    Building2, 
    ShieldCheck, 
    QrCode, 
    ExternalLink, 
    Copy, 
    Check 
} from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";
import { PhotoOverlay } from "@/components/common/PhotoOverlay";
import { QRCodeSVG } from "qrcode.react";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription 
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface ProfileHeaderProps {
    user: any;
    isEditing: boolean;
    setIsEditing: (value: boolean) => void;
    onCancel: () => void;
    onUploadPhoto: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProfileHeader({
    user,
    isEditing,
    setIsEditing,
    onCancel,
    onUploadPhoto,
}: ProfileHeaderProps) {
    const [isPhotoOpen, setIsPhotoOpen] = useState(false);
    const [isQrOpen, setIsQrOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim() || "User";
    const profileUrl = typeof window !== "undefined" 
        ? `${window.location.origin}/p/${user.id}`
        : `http://localhost:3000/p/${user.id}`;

    const downloadQr = () => {
        const svg = document.getElementById(`profile-qr-${user.id}`);
        if (!svg) return;
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new window.Image();
        img.onload = () => {
            canvas.width = img.width + 40;
            canvas.height = img.height + 40;
            if (ctx) {
                ctx.fillStyle = "white";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 20, 20);
            }
            const pngFile = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.download = `${user.first_name || "Employee"}-${user.last_name || ""}-QR.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };
        img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    };

    const copyProfileLink = async () => {
        try {
            await navigator.clipboard.writeText(profileUrl);
            setCopied(true);
            toast.success("Profile link copied to clipboard!");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Failed to copy link");
        }
    };

    return (
        <>
        <div className="premium-card rounded-xl overflow-hidden">
            <div className="flex flex-col lg:flex-row items-center lg:items-end gap-6 sm:gap-8 p-6">
                <div className="relative shrink-0">
                    <button
                        type="button"
                        onClick={() => user.profile_picture && setIsPhotoOpen(true)}
                        className={cn(
                            "w-32 h-32 sm:w-40 sm:h-40 rounded-xl p-1 bg-primary/10",
                            user.profile_picture ? "cursor-zoom-in" : "cursor-default"
                        )}
                        title={user.profile_picture ? "View profile photo" : "No photo available"}
                    >
                        <div className="w-full h-full bg-background rounded-lg overflow-hidden flex items-center justify-center border border-border">
                            {user.profile_picture ? (
                                <Image
                                    src={user.profile_picture}
                                    alt="Profile"
                                    width={160}
                                    height={160}
                                    className="w-full h-full object-cover"
                                    unoptimized
                                />
                            ) : (
                                <div className="w-full h-full bg-primary flex items-center justify-center text-primary-foreground text-4xl sm:text-5xl font-semibold">
                                    {user.first_name?.charAt(0)}
                                    {user.last_name?.charAt(0)}
                                </div>
                            )}
                        </div>
                    </button>

                    <label
                        htmlFor="profile-picture-upload"
                        className="absolute -bottom-1 -right-1 w-9 h-9 sm:w-10 sm:h-10 bg-primary text-primary-foreground rounded-md shadow-sm flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer border-2 border-background"
                    >
                        <Camera className="w-4 h-4" />
                        <input
                            id="profile-picture-upload"
                            type="file"
                            accept="image/*"
                            onChange={onUploadPhoto}
                            className="hidden"
                        />
                    </label>
                </div>

                <div className="flex-1 text-center lg:text-left space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-center justify-center lg:justify-start gap-2">
                            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                                {user.first_name} {user.last_name}
                            </h1>
                            {user.isVerified && <ShieldCheck className="w-5 h-5 text-emerald-500" />}
                            <button
                                type="button"
                                onClick={() => setIsQrOpen(true)}
                                className="p-1.5 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-primary transition-colors border border-border/50 shadow-sm ml-1 cursor-pointer"
                                title="View Digital Visiting Card QR"
                            >
                                <QrCode className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                            <div className="flex items-center gap-2 px-2.5 py-1 bg-muted/50 rounded-md border border-border/50 text-sm font-medium text-muted-foreground">
                                <Briefcase className="w-3.5 h-3.5 text-primary" />
                                {user.designation || "Not set"}
                            </div>
                            <div className="flex items-center gap-2 px-2.5 py-1 bg-muted/50 rounded-md border border-border/50 text-sm font-medium text-muted-foreground">
                                <Building2 className="w-3.5 h-3.5 text-primary" />
                                {user.department || "Not set"}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                        <Badge variant="info">{user.role}</Badge>
                        <Badge variant={user.is_active ? "success" : "danger"}>
                            {user.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="default">
                            {user.employment_type?.replace("_", " ")}
                        </Badge>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col gap-2 w-full sm:w-auto shrink-0">
                    <Button
                        onClick={() => (isEditing ? onCancel() : setIsEditing(true))}
                        className={cn(
                            "w-full sm:w-auto h-9 rounded-md",
                            isEditing ? "btn-secondary" : "btn-primary"
                        )}
                    >
                        {isEditing ? <X className="w-4 h-4 mr-2" /> : <Edit2 className="w-4 h-4 mr-2" />}
                        {isEditing ? "Cancel" : "Edit profile"}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setIsQrOpen(true)}
                        className="w-full sm:w-auto h-9 rounded-md"
                    >
                        <QrCode className="w-4 h-4 mr-2 text-primary" />
                        Digital Card / QR
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => handleDownloadCV(user)}
                        className="w-full sm:w-auto h-9 rounded-md"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Download CV
                    </Button>
                </div>
            </div>
        </div>

        {/* Dialog for QR Code / Visiting Card Preview */}
        <Dialog open={isQrOpen} onOpenChange={setIsQrOpen}>
            <DialogContent className="sm:max-w-md p-6 sm:p-7 gap-5">
                <DialogHeader className="pr-8 text-left space-y-1.5">
                    <DialogTitle className="flex items-center gap-2.5 text-lg font-bold text-foreground">
                        <QrCode className="w-5 h-5 text-primary shrink-0" />
                        <span>Digital Visiting Card & QR</span>
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                        Scan with any smartphone camera to open your executive digital visiting card.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center p-5 sm:p-6 bg-muted/20 rounded-2xl space-y-4 border border-border/50">
                    <div className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-sm border border-border/60">
                        <QRCodeSVG 
                            id={`profile-qr-${user.id}`} 
                            value={profileUrl} 
                            size={180} 
                            level="H" 
                            includeMargin={false}
                        />
                    </div>

                    <div className="text-center space-y-1">
                        <p className="font-bold text-base sm:text-lg text-foreground">{fullName}</p>
                        <p className="text-xs text-muted-foreground font-medium">
                            {user.designation || "Team Member"} {user.department && `• ${user.department}`}
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 w-full pt-1">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={copyProfileLink}
                            className="h-8.5 text-xs gap-1.5 px-2"
                        >
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            <span className="truncate">{copied ? "Copied" : "Copy Link"}</span>
                        </Button>

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={downloadQr}
                            className="h-8.5 text-xs gap-1.5 px-2"
                        >
                            <Download className="w-3.5 h-3.5" />
                            <span className="truncate">Download QR</span>
                        </Button>

                        <Button
                            size="sm"
                            className="h-8.5 text-xs gap-1.5 btn-primary px-2"
                            onClick={() => window.open(profileUrl, '_blank')}
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span className="truncate">Open Card</span>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>

        <PhotoOverlay
            open={isPhotoOpen}
            onOpenChange={setIsPhotoOpen}
            src={user.profile_picture || null}
            name={fullName}
        />
        </>
    );
}
