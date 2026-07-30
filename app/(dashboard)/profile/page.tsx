import ProfilePage from "@/components/profile/ProfilePage";
import React, { Suspense } from "react";

const Profile = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-96 text-sm text-muted-foreground">
          Loading profile…
        </div>
      }
    >
      <ProfilePage />
    </Suspense>
  );
};

export default Profile;
