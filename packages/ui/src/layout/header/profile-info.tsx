"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/avatar";
import { Logo } from "../../components/logo";
import { useMediaQuery } from "../../hooks/use-media-query";
import { useUser } from "../../providers/user-context";
import { ASSETS } from "../../assets/images";

function ProfileAvatar({
  displayName,
  avatar,
  className,
}: {
  displayName: string;
  avatar?: string | null | undefined;
  className?: string;
}) {
  return (
    <Avatar className={className ?? "h-9 w-9"}>
      <AvatarImage src={avatar || ASSETS.avatar.user.src} alt={displayName} />
      <AvatarFallback>{(displayName[0] ?? "?").toUpperCase()}</AvatarFallback>
    </Avatar>
  );
}

export function ProfileInfo() {
  const { user, onLogout, isLoggingOut } = useUser();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [open, setOpen] = useState(false);
  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() || user?.name || "";
  const displayName = fullName || user?.email || "User";
  const avatar = user?.avatar;
  const title = fullName || user?.email || "Account";

  if (!isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            aria-label="Open profile menu"
            className="flex cursor-pointer items-center rounded-full ring-offset-background transition-opacity hover:opacity-80 focus:outline-none"
          >
            <ProfileAvatar displayName={displayName} avatar={avatar} />
          </button>
        </DialogTrigger>
        <DialogContent className="gap-0 rounded-b-none p-0 max-sm:pb-3 sm:max-w-md">
          <DialogHeader className="border-b border-border px-5 pt-2 pb-4 text-left">
            <DialogTitle>Account</DialogTitle>
            <DialogDescription className="sr-only">Profile and account actions</DialogDescription>
          </DialogHeader>
          <div className="space-y-1 px-5 py-4">
            <div className="mb-3 flex items-center gap-3">
              <ProfileAvatar displayName={displayName} avatar={avatar} className="h-11 w-11" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-default-800">{title}</div>
                {fullName && user?.email ? (
                  <p className="truncate text-xs text-default-600">{user.email}</p>
                ) : null}
              </div>
            </div>
            <Link
              href="/profile-setting"
              onClick={() => setOpen(false)}
              className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-default-600 capitalize transition-colors hover:bg-default-100"
            >
              <Settings className="h-5 w-5 shrink-0" />
              Profile Settings
            </Link>
            {onLogout ? (
              <button
                type="button"
                disabled={Boolean(isLoggingOut)}
                onClick={() => {
                  setOpen(false);
                  onLogout();
                }}
                className="flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-default-600 capitalize transition-colors hover:bg-default-100 disabled:opacity-50"
              >
                <LogOut className="h-5 w-5 shrink-0" />
                {isLoggingOut ? "Logging out..." : "Log out"}
              </button>
            ) : null}
          </div>
          <div className="border-t text-center border-dashed border-border px-5 pt-3 pb-1">
            <Logo className="h-7 w-36 mx-auto" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open profile menu"
          className="flex cursor-pointer items-center rounded-full ring-offset-background transition-opacity hover:opacity-80 focus:outline-none"
        >
          <ProfileAvatar displayName={displayName} avatar={avatar} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 p-0" align="end">
        <DropdownMenuLabel className="mb-1 flex items-center gap-2 p-3">
          <ProfileAvatar displayName={displayName} avatar={avatar} />
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-default-800">{title}</div>
            {fullName && user?.email ? (
              <p className="truncate text-xs text-default-600">{user.email}</p>
            ) : null}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          <Link href="/profile-setting" className="cursor-pointer">
            <DropdownMenuItem className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm font-medium text-default-600 capitalize">
              <Settings className="h-4 w-4" />
              Profile Settings
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        {onLogout ? (
          <>
            <DropdownMenuSeparator className="mb-0 dark:bg-background" />
            <DropdownMenuItem
              disabled={Boolean(isLoggingOut)}
              onSelect={onLogout}
              className="my-1 flex cursor-pointer items-center gap-2 px-3 text-sm font-medium text-default-600 capitalize"
            >
              <LogOut className="h-4 w-4" />
              {isLoggingOut ? "Logging out..." : "Log out"}
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
