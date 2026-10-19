function Blog({ ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        opacity="0.35"
        d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z"
        fill="currentColor"
      />
      <path
        d="M7 8H17C17.5523 8 18 7.55228 18 7C18 6.44772 17.5523 6 17 6H7C6.44772 6 6 6.44772 6 7C6 7.55228 6.44772 8 7 8Z"
        fill="currentColor"
      />
      <path
        d="M7 12H17C17.5523 12 18 11.5523 18 11C18 10.4477 17.5523 10 17 10H7C6.44772 10 6 10.4477 6 11C6 11.5523 6.44772 12 7 12Z"
        fill="currentColor"
      />
      <path
        d="M7 16H13C13.5523 16 14 15.5523 14 15C14 14.4477 13.5523 14 13 14H7C6.44772 14 6 14.4477 6 15C6 15.5523 6.44772 16 7 16Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default Blog;
