"use client";

import { useState } from "react";
import { Facebook, LinkedIn, LinkIcon, XLogo } from "@usa-limousine-corporation/ui/svg";

export default function BlogShare({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const links = [
    {
      label: "Share on Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: Facebook,
    },
    {
      label: "Share on X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: XLogo,
    },
    {
      label: "Share on LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: LinkedIn,
    },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-black">Share</span>
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-gray-700 transition-colors hover:border-secondary hover:text-secondary"
          >
            <Icon className="h-4 w-4" />
          </a>
        );
      })}
      <button
        type="button"
        aria-label="Copy link"
        onClick={async () => {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-border px-3 text-xs font-semibold text-gray-700 transition-colors hover:border-secondary hover:text-secondary"
      >
        <LinkIcon className="h-4 w-4" />
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
