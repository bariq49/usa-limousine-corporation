import type { SVGProps } from "react";

function Wheelchair({ ...props }: SVGProps<SVGSVGElement>) {
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
      <circle cx="16" cy="4" r="2" />
      <path d="M9 13a5 5 0 1 0 5 5" />
      <path d="M9 9h5l1.5 5.5H20l1.5 4" />
    </svg>
  );
}

export default Wheelchair;
