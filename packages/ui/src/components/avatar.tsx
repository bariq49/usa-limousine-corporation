"use client";
import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "../utils/cn";

function Avatar({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}
      {...props}
    />
  );
}

interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  max?: number;
  total?: number;
  custom?: boolean;
  countClass?: string;
  ref?: React.Ref<HTMLDivElement>;
}

function AvatarGroup({
  className,
  children,
  max = 4,
  total,
  custom,
  countClass,
  ...props
}: AvatarGroupProps) {
  const avatars = React.Children.toArray(children);

  return (
    <div
      className={cn(" relative w-max-content flex -space-x-3 avatarGroup items-center", className)}
      {...props}
    >
      {avatars?.slice(0, max).map((avatar, index) => (
        <React.Fragment key={`avatar-group-key-${index}`}>{avatar}</React.Fragment>
      ))}
      {avatars?.length > max && (
        <>
          {custom ? (
            <div className=" inline-block">
              <span className="ltr:ml-5 rtl:mr-5 inline-block"> +{avatars?.length - max} more</span>
            </div>
          ) : (
            <Avatar
              className={cn(
                "ring-1 ring-background ring-offset-[2px]  ring-offset-background ",
                countClass,
              )}
            >
              <AvatarFallback className="font-normal">
                +{total ? total : avatars.length - max}
              </AvatarFallback>
            </Avatar>
          )}
        </>
      )}
    </div>
  );
}

function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square h-full w-full object-cover object-center", className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted font-semibold text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback, AvatarGroup };
