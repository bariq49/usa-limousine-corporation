import React from "react";

function StarSparkle({ ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M9.22 5.84a.42.42 0 0 1 .76 0l1.85 3.74a1.7 1.7 0 0 0 1.28.93l4.13.6a.42.42 0 0 1 .24.73l-2.99 2.91a1.7 1.7 0 0 0-.49 1.5l.71 4.11a.42.42 0 0 1-.62.45l-3.69-1.94a1.7 1.7 0 0 0-1.58 0l-3.69 1.94a.42.42 0 0 1-.62-.45l.71-4.11a1.7 1.7 0 0 0-.49-1.5L1.73 11.84a.42.42 0 0 1 .24-.73l4.13-.6a1.7 1.7 0 0 0 1.28-.93z"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        d="M19 1.5v5M16.5 4h5M21.5 9v3M20 10.5h3"
      />
    </svg>
  );
}

export default StarSparkle;
