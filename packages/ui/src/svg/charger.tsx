import React from "react";

function Charger({ ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        opacity="0.35"
        d="M16 4H8C6.9 4 6 4.9 6 6V20C6 21.1 6.9 22 8 22H16C17.1 22 18 21.1 18 20V6C18 4.9 17.1 4 16 4Z"
        fill="currentColor"
      />
      <path d="M10 2H14V4H10V2ZM13.5 12.5H15L10.5 19V13.5H9L13.5 7V12.5Z" fill="currentColor" />
    </svg>
  );
}

export default Charger;
