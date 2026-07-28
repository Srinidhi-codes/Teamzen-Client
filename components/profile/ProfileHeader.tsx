"use client";

import { handleDownloadCV } from "@/lib/downloadCv";
import { Camera, Edit2, X, Download, Briefcase, Building2, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";
import { PhotoOverlay } from "@/components/common/PhotoOverlay";

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
    const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim() || "User";

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
                        onClick={() => handleDownloadCV(user)}
                        className="w-full sm:w-auto h-9 rounded-md"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Download CV
                    </Button>
                </div>
            </div>
        </div>
        <PhotoOverlay
            open={isPhotoOpen}
            onOpenChange={setIsPhotoOpen}
            src={user.profile_picture || null}
            name={fullName}
        />
        </>
    );
}
