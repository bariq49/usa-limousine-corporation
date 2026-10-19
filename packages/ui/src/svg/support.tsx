import type { SVGProps } from "react";

function Support({ ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        opacity="0.35"
        d="M12 13.25c-3.55 0-6.45 2.28-6.45 5.1 0 .36.29.65.65.65h11.6c.36 0 .65-.29.65-.65 0-2.82-2.9-5.1-6.45-5.1Z"
        fill="currentColor"
      />
      <path d="M12 12.1a3.95 3.95 0 1 0 0-7.9 3.95 3.95 0 0 0 0 7.9Z" fill="currentColor" />
      <path
        d="M7.15 9.2a.75.75 0 0 1-.75-.75V7.8A5.6 5.6 0 0 1 12 2.25a5.6 5.6 0 0 1 5.6 5.55v.65a.75.75 0 0 1-1.5 0V7.8a4.1 4.1 0 0 0-8.2 0v.65c0 .41-.34.75-.75.75Z"
        fill="currentColor"
      />
      <path
        d="M6.4 14.1a1.85 1.85 0 0 1-1.85-1.85v-1.7A1.85 1.85 0 0 1 6.4 8.7h.55c.41 0 .75.34.75.75v3.9c0 .41-.34.75-.75.75H6.4ZM17.6 14.1h-.55a.75.75 0 0 1-.75-.75v-3.9c0-.41.34-.75.75-.75h.55a1.85 1.85 0 0 1 1.85 1.85v1.7a1.85 1.85 0 0 1-1.85 1.85Z"
        fill="currentColor"
      />
      <path
        d="M18.35 14.85h-.2a.75.75 0 0 1 0-1.5h.2c.69 0 1.25.56 1.25 1.25v1.55c0 .97-.78 1.75-1.75 1.75h-.85a.75.75 0 0 1 0-1.5h.85c.14 0 .25-.11.25-.25v-1.3Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default Support;
