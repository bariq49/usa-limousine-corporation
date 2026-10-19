import React from "react";

function Wifi({ ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        opacity="0.35"
        d="M22.61 7.05C19.8 4.29 16 2.5 12 2.5C8 2.5 4.2 4.29 1.39 7.05L2.81 8.46C5.23 6.09 8.45 4.5 12 4.5C15.55 4.5 18.77 6.09 21.19 8.46L22.61 7.05Z"
        fill="currentColor"
      />
      <path
        opacity="0.35"
        d="M18.36 11.29C16.74 9.69 14.47 8.7 12 8.7C9.53 8.7 7.26 9.69 5.64 11.29L7.05 12.71C8.32 11.45 10.07 10.7 12 10.7C13.93 10.7 15.68 11.45 16.95 12.71L18.36 11.29Z"
        fill="currentColor"
      />
      <path
        d="M12 14C10.5 14 9.22 14.53 8.19 15.39L12 20.3L15.81 15.39C14.78 14.53 13.5 14 12 14Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default Wifi;
