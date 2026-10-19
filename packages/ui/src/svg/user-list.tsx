import type { SVGProps } from "react";

function UserList({ ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Profile avatar */}
      <circle cx="8" cy="7" r="3.5" />
      <path d="M2.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
      {/* Directory list lines with bullets */}
      <path d="M16.5 6H21" />
      <path d="M16.5 11H21" />
      <path d="M16.5 16H19.5" />
      <circle cx="14" cy="6" r="0.75" fill="currentColor" stroke="none" />
      <circle cx="14" cy="11" r="0.75" fill="currentColor" stroke="none" />
      <circle cx="14" cy="16" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default UserList;
