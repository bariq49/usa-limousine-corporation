import type { SVGProps } from "react";

function GolfBag({ ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect x="7" y="9" width="8" height="13" rx="2" />
      <path d="M15 11c3 1.5 3 6 0 8" />
      <path d="M10 13h2v4h-2z" strokeWidth="1.5" />
      <path d="M10 9V4l2-1.5M12 9V3l2.5-1M8.5 9V5l-1.5-1" />
    </svg>
  );
}

export default GolfBag;
