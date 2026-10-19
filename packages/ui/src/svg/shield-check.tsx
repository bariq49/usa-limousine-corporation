import type { SVGProps } from "react";

function ShieldCheck({ ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        opacity="0.35"
        d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
        fill="currentColor"
      />
      <path
        d="M16.293 8.293a1 1 0 0 0-1.414 0L11 12.172 8.121 9.293a1 1 0 0 0-1.414 1.414l3.586 3.586a1 1 0 0 0 1.414 0l4.586-4.586a1 1 0 0 0 0-1.414z"
        fill="currentColor"
      />
    </svg>
  );
}

export default ShieldCheck;
