"use client";

import React, { useMemo, useState } from "react";
import { ProfileCard } from "@usa-limousine-corporation/ui/components/profile/profile-card";
import { ProfileForms } from "@usa-limousine-corporation/ui/components/profile/profile-forms";
import { ProfileSettingsHeader } from "@usa-limousine-corporation/ui/components/profile/settings-header";
import type {
  ChangePasswordSchema,
  PersonalDetailsSchema,
} from "@usa-limousine-corporation/ui/schemas";
import { Card, CardContent } from "@usa-limousine-corporation/ui/components/card";
import { DataTable } from "@usa-limousine-corporation/ui/components/data-table/data-table";
import {
  getSessionColumns,
  type Session,
} from "@usa-limousine-corporation/ui/components/data-table/columns/session";
import { useUser } from "@usa-limousine-corporation/ui/providers/user-context";
import { useAuthChangePassword, useAuthUpdateProfile } from "@/hooks/queries/use-auth";
import { useUploadFile } from "@/hooks/queries/use-upload";
import { useSessions, useRevokeSession } from "@/hooks/queries/use-sessions";
import { NotificationPreferences } from "@/components/profile/notification-preferences";

const TABS = [
  { value: "overview", label: "Overview" },
  { value: "settings", label: "Settings" },
];

export default function ProfileSettingPage() {
  const { user, onUpdateUser } = useUser();
  const [tab, setTab] = useState("overview");
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
    <div className="space-y-6">
      <ProfileSettingsHeader
        onUploadAvatar={handleUploadAvatar}
        isUploading={uploadFile.isPending || updateProfile.isPending}
        tabs={TABS}
        activeTab={tab}
        onTabChange={setTab}
      />

      {tab === "overview" ? (
        <div className="space-y-6">
          <div className="grid grid-cols-12 items-stretch gap-6">
            <div className="col-span-12 flex lg:col-span-4">
              <ProfileCard
                onUploadAvatar={handleUploadAvatar}
                isUploading={uploadFile.isPending || updateProfile.isPending}
                showRole={false}
              />
            </div>
            <div className="col-span-12 lg:col-span-8">
              <ProfileForms
                onUpdateProfile={handleUpdateProfile}
                onChangePassword={handleChangePassword}
                isUpdating={updateProfile.isPending}
                isChangingPassword={changePassword.isPending}
              />
            </div>
          </div>

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
      ) : (
        <NotificationPreferences />
      )}
    </div>
  );
}
