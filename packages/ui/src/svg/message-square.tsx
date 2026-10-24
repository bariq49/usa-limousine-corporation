import type { SVGProps } from "react";

/** Outline icon; paths from Lucide (ISC). */
function MessageSquare({ ...props }: SVGProps<SVGSVGElement>) {
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
    ></svg>
  );
}

export default MessageSquare;
