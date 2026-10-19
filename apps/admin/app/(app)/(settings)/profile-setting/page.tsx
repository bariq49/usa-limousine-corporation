"use client";

import React, { useMemo } from "react";
import { ProfileSettings } from "@usa-limousine-corporation/ui/profile/profile-settings";
import type {
  ChangePasswordSchema,
  PersonalDetailsSchema,
} from "@usa-limousine-corporation/ui/schemas";
import { Card, CardContent } from "@usa-limousine-corporation/ui/components/card";
import { DataTable } from "@usa-limousine-corporation/ui/data-table/data-table";
import {
  getSessionColumns,
  type Session,
} from "@usa-limousine-corporation/ui/data-table/columns/session";
import { useUser } from "@usa-limousine-corporation/ui/providers/user-context";
import { useAuthChangePassword, useAuthUpdateProfile } from "@/hooks/queries/use-auth";
import { useUploadFile } from "@/hooks/queries/use-upload";
import { useSessions, useRevokeSession } from "@/hooks/queries/use-sessions";

export default function ProfileSettingPage() {
  const { user, onUpdateUser } = useUser();
  const updateProfile = useAuthUpdateProfile();
  const uploadFile = useUploadFile();
  const changePassword = useAuthChangePassword();
  const { data: serverSessions, isLoading, isFetching } = useSessions();
  const revoke = useRevokeSession();

  const handleUpdateProfile = async (values: PersonalDetailsSchema) => {
    const updated = await updateProfile.mutateAsync({
      firstName: values.firstName,
      lastName: values.lastName,
      phone: values.phone || undefined,
    });
    onUpdateUser?.(updated);
  };

  const handleChangePassword = async (values: ChangePasswordSchema) => {
    await changePassword.mutateAsync(values);
  };

  const handleUploadAvatar = async (file: File) => {
    const uploadResult = await uploadFile.mutateAsync({ file, folder: "profiles" });
    const avatar = uploadResult.secureUrl || uploadResult.url;
    const updated = await updateProfile.mutateAsync({ avatar });
    onUpdateUser?.(updated);
  };

  const handleRevokeSession = async (session: Session) => {
    try {
      await revoke.mutateAsync(session.id);
    } catch {
      // Error notification handled by useRevokeSession onError
    }
  };

  const columns = useMemo(
    () =>
      getSessionColumns({
        currentSessionId: user?.sessionId,
        onRevoke: handleRevokeSession,
        onDelete: handleRevokeSession,
      }),
    [user?.sessionId],
  );

  return (
    <div className="space-y-8">
      <ProfileSettings
        onUpdateProfile={handleUpdateProfile}
        onChangePassword={handleChangePassword}
        onUploadAvatar={handleUploadAvatar}
        isUpdating={updateProfile.isPending}
        isChangingPassword={changePassword.isPending}
        isUploading={uploadFile.isPending || updateProfile.isPending}
      />

      <Card className="shadow-xs">
        <CardContent className="p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-default-900">
              Connected Devices &amp; Session Logs
            </h2>
          </div>

          <DataTable
            columns={columns}
            data={serverSessions ?? []}
            searchKey="device"
            searchPlaceholder="Search by device, browser..."
            loading={isLoading}
            fetching={isFetching}
          />
        </CardContent>
      </Card>
    </div>
  );
}
