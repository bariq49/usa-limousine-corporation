"use client";

import type { ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../avatar";
import { Card, CardContent } from "../card";
import { Mail } from "../../svg";
import { ASSETS } from "../../assets/images";

export interface CoverHeaderProps {
  name: string;
  email?: string | null | undefined;
  avatar?: string | null | undefined;
  /** Badges or buttons shown under the cover, right-aligned (e.g. type and status). */
  aside?: ReactNode;
}

/** Profile-style cover banner for any person (same look as Profile Settings). */
export function CoverHeader({ name, email, avatar, aside }: CoverHeaderProps) {
  return (
    <Card className="overflow-visible rounded-lg shadow-xs">
      <CardContent className="p-0">
        <div
          className="relative h-[180px] w-full rounded-t-lg bg-cover bg-center bg-no-repeat lg:h-[200px]"
          style={{
            backgroundImage:
              `linear-gradient(to top, rgb(0 0 0 / 0.75), rgb(0 0 0 / 0.2), transparent), url(${ASSETS.profile.cover.src})`,
          }}
        >
          <div className="pointer-events-none absolute inset-x-0 -bottom-7 px-6 pb-5 lg:px-8">
            <div className="flex min-w-0 items-center gap-4">
              <Avatar className="relative z-20 h-[72px] w-[72px] shrink-0 rounded-full border-4 border-background bg-background shadow-md lg:h-[80px] lg:w-[80px]">
                {avatar ? (
                  <AvatarImage
                    src={avatar}
                    alt={name}
                    className="h-full w-full object-cover object-center"
                  />
                ) : null}
                <AvatarFallback className="bg-primary/20 text-xl font-bold text-primary">
                  {(name[0] ?? "?").toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 text-white drop-shadow-sm">
                <div className="truncate text-lg font-bold lg:text-xl">{name}</div>
                {email ? (
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-white/90 lg:text-sm">
                    <Mail className="h-5 w-5 shrink-0 text-white/80" />
                    <span className="truncate">{email}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
        <div className="relative z-10 flex min-h-14 flex-wrap items-center justify-end gap-2 px-6 pt-10 pb-3 sm:pt-4 lg:px-8">
          {aside}
        </div>
      </CardContent>
    </Card>
  );
}
