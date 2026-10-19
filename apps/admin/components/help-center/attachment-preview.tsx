"use client";

import { useState } from "react";

type AttachmentPreviewProps = {
  url: string;
  className?: string;
};

type Kind = "image" | "pdf" | "file";

function attachmentKind(url: string): Kind {
  const value = url.toLowerCase();
  const path = value.split("?")[0] ?? "";

  if (path.endsWith(".pdf") || value.includes("/raw/upload/")) {
    return "pdf";
  }

  if (
    path.endsWith(".png") ||
    path.endsWith(".jpg") ||
    path.endsWith(".jpeg") ||
    path.endsWith(".gif") ||
    path.endsWith(".webp") ||
    path.endsWith(".avif") ||
    value.includes("/image/upload/")
  ) {
    return "image";
  }

  return "file";
}

export function AttachmentPreview({ url, className }: AttachmentPreviewProps) {
  const kind = attachmentKind(url);
  const [imageFailed, setImageFailed] = useState(false);
  const tryImage = kind === "image" || kind === "file";
  const showImage = tryImage && !imageFailed;
  const showDocument = kind === "pdf" || (tryImage && imageFailed);
  const rootClass = className ?? "";

  return (
    <div className={["space-y-2", rootClass].filter(Boolean).join(" ")}>
      <div className="overflow-hidden rounded-md border border-border bg-default-50">
        {showImage ? (
          <a href={url} target="_blank" rel="noreferrer" className="block">
            <img
              src={url}
              alt="Ticket attachment preview"
              className="max-h-56 w-full object-contain"
              onError={() => setImageFailed(true)}
            />
          </a>
        ) : null}

        {showDocument ? (
          <iframe title="Attachment preview" src={url} className="h-56 w-full border-0 bg-white" />
        ) : null}
      </div>
    </div>
  );
}
