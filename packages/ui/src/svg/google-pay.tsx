import type { SVGProps } from "react";

/** Monochrome payment method badge; takes its colour from `currentColor`. */
function GooglePay({ ...props }: SVGProps<SVGSVGElement>) {
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
        y="16"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="9"
        fontWeight="700"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        G Pay
      </text>
    </svg>
  );
}

export default GooglePay;
