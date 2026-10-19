function Signpost({ ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        opacity="0.35"
        d="M11 22V16H5C4.45 16 4 15.55 4 15V11C4 10.45 4.45 10 5 10H11V8H17L21 12L17 16H11Z"
        fill="currentColor"
      />
      <path d="M11 2V8H13V2H11ZM11 16V22H13V16H11Z" fill="currentColor" />
    </svg>
  );
}
export default Signpost;
