import type { SVGProps } from "react";

function LargeCase({ ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Telescopic Handle */}
      <path d="M9 5V2h6v3" />
      {/* Large Suitcase Body */}
      <rect x="5" y="5" width="14" height="16" rx="2" />
      {/* Horizontal Ribs */}
      <path d="M5 9h14" opacity="0.4" />
      <path d="M5 13h14" opacity="0.4" />
      <path d="M5 17h14" opacity="0.4" />
      {/* Side Handle */}
      <path d="M3.5 11v4" strokeWidth="1.5" />
      {/* Wheels */}
      <circle cx="7.5" cy="22" r="1" fill="currentColor" />
      <circle cx="16.5" cy="22" r="1" fill="currentColor" />
    </svg>
  );
}

export default LargeCase;
