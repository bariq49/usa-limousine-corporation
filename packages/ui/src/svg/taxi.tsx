import type { SVGProps } from "react";

function Taxi({ ...props }: SVGProps<SVGSVGElement>) {
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
      {/* Taxi Roof Light */}
      <path d="M9.5 3.5h5v2h-5z" fill="currentColor" fillOpacity="0.15" />
      {/* Windshield / Cab */}
      <path d="M5.5 11l1.8-5.5a1.5 1.5 0 011.4-1h6.6a1.5 1.5 0 011.4 1l1.8 5.5" />
      {/* Front Body */}
      <rect x="3" y="11" width="18" height="8" rx="2" />
      {/* Headlights */}
      <circle cx="6.5" cy="14.5" r="1" fill="currentColor" />
      <circle cx="17.5" cy="14.5" r="1" fill="currentColor" />
      {/* Grille */}
      <path d="M10 15h4" />
      {/* Tires */}
      <path d="M5.5 19v2" />
      <path d="M18.5 19v2" />
    </svg>
  );
}

export default Taxi;
