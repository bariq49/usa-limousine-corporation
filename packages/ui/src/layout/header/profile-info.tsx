"use client";

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
import { Avatar, AvatarFallback, AvatarImage } from "../../components/avatar";
import { useUser } from "../../providers/user-context";

import userAvatar from "../../../public/assets/avatar/user.png";

export function ProfileInfo() {
  const { user, onLogout, isLoggingOut } = useUser();
  const fullName =[user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() || user?.name || "";
  const displayName = fullName || user?.email || "User";
  console.log("user", user);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open profile menu"
          className="flex cursor-pointer items-center rounded-full ring-offset-background transition-opacity hover:opacity-80 focus:outline-none"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={user?.avatar || userAvatar.src}
              alt={displayName}
            />
            <AvatarFallback>
              {(displayName[0] ?? "?").toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 p-0" align="end">
        <DropdownMenuLabel className="mb-1 flex items-center gap-2 p-3">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={user?.avatar || userAvatar.src}
              alt={displayName}
            />
            <AvatarFallback>
              {(displayName[0] ?? "?").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-default-800">
              {fullName || user?.email || "Account"}
            </div>
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
              className="my-1 flex items-center gap-2 px-3 text-sm font-medium text-default-600 capitalize cursor-pointer"
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
