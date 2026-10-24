import type { SVGProps } from "react";

/** Outline icon; paths from Lucide (ISC). */
function EyeOff({ ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
      <path d="m2 2 20 20" />
    </svg>
  );
}

export default EyeOff;
