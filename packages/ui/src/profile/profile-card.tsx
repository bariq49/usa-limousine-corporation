"use client";

import { useRef } from "react";
import { Refresh, Mail, Pencil, ShieldCheck, User } from "../svg";
import { Avatar, AvatarFallback, AvatarImage } from "../components/avatar";
import { Button } from "../components/button";
import { Card, CardContent } from "../components/card";
import { useUser } from "../providers/user-context";

export interface ProfileCardProps {
  onUploadAvatar?: ((file: File) => Promise<void> | void) | undefined;
  isUploading?: boolean | undefined;
}

export function ProfileCard({ onUploadAvatar, isUploading }: ProfileCardProps = {}) {
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadAvatar) {
      void onUploadAvatar(file);
    }
    e.target.value = "";
  };

  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() || user?.name || "Account";

  return (
    <Card className="h-full w-full shadow-xs">
      <CardContent className="p-6">
        <div className="flex flex-col items-center">
          <div className="relative rounded-full">
            <Avatar className="h-[100px] w-[100px] border-2 border-border shadow-xs">
              {user?.avatar ? (
                <AvatarImage
                  src={user.avatar}
                  alt={fullName}
                  className="h-full w-full object-cover object-center"
                />
              ) : null}
              <AvatarFallback className="text-2xl font-semibold bg-primary/10 text-primary">
                {(fullName[0] ?? "?").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              type="button"
              size="icon"
              disabled={isUploading || !onUploadAvatar}
              onClick={() => fileInputRef.current?.click()}
              className="absolute right-0 bottom-0 h-8 w-8 rounded-full cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-transform active:scale-95"
            >
              {isUploading ? (
                <Refresh className="h-4 w-4 animate-spin text-primary-foreground" />
              ) : (
                <Pencil className="h-4 w-4 text-primary-foreground" />
              )}
            </Button>
          </div>
          <div className="mt-4 text-center text-lg font-bold text-default-900">{fullName}</div>
        </div>

        <div className="mt-5 border-t border-border pt-5">
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="flex w-[104px] shrink-0 items-center gap-2">
                <User className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm font-semibold text-default-800">Full Name:</span>
              </div>
              <span className="min-w-0 flex-1 break-words text-sm text-default-700">
                {fullName}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex w-[104px] shrink-0 items-center gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm font-semibold text-default-800">Role:</span>
              </div>
              <span className="min-w-0 flex-1 break-words text-sm text-default-700 capitalize">
                {user?.roles || "Role"}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex w-[104px] shrink-0 items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm font-semibold text-default-800">Email:</span>
              </div>
              <span className="min-w-0 flex-1 break-words text-sm text-default-700">
                {user?.email || "—"}
              </span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
