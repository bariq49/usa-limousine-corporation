import type { SVGProps } from "react";

function Luggage({ ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path opacity="0.35" d="M15 6V4c0-1.1-.9-2-2-2h-2c-1.1 0-2 .9-2 2v2h6z" fill="currentColor" />
      <path
        d="M18 6H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM9 16H7.5V9H9v7zm3.5 0H11V9h1.5v7zm3.5 0H14.5V9H16v7z"
        fill="currentColor"
      />
      <path
        opacity="0.6"
        d="M7.5 21a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm9 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"
        fill="currentColor"
      />
    </svg>
  );
}

export default Luggage;
