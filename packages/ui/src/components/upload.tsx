"use client";

import * as React from "react";
import { Loader2, Upload as UploadIcon, X, ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "../utils/cn";

export interface UploadProps {
  value?: string | null | undefined;
  onChange?: ((value: string) => void) | undefined;
  onUpload?: ((file: File) => Promise<string>) | undefined;
  accept?: string | undefined;
  maxSizeMB?: number | undefined;
  disabled?: boolean | undefined;
  className?: string | undefined;
  placeholder?: string | undefined;
  hint?: string | undefined;
  hasError?: boolean | undefined;
}

export function Upload(props: UploadProps) {
  const {
    value,
    onChange,
    onUpload,
    accept = "image/*",
    maxSizeMB = 5,
    disabled = false,
    className,
    placeholder = "Drop files here or click to upload.",
    hint = "PNG, JPG or WEBP",
    hasError = false,
  } = props;
  const [isUploading, setIsUploading] = React.useState(false);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleProcessFile = async (file: File) => {
    if (disabled || isUploading) return;

    if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File size exceeds maximum limit of ${maxSizeMB}MB`);
      return;
    }

    if (onUpload) {
      setIsUploading(true);
      try {
        const url = await onUpload(file);
        onChange?.(url);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to upload file");
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        onChange?.(reader.result as string);
      };
      reader.readAsDataURL(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void handleProcessFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled || isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      void handleProcessFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isImage =
    typeof value === "string" &&
    (value.startsWith("data:image/") ||
      value.startsWith("http://") ||
      value.startsWith("https://") ||
      /\.(jpg|jpeg|png|webp|svg|gif)($|\?)/i.test(value));

  return (
    <div className={cn("flex h-full w-full flex-col", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
      />

      {value ? (
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            if (!disabled && !isUploading) {
              fileInputRef.current?.click();
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (!disabled && !isUploading) {
                fileInputRef.current?.click();
              }
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "group relative flex h-full min-h-44 w-full items-center justify-center overflow-hidden rounded-md border border-default-300 bg-default-100 cursor-pointer select-none transition duration-200 hover:border-primary",
            isDragOver && "border-primary bg-primary/5 ring-2 ring-primary/20",
            hasError && "border-destructive bg-destructive/5",
            (disabled || isUploading) && "pointer-events-none opacity-60",
          )}
        >
          {isImage ? (
            <img
              src={value}
              alt="Upload preview"
              className="absolute inset-0 h-full w-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-1.5 p-4 text-default-500">
              <ImageIcon className="h-8 w-8 text-default-400" />
              <span className="text-xs font-medium truncate max-w-[220px]">{value}</span>
            </div>
          )}

          {/* Hover overlay with "Change image" hint */}
          {!disabled && !isUploading && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 text-white text-xs font-medium pointer-events-none">
              <UploadIcon className="h-4 w-4" />
              <span>Click or drop image to replace</span>
            </div>
          )}

          {/* Uploading overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex flex-col items-center justify-center gap-1.5 z-20">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-xs font-semibold text-primary">Uploading...</span>
            </div>
          )}

          {/* Remove button */}
          {!disabled && !isUploading && (
            <button
              type="button"
              className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 hover:bg-destructive text-white flex items-center justify-center transition-colors shadow-sm z-10 cursor-pointer"
              onClick={handleRemove}
              title="Remove image"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            if (!disabled && !isUploading) {
              fileInputRef.current?.click();
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (!disabled && !isUploading) {
                fileInputRef.current?.click();
              }
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "group relative flex h-full min-h-44 w-full flex-col items-center justify-center px-4 py-6 rounded-md border bg-white cursor-pointer transition duration-300 select-none text-center",
            isDragOver
              ? "border-primary bg-primary/5 ring-2 ring-primary/20 scale-[1.01]"
              : hasError
                ? "border-destructive bg-destructive/5"
                : "border-default-300 hover:border-primary/70 hover:bg-primary/[0.02] focus:border-primary",
            (disabled || isUploading) && "pointer-events-none opacity-60",
          )}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center py-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary mb-2.5">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
              <p className="text-sm font-semibold text-primary">Uploading image...</p>
              <p className="text-xs text-default-400 mt-0.5">Please wait a moment</p>
            </div>
          ) : (
            <>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary mb-2.5 transition-transform duration-200 group-hover:scale-105">
                <UploadIcon className="h-5 w-5" strokeWidth={2.2} />
              </div>
              <p className="text-sm font-medium text-default-800 tracking-tight">{placeholder}</p>
              {hint ? <p className="text-xs text-default-400 mt-1">{hint}</p> : null}
            </>
          )}
        </div>
      )}
    </div>
  );
}
