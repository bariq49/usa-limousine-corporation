"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Close } from "../svg";
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  forwardRef,
  type HTMLAttributes,
  useEffect,
} from "react";
import { cn } from "../utils/cn";
import { scheduleScrollLockReset } from "../layout/scroll-lock-fix";

export function Dialog({
  onOpenChange,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  useEffect(() => {
    if (props.open) {
      scheduleScrollLockReset();
    }
  }, [props.open]);

  return (
    <DialogPrimitive.Root
      data-slot="dialog"
      onOpenChange={(open) => {
        if (open) {
          scheduleScrollLockReset();
        }
        onOpenChange?.(open);
      }}
      {...props}
    />
  );
}
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;

export const DialogOverlay = forwardRef<
  ElementRef<typeof DialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-100 bg-black/50", className)}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

export const DialogContent = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    /** Hide the built-in close button when the content renders its own. */
    showCloseButton?: boolean;
  }
>(({ className, children, showCloseButton = true, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-100 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border-0 bg-card p-6 shadow-2xl outline-none focus:outline-none max-h-[90vh] overflow-y-auto sm:rounded-md max-sm:top-auto max-sm:bottom-0 max-sm:left-0 max-sm:right-0 max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-t-2xl max-sm:rounded-b-none max-sm:max-h-[85dvh] max-sm:pb-[calc(1.5rem+env(safe-area-inset-bottom))] max-sm:animate-sheet-up",
        className,
      )}
      {...props}
    >
      <div className="mx-auto -mt-2 h-1.5 w-10 rounded-full bg-default-200 sm:hidden" />
      {children}
      {showCloseButton ? (
        <DialogPrimitive.Close
          className="absolute right-4 top-4 rounded-md p-1 text-default-400 hover:text-default-700 hover:bg-default-100 transition-colors cursor-pointer"
          style={{ cursor: "pointer" }}
        >
          <Close className="h-4 w-4 cursor-pointer" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      ) : null}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

export function DialogHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col gap-1.5 text-center sm:text-left", className)} {...props} />
  );
}

export const DialogDescription = forwardRef<
  ElementRef<typeof DialogPrimitive.Description>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export const DialogTitle = forwardRef<
  ElementRef<typeof DialogPrimitive.Title>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn("text-lg font-semibold", className)} {...props} />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;
