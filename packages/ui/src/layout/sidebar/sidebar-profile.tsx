"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/tooltip";
import { cn } from "../../utils/cn";
import userAvatar from "../../../public/assets/avatar/user.png";

export function SidebarProfile() {
  const pathname = usePathname();
  const active = pathname === "/profile" || pathname.startsWith("/profile/");

  return (
    <div className="mt-auto border-t border-dashed border-border px-2 py-3">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/profile"
              className={cn(
                "mx-auto flex h-12 w-12 items-center justify-center rounded-md transition-colors",
                active ? "bg-primary/10 text-primary" : "hover:bg-primary/10",
              )}
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src={userAvatar.src} alt="User" />
                <AvatarFallback className="text-xs">?</AvatarFallback>
              </Avatar>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Profile</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
