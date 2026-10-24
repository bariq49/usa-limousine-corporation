import type { SVGProps } from "react";

/** Instagram logo in its brand colours. */
function Instagram({ ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id="instagram-gradient" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#FEDA75" />
          <stop offset="0.35" stopColor="#FA7E1E" />
          <stop offset="0.65" stopColor="#D62976" />
          <stop offset="1" stopColor="#962FBF" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#instagram-gradient)" strokeWidth="2.2">
        <rect x="2" y="2" width="20" height="20" rx="5.5" />
        <circle cx="12" cy="12" r="4.6" />
      </g>
      <circle cx="17.6" cy="6.4" r="1.35" fill="url(#instagram-gradient)" />
    </svg>
  );
}

export default Instagram;
