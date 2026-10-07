import ProfilePage from "@/components/profile/ProfilePage";
import { PageSkeleton } from "@/components/common/PageSkeleton";
import React, { Suspense } from "react";

const Profile = () => {
  return (
    <Suspense
      fallback={
        <div className="py-8">
          <PageSkeleton variant="split" />
        </div>
      }
    >
      <ProfilePage />
    </Suspense>
  );
};

export default Profile;
