import type { SVGProps } from "react";

/** Monochrome payment method badge; takes its colour from `currentColor`. */
function Mastercard({ ...props }: SVGProps<SVGSVGElement>) {
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
      <circle cx="15" cy="12" r="6.5" fill="#FFFFFF" />
      <circle cx="23" cy="12" r="6.5" fill="#FFFFFF" fillOpacity="0.6" />
    </svg>
  );
}

export default Mastercard;
