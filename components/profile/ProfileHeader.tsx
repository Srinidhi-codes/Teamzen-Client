import { UserFormData } from "./types";

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
        <div className="glass p-8 rounded-2xl border border-white/30 shadow-xl">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                {/* Profile Picture */}
                <div className="relative group">
                    <div className="w-32 h-32 bg-linear-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white text-5xl font-bold shadow-2xl overflow-hidden">
                        {user.profile_picture ? (
                            <img
                                src={user.profile_picture}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <>
                                {user.first_name?.charAt(0)}
                                {user.last_name?.charAt(0)}
                            </>
                        )}
                    </div>
                    <label
                        htmlFor="profile-picture-upload"
                        className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-indigo-600 hover:bg-indigo-50 transition-all duration-200 group-hover:scale-110 cursor-pointer"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                        </svg>
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {user.first_name} {user.last_name}
                    </h1>
                    <p className="text-lg text-gray-600 mb-4">
                        {user.designation || "Employee"} • {user.department || "General"}
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                        <span className="badge badge-primary">
                            {user.role?.toUpperCase()}
                        </span>
                        <span
                            className={`badge ${user.is_active ? "badge-success" : "badge-danger"
                                }`}
                        >
                            {user.is_active ? "Active" : "Inactive"}
                        </span>
                        <span className="badge badge-info">
                            {user.employment_type?.replace("_", " ").toUpperCase()}
                        </span>
                        {user.is_verified && (
                            <span className="badge badge-success">✓ Verified</span>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-2">
                    <button
                        onClick={() => (isEditing ? onCancel() : setIsEditing(true))}
                        className={`${isEditing ? "btn-secondary" : "btn-primary"
                            } flex items-center space-x-2`}
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            {isEditing ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                            )}
                        </svg>
                        <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
                    </button>
                    <button className="btn-ghost flex items-center space-x-2">
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                        </svg>
                        <span>Download CV</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
