import type { SVGProps } from "react";

/** Outline icon; paths from Lucide (ISC). */
function ChevronRight({ ...props }: SVGProps<SVGSVGElement>) {
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
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export default ChevronRight;
