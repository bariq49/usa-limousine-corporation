import type { SVGProps } from "react";

function Ski({ ...props }: SVGProps<SVGSVGElement>) {
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
      <path d="M4 21L19.5 3.5C20.3 2.6 21.6 3 21.9 4.1L22 4.5" />
      <path d="M2 17L16.5 2.5C17.3 1.6 18.6 2 18.9 3.1L19 3.5" />
      <path d="M7 2.5l-4 19M16 7l-4 14.5" strokeWidth="1.5" />
      <path d="M2 19h2.5M10.5 19H13" strokeWidth="1.5" />
    </svg>
  );
}

export default Ski;
