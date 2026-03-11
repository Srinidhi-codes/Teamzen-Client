"use client";

import { handleDownloadCV } from "@/lib/downloadCv";
import { Camera, Edit2, X, Download, CheckCircle, Briefcase, Building2, ShieldCheck, Mail, Phone, MapPin } from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";

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

    return (
        <div className="premium-card relative overflow-hidden group">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-l from-primary/5 to-transparent pointer-events-none" />
            <div className="absolute -left-20 -top-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl opacity-50" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-end gap-10">
                {/* Avatar Section */}
                <div className="relative shrink-0">
                    <div className="w-44 h-44 rounded-[2.5rem] p-1 bg-linear-to-br from-primary to-primary/20 shadow-2xl relative z-10">
                        <div className="w-full h-full bg-background rounded-[2.2rem] overflow-hidden flex items-center justify-center border-4 border-background shadow-inner">
                            {user.profile_picture ? (
                                <Image
                                    src={user.profile_picture}
                                    alt="Profile"
                                    width={100}
                                    height={100}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-linear-to-br from-primary to-primary/60 flex items-center justify-center text-white text-6xl font-black italic drop-shadow-lg">
                                    {user.first_name?.charAt(0)}
                                    {user.last_name?.charAt(0)}
                                </div>
                            )}
                        </div>
                    </div>

                    <label
                        htmlFor="profile-picture-upload"
                        className="absolute -bottom-2 -right-2 w-14 h-14 bg-primary text-primary-foreground rounded-2xl shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer z-20 border-4 border-background"
                    >
                        <Camera className="w-6 h-6" />
                        <input
                            id="profile-picture-upload"
                            type="file"
                            accept="image/*"
                            onChange={onUploadPhoto}
                            className="hidden"
                        />
                    </label>
                </div>

                {/* Info Content */}
                <div className="flex-1 text-center lg:text-left space-y-6 pb-2">
                    <div className="space-y-3">
                        <div className="flex items-center justify-center lg:justify-start gap-3">
                            <h1 className="text-4xl lg:text-5xl font-black tracking-tighter italic">
                                {user.first_name} <span className="text-primary">{user.last_name}</span>
                            </h1>
                            {user.isVerified && <ShieldCheck className="w-6 h-6 text-emerald-500 fill-emerald-500/10" />}
                        </div>

                        <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                            <div className="flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-lg border border-border/50 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                <Briefcase className="w-3.5 h-3.5 text-primary" />
                                {user.designation || "Operational Link"}
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-lg border border-border/50 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                <Building2 className="w-3.5 h-3.5 text-primary" />
                                {user.department || "Core System"}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                        <Badge variant="info">{user.role}</Badge>
                        <Badge variant={user.is_active ? "success" : "danger"}>
                            {user.is_active ? "Active Link" : "Terminated"}
                        </Badge>
                        <Badge variant="default">
                            {user.employment_type?.replace("_", " ")}
                        </Badge>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col gap-4 shrink-0 pb-2">
                    <Button
                        onClick={() => (isEditing ? onCancel() : setIsEditing(true))}
                        className={isEditing ? "btn-secondary" : "btn-primary"}
                    >
                        {isEditing ? <X className="w-4 h-4 mr-2" /> : <Edit2 className="w-4 h-4 mr-2" />}
                        {isEditing ? "Cancel Edit" : "Modify Profile"}
                    </Button>
                    <Button variant="outline" onClick={() => handleDownloadCV(user)} className="border-dashed hover:border-primary active:scale-95 bg-muted/10">
                        <Download className="w-4 h-4 mr-2" />
                        Download CV
                    </Button>
                </div>
            </div>
        </div>
    );
}