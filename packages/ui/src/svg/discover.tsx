import type { SVGProps } from "react";

/** Monochrome payment method badge; takes its colour from `currentColor`. */
function Discover({ ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 38 24"
      width="38"
      height="24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect width="38" height="24" rx="3" fill="currentColor" />
      <text
        x="19"
        y="15"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="6.4"
        fontWeight="800"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        DISCOVER
      </text>
    </svg>
  );
}

export default Discover;
