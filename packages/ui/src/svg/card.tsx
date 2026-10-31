import type { SVGProps } from "react";

function Card({ ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        opacity="0.35"
        d="M2 10.392V12C2 15.7712 2 17.6569 3.17157 18.8284C4.34315 20 6.22876 20 10 20H14C17.7712 20 19.6569 20 20.8284 18.8284C22 17.6569 22 15.7712 22 12V10.392H2Z"
        fill="currentColor"
      />
      <path
        d="M2 9C2.0663 7.07507 2.3031 5.91916 3.14881 5.11578C4.3234 4 6.21388 4 9.99484 4H14.0052C17.7861 4 19.6766 4 20.8512 5.11578C21.6969 5.91916 21.9337 7.07507 22 9V10H2V9Z"
        fill="currentColor"
      />
      <path
        d="M5.25 15.25C4.83579 15.25 4.5 15.5858 4.5 16C4.5 16.4142 4.83579 16.75 5.25 16.75H9.75C10.1642 16.75 10.5 16.4142 10.5 16C10.5 15.5858 10.1642 15.25 9.75 15.25H5.25Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default Card;
