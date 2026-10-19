function Building({ ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        opacity="0.35"
        d="M6 22H18V4C18 2.9 17.1 2 16 2H8C6.9 2 6 2.9 6 4V22Z"
        fill="currentColor"
      />
      <path d="M10 6H14V8H10V6ZM10 10H14V12H10V10ZM10 14H14V16H10V14Z" fill="currentColor" />
    </svg>
  );
}
export default Building;
