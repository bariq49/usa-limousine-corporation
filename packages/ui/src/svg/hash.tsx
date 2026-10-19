function Hash({ ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        opacity="0.35"
        d="M8 3V21M16 3V21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M4 9H20M4 15H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
export default Hash;
