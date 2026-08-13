"use client";

import { useEffect, useState } from "react";
import { ScanFace } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/ui/button";
import { FaceCaptureModal } from "@/components/attendance/FaceCaptureModal";
import { useAttendanceMutations } from "@/lib/graphql/attendance/attendanceHooks";
import { useGraphQLUser } from "@/lib/api/graphqlHooks";
import { useStore } from "@/lib/store/useStore";
import { useQuery } from "@apollo/client/react";
import { GET_MY_FACE } from "@/lib/graphql/users/queries";

type FaceEnrollmentCardProps = {
  /** Open the enroll camera when the card mounts (e.g. ?face=enroll). */
  autoOpen?: boolean;
  onAutoOpenConsumed?: () => void;
};

export function FaceEnrollmentCard({
  autoOpen = false,
  onAutoOpenConsumed,
}: FaceEnrollmentCardProps) {
  const { user } = useStore();
  const { refetch: refetchMe } = useGraphQLUser();
  const { data: faceData, refetch: refetchFace } = useQuery(GET_MY_FACE, {
    skip: !user?.organization?.faceAttendanceEnabled,
    fetchPolicy: "cache-first",
  }) as any;
  const { enrollFace, enrollFaceLoading } = useAttendanceMutations();
  const [open, setOpen] = useState(false);

  const faceEnabled = !!user?.organization?.faceAttendanceEnabled;
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

  return (
    <>
      <Card title="Face attendance" hover gradient>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <ScanFace className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">
                {faceEnrolled ? "Face enrolled" : "Face not enrolled"}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {faceEnrolled
                  ? "Used to verify check-in and check-out. Re-enroll here if you need to update your face data."
                  : "Enroll once so you can punch attendance with face verification."}
              </p>
              {faceEnrolled && enrolledAt ? (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Last enrolled{" "}
                  {new Date(enrolledAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              ) : null}
            </div>
          </div>
          <Button
            type="button"
            variant={faceEnrolled ? "outline" : "default"}
            className="w-full sm:w-auto"
            disabled={enrollFaceLoading}
            onClick={() => setOpen(true)}
          >
            {faceEnrolled ? "Re-enroll face" : "Enroll face"}
          </Button>
        </div>
      </Card>

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
    </>
  );
}
