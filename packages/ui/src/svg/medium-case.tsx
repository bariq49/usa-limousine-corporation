import type { SVGProps } from "react";

function MediumCase({ ...props }: SVGProps<SVGSVGElement>) {
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
      {/* Handle */}
      <path d="M9 5V3h6v2" />
      {/* Medium Suitcase Body */}
      <rect x="6" y="5" width="12" height="15" rx="2" />
      {/* Center Details */}
      <path d="M6 11h12" opacity="0.4" />
      <path d="M6 15h12" opacity="0.4" />
      {/* Wheels */}
      <circle cx="8.5" cy="21.5" r="1" fill="currentColor" />
      <circle cx="15.5" cy="21.5" r="1" fill="currentColor" />
    </svg>
  );
}

export default MediumCase;
