function Home({ ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        opacity="0.35"
        d="M19 12H22L12 3L2 12H5V20C5 20.55 5.45 21 6 21H18C18.55 21 19 20.55 19 20V12Z"
        fill="currentColor"
      />
      <path d="M10 21V14H14V21H10Z" fill="currentColor" />
    </svg>
  );
}
export default Home;
