"use client";

import { ShieldCheck, User } from "../svg";
import { Card } from "../components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/tabs";
import { ChangePasswordForm } from "../forms/profile/change-password-form";
import { PersonalDetailsForm } from "../forms/profile/personal-details-form";
import { ProfileCard } from "./profile-card";
import { ProfileSettingsHeader } from "./settings-header";
import type { ChangePasswordSchema, PersonalDetailsSchema } from "../schemas";

const tabs = [
  { label: "Personal Details", value: "personal", icon: User },
  { label: "Password", value: "password", icon: ShieldCheck },
];

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
          <Card className="flex h-full flex-col shadow-xs">
            <Tabs defaultValue="personal" className="flex h-full flex-col">
              <TabsList className="h-fit w-full shrink-0 justify-start gap-10 overflow-x-auto rounded-none border-b border-border bg-transparent px-6 pt-5 pb-0">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger
                      className="relative flex items-center gap-2 px-1 pb-3 text-sm font-medium capitalize transition-all duration-150 rounded-none bg-transparent shadow-none border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:font-semibold data-[state=active]:border-primary data-[state=inactive]:text-default-500 hover:text-primary cursor-pointer"
                      value={tab.value}
                      key={tab.value}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{tab.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
              <TabsContent value="personal" className="mt-0 flex flex-1 flex-col p-6">
                <PersonalDetailsForm onSubmit={onUpdateProfile} isSubmitting={isUpdating} />
              </TabsContent>
              <TabsContent value="password" className="mt-0 flex flex-1 flex-col p-6">
                <ChangePasswordForm onSubmit={onChangePassword} isSubmitting={isChangingPassword} />
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
