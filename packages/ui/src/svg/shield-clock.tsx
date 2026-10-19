import type { SVGProps } from "react";

function ShieldClock({ ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        opacity="0.35"
        d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
        fill="currentColor"
      />
      <path
        d="M12 7.5a.75.75 0 0 1 .75.75v3.69l2.28 2.28a.75.75 0 1 1-1.06 1.06l-2.5-2.5a.75.75 0 0 1-.22-.53v-4a.75.75 0 0 1 .75-.75z"
        fill="currentColor"
      />
    </svg>
  );
}

export default ShieldClock;
