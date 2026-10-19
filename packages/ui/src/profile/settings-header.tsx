"use client";

import { useRef } from "react";
import { Refresh, Mail, Pencil } from "../svg";
import { Card, CardContent } from "../components/card";
import { Breadcrumbs } from "../layout/breadcrumbs";
import { Avatar, AvatarFallback, AvatarImage } from "../components/avatar";
import { useUser } from "../providers/user-context";

export interface ProfileSettingsHeaderProps {
  onUploadAvatar?: ((file: File) => Promise<void> | void) | undefined;
  isUploading?: boolean | undefined;
}

export function ProfileSettingsHeader({
  onUploadAvatar,
  isUploading,
}: ProfileSettingsHeaderProps = {}) {
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() || user?.name || "Account";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file && onUploadAvatar) {
      void onUploadAvatar(file);
    }

    e.target.value = "";
  };

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/dashboard" },
          { label: "Settings" },
          { label: "Profile Settings" },
        ]}
      />

      <div className="relative mt-6 mb-4">
        <Card className="overflow-visible rounded-lg shadow-xs">
          <CardContent className="p-0">
            <div
              className="relative h-[180px] w-full rounded-lg bg-cover bg-center bg-no-repeat lg:h-[200px]"
              style={{
                backgroundImage:
                  "linear-gradient(to top, rgb(0 0 0 / 0.75), rgb(0 0 0 / 0.2), transparent), url(/assets/images/profile/user-cover.png)",
              }}
            >
              {/* Profile information at bottom-left */}
              <div className="absolute inset-x-0 -bottom-7 px-6 pb-5 lg:px-8">
                <div className="flex min-w-0 items-center gap-4">
                  {/* Profile Avatar */}
                  <div className="relative z-10 shrink-0 group">
                    <Avatar className="h-[72px] w-[72px] rounded-full border-4 border-background bg-background shadow-md lg:h-[80px] lg:w-[80px]">
                      {user?.avatar ? (
                        <AvatarImage
                          src={user.avatar}
                          alt={fullName}
                          className="h-full w-full object-cover object-center"
                        />
                      ) : null}

                      <AvatarFallback className="bg-primary/20 text-xl font-bold text-primary">
                        {(fullName[0] ?? "?").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {onUploadAvatar ? (
                      <>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />

                        <button
                          type="button"
                          disabled={isUploading}
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 disabled:cursor-not-allowed"
                          title="Update profile photo"
                        >
                          {isUploading ? (
                            <Refresh className="h-5 w-5 animate-spin text-white" />
                          ) : (
                            <Pencil className="h-4 w-4 text-white" />
                          )}
                        </button>
                      </>
                    ) : null}
                  </div>

                  {/* Name + Email */}
                  <div className="min-w-0 text-white drop-shadow-sm">
                    <div className="truncate text-lg font-bold lg:text-xl">{fullName}</div>

                    {user?.email ? (
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-white/90 lg:text-sm">
                        <Mail className="h-5 w-5 shrink-0 text-white/80" />

                        <span className="truncate">{user.email}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
