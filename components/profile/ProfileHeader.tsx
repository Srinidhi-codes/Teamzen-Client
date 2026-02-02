import { handleDownloadCV } from "@/lib/downloadCv";
import { Camera, Edit2, X, Download, CheckCircle, Briefcase, Building2 } from "lucide-react";

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
        <div className="relative bg-linear-to-br from-white via-indigo-50/30 to-purple-50/30 rounded-3xl border-2 border-white shadow-2xl overflow-hidden">
            {/* Decorative background elements */}

            <div className="relative z-10 p-8">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                    {/* Profile Picture */}
                    <div className="relative group">
                        <div className="w-36 h-36 rounded-3xl p-1 shadow-2xl transform transition-all duration-300 group-hover:scale-105 group-hover:rotate-2">
                            <div className="w-full h-full bg-white rounded-3xl overflow-hidden flex items-center justify-center">
                                {user.profile_picture ? (
                                    <img
                                        src={user.profile_picture}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-linear-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-5xl font-bold">
                                        {user.first_name?.charAt(0)}
                                        {user.last_name?.charAt(0)}
                                    </div>
                                )}
                            </div>
                        </div>
                        <label
                            htmlFor="profile-picture-upload"
                            className="absolute -bottom-2 -right-2 w-12 h-12 bg-linear-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg flex items-center justify-center text-white hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-110 cursor-pointer"
                        >
                            <Camera className="w-5 h-5" />
                            <input
                                id="profile-picture-upload"
                                type="file"
                                accept="image/*"
                                onChange={onUploadPhoto}
                                className="hidden"
                            />
                        </label>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-4xl font-bold bg-linear-to-r from-slate-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent mb-3">
                            {user.first_name} {user.last_name}
                        </h1>
                        <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 mb-4">
                            <div className="flex items-center gap-2 text-slate-700">
                                <Briefcase className="w-4 h-4 text-indigo-600" />
                                <span className="font-medium">{user.designation || "Employee"}</span>
                            </div>
                            <span className="hidden sm:inline text-slate-400">•</span>
                            <div className="flex items-center gap-2 text-slate-700">
                                <Building2 className="w-4 h-4 text-purple-600" />
                                <span className="font-medium">{user.department || "General"}</span>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                            <span className="px-4 py-2 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-sm shadow-md">
                                {user.role?.toUpperCase()}
                            </span>
                            <span
                                className={`px-4 py-2 rounded-xl font-semibold text-sm shadow-md ${user.is_active
                                    ? "bg-linear-to-r from-emerald-500 to-green-600 text-white"
                                    : "bg-linear-to-r from-rose-500 to-red-600 text-white"
                                    }`}
                            >
                                {user.is_active ? "Active" : "Inactive"}
                            </span>
                            <span className="px-4 py-2 bg-linear-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-semibold text-sm shadow-md">
                                {user.employment_type?.replace("_", " ").toUpperCase()}
                            </span>
                            {user.isVerified && (
                                <span className="px-4 py-2 text-green-600 rounded-xl font-bold flex items-center gap-1">
                                    <CheckCircle className="w-4 h-4" />
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => (isEditing ? onCancel() : setIsEditing(true))}
                            className={`group relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2 ${isEditing
                                ? "bg-white text-slate-700 hover:bg-slate-50 border-2 border-slate-200"
                                : "bg-linear-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
                                }`}
                        >
                            {isEditing ? (
                                <>
                                    <X className="w-5 h-5" />
                                    <span>Cancel</span>
                                </>
                            ) : (
                                <>
                                    <Edit2 className="w-5 h-5" />
                                    <span>Edit Profile</span>
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => handleDownloadCV(user)}
                            className="group px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
                        >
                            <Download className="w-5 h-5 text-indigo-600" />
                            <span>Download CV</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}