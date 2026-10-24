import type { SVGProps } from "react";

/** Facebook logo in its brand colours. */
function Facebook({ ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="12" cy="12" r="12" fill="#0866FF" />
      <path
        fill="#fff"
        d="M13.4 24v-8.29h2.79l.42-3.24H13.4v-2.06c0-.94.26-1.58 1.6-1.58h1.7V5.94a22.8 22.8 0 0 0-2.49-.13c-2.47 0-4.16 1.5-4.16 4.27v2.39H7.26v3.24h2.79V24h3.35Z"
      />
    </svg>
  );
}

export default Facebook;
