import type { SVGProps } from "react";

function Train({ ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        fill="currentColor"
        d="M12 2c-4 0-8 .5-8 4v9.5A3.5 3.5 0 0 0 7.5 19L6 21h2l1.5-2h5L16 21h2l-1.5-2A3.5 3.5 0 0 0 20 15.5V6c0-3.5-4-4-8-4ZM7.5 16.5a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Zm9 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5ZM7 7h10v4H7V7Z"
      />
    </svg>
  );
}

export default Train;
