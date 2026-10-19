import type { SVGProps } from "react";

function SteeringWheel({ ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Outer steering rim */}
      <circle cx="12" cy="12" r="9.5" />
      {/* Inner hub */}
      <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.12" />
      {/* Horizontal spokes */}
      <path d="M2.5 12H9" />
      <path d="M15 12H21.5" />
      {/* Lower dual support spokes */}
      <path d="M10.3 14.5L8.8 20.9" />
      <path d="M13.7 14.5L15.2 20.9" />
      {/* Center horn/badge dot */}
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default SteeringWheel;
