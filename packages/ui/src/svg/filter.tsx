import type { SVGProps } from "react";

function Filter({ ...props }: SVGProps<SVGSVGElement>) {
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
      <polygon points="4 4 20 4 14 12 14 19 10 21 10 12 4 4" />
    </svg>
  );
}

export default Filter;
