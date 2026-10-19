import type { SVGProps } from "react";

function CabinBag({ ...props }: SVGProps<SVGSVGElement>) {
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
      {/* Travel Bag / Cabin Duffel Body */}
      <rect x="3" y="8" width="18" height="13" rx="3" />
      {/* Top Handles */}
      <path d="M8 8V4a1.5 1.5 0 0 1 1.5-1.5h5A1.5 1.5 0 0 1 16 4v4" />
      {/* Center Zipper & Pocket */}
      <path d="M3 13h18" opacity="0.4" />
      <rect x="8" y="13.5" width="8" height="4.5" rx="1" opacity="0.5" />
    </svg>
  );
}

export default CabinBag;
