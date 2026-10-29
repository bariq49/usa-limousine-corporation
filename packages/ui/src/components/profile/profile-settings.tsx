"use client";

import { ProfileCard } from "./profile-card";
import { ProfileForms } from "./profile-forms";
import { ProfileSettingsHeader } from "./settings-header";
import type { ChangePasswordSchema, PersonalDetailsSchema } from "../../schemas";

export interface ProfileSettingsProps {
  onUpdateProfile?: ((values: PersonalDetailsSchema) => Promise<void> | void) | undefined;
  onChangePassword?: ((values: ChangePasswordSchema) => Promise<void> | void) | undefined;
  onUploadAvatar?: ((file: File) => Promise<void> | void) | undefined;
  isUpdating?: boolean | undefined;
  isChangingPassword?: boolean | undefined;
  isUploading?: boolean | undefined;
  showRole?: boolean | undefined;
}

export function ProfileSettings({
  onUpdateProfile,
  onChangePassword,
  onUploadAvatar,
  isUpdating,
  isChangingPassword,
  isUploading,
  showRole = true,
}: ProfileSettingsProps = {}) {
  return (
    <div className="space-y-6">
      <ProfileSettingsHeader onUploadAvatar={onUploadAvatar} isUploading={isUploading} />
      <div className="grid grid-cols-12 items-stretch gap-6">
        <div className="col-span-12 flex lg:col-span-4">
          <ProfileCard
            onUploadAvatar={onUploadAvatar}
            isUploading={isUploading}
            showRole={showRole}
          />
        </div>
        <div className="col-span-12 lg:col-span-8">
          <ProfileForms
            onUpdateProfile={onUpdateProfile}
            onChangePassword={onChangePassword}
            isUpdating={isUpdating}
            isChangingPassword={isChangingPassword}
          />
        </div>
      </div>
    </div>
  );
}
