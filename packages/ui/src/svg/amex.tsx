import type { SVGProps } from "react";

/** Monochrome payment method badge; takes its colour from `currentColor`. */
function Amex({ ...props }: SVGProps<SVGSVGElement>) {
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
        y="11.2"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="5.6"
        fontWeight="800"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        AMERICAN
      </text>
      <text
        x="19"
        y="18"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="5.6"
        fontWeight="800"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        EXPRESS
      </text>
    </svg>
  );
}

export default Amex;
