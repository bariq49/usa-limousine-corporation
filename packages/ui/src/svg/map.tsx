function Map({ ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path opacity="0.35" d="M9 18V4L3 6V20L9 18ZM15 6V20L21 18V4L15 6Z" fill="currentColor" />
      <path d="M9 18L15 6M9 4L15 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
export default Map;
