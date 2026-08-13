"use client";

import { useEffect, useState } from "react";
import { ScanFace } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ProfileSection } from "./ProfileSection";
import { FaceCaptureModal } from "@/components/attendance/FaceCaptureModal";
import { useAttendanceMutations } from "@/lib/graphql/attendance/attendanceHooks";
import { useGraphQLUser } from "@/lib/api/graphqlHooks";
import { useStore } from "@/lib/store/useStore";
import { useOrgPlan } from "@/lib/hooks/useOrgPlan";
import { useQuery } from "@apollo/client/react";
import { GET_MY_FACE } from "@/lib/graphql/users/queries";

type FaceEnrollmentCardProps = {
  autoOpen?: boolean;
  onAutoOpenConsumed?: () => void;
  /** Render the row only — parent supplies the card. */
  embedded?: boolean;
};

export function FaceEnrollmentCard({
  autoOpen = false,
  onAutoOpenConsumed,
  embedded = false,
}: FaceEnrollmentCardProps) {
  const { user } = useStore();
  const { can } = useOrgPlan();
  const { refetch: refetchMe } = useGraphQLUser();
  const faceAllowed =
    can("face_attendance") && !!user?.organization?.faceAttendanceEnabled;
  const { data: faceData, refetch: refetchFace } = useQuery(GET_MY_FACE, {
    skip: !faceAllowed,
    fetchPolicy: "cache-first",
  }) as any;
  const { enrollFace, enrollFaceLoading } = useAttendanceMutations();
  const [open, setOpen] = useState(false);

  const faceEnabled = faceAllowed;
  const faceEnrolled =
    !!(faceData?.me?.faceEnrolled ?? user?.faceEnrolled) &&
    Array.isArray(faceData?.me?.faceDescriptor) &&
    faceData.me.faceDescriptor.length === 128;
  const enrolledAt = (user as any)?.faceEnrolledAt as string | undefined;

  useEffect(() => {
    if (!autoOpen || !faceEnabled) return;
    setOpen(true);
    onAutoOpenConsumed?.();
  }, [autoOpen, faceEnabled]); // eslint-disable-line react-hooks/exhaustive-deps -- consume once when flagged

  if (!faceEnabled) return null;

  const row = (
    <div
      className={
        embedded
          ? `flex items-start justify-between gap-4 rounded-lg border px-4 py-3.5 ${
              faceEnrolled
                ? "border-emerald-500/25 bg-emerald-500/10"
                : "border-border bg-muted/50"
            }`
          : "space-y-4"
      }
    >
      <div className="min-w-0 flex-1 space-y-1">
        <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          <ScanFace className="h-4 w-4 text-primary" />
          {faceEnrolled ? "Face enrolled" : "Face not enrolled"}
        </p>
        <p className="text-xs text-muted-foreground">
          {faceEnrolled
            ? "Used to verify check-in and check-out."
            : "Enroll once so you can punch attendance with face verification."}
        </p>
        {faceEnrolled && enrolledAt ? (
          <p className="text-xs text-muted-foreground">
            Last enrolled{" "}
            {new Date(enrolledAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        ) : null}
      </div>
      <Button
        type="button"
        variant={faceEnrolled ? "outline" : "default"}
        size="sm"
        className="shrink-0"
        disabled={enrollFaceLoading}
        onClick={() => setOpen(true)}
      >
        {faceEnrolled ? "Re-enroll" : "Enroll"}
      </Button>
    </div>
  );

  const modal = (
    <FaceCaptureModal
      open={open}
      mode="enroll"
      title={faceEnrolled ? "Re-enroll your face" : "Enroll your face"}
      onClose={() => setOpen(false)}
      onSuccess={(result) => {
        setOpen(false);
        void (async () => {
          const toastId = toast.loading("Saving face…");
          try {
            const res = await enrollFace({
              descriptor: result.descriptor,
              imageBase64: result.imageBase64,
            });
            if (res?.error) {
              toast.error(res.error, { id: toastId });
              return;
            }
            toast.success(
              faceEnrolled ? "Face updated successfully." : "Face enrolled successfully.",
              { id: toastId }
            );
            await refetchMe();
            await refetchFace();
          } catch (e: any) {
            toast.error(e?.message || "Failed to save face.", { id: toastId });
          }
        })();
      }}
    />
  );

  if (embedded) {
    return (
      <>
        {row}
        {modal}
      </>
    );
  }

  return (
    <>
      <ProfileSection title="Face attendance" icon={ScanFace}>
        {row}
      </ProfileSection>
      {modal}
    </>
  );
}
