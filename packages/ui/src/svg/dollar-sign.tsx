import type { SVGProps } from "react";

function DollarSign({ ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M12 2.5V21.5"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        opacity="0.35"
      />
      <path
        d="M17 6.5H9.5C7.567 6.5 6 8.067 6 10C6 11.933 7.567 13.5 9.5 13.5H14.5C16.433 13.5 18 15.067 18 17C18 18.933 16.433 20.5 14.5 20.5H6.5"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default DollarSign;
