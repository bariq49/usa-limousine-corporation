import Image from "next/image";
import { cn } from "../utils/cn";
import logoFull from "../../public/assets/logo/logo-full.png";

type LogoVariant = "full" | "short";

type LogoProps = {
  className?: string;
  variant?: LogoVariant;
};

function Logo({ className, variant = "full" }: LogoProps) {
  const isShort = variant === "short";

  if (isShort) {
    return (
      <span
        aria-label="USA Limousine Corporation"
        className={cn("relative inline-flex !h-12 !w-12 select-none items-center", className)}
      >
        <svg viewBox="0 0 48 48" role="img" aria-hidden="true" className="h-full w-full">
          <path
            d="M6 15.5 13 8h23l-5 7.5H6Z"
            fill="var(--primary, #C9A84C)"
          />
          <path
            d="m9 26 5.7-6.2H31L26.5 26H9Z"
            fill="var(--primary, #C9A84C)"
            opacity="0.82"
          />
          <path
            d="m13 35 4.7-5.1h10.8L24 35H13Z"
            fill="var(--primary, #C9A84C)"
            opacity="0.64"
          />
          <path
            d="M17 20h14.5M13.5 26h13M17.5 31h8"
            stroke="var(--foreground, #0F172A)"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </svg>
      </span>
    );
  }

  return (
    <span
      aria-label="USA Limousine Corporation"
      className={cn("relative inline-block !h-14 !w-56 select-none", className)}
    >
      <Image
        src={logoFull}
        alt="USA Limousine Corporation"
        fill
        sizes="224px"
        className="object-contain object-left"
        priority
      />
    </span>
  );
}

export default Logo;
