import type { SVGProps } from "react";

function MessageSquare({ ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        opacity="0.35"
        d="M19 3H5C3.89543 3 3 3.89543 3 5V16C3 17.1046 3.89543 18 5 18H7.5L10.2929 20.7929C11.0536 21.5536 12.3464 21.5536 13.1071 20.7929L15.9 18H19C20.1046 18 21 17.1046 21 16V5C21 3.89543 20.1046 3 19 3Z"
        fill="currentColor"
      />
      <path
        d="M8 8H16C16.5523 8 17 7.55228 17 7C17 6.44772 16.5523 6 16 6H8C7.44772 6 7 6.44772 7 7C7 7.55228 7.44772 8 8 8Z"
        fill="currentColor"
      />
      <path
        d="M8 12H14C14.5523 12 15 11.5523 15 11C15 10.4477 14.5523 10 14 10H8C7.44772 10 7 10.4477 7 11C7 11.5523 7.44772 12 8 12Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default MessageSquare;
