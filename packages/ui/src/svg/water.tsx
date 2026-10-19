import React from "react";

function Water({ ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        opacity="0.35"
        d="M12,20A6,6,0,0,1,6,14C6,10,12,3.25,12,3.25S18,10,18,14A6,6,0,0,1,12,20Z"
        fill="currentColor"
      />
      <path
        d="M13,14A1,1,0,0,1,12,15A1,1,0,0,1,11,14A1,1,0,0,1,12,13A1,1,0,0,1,13,14Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default Water;
