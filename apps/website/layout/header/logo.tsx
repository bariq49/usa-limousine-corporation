import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoVariant = "dark" | "white";

interface LogoProps {
  variant?: LogoVariant;
  className?: string;
}

/** dark = black+orange for white headers; white = white+orange for dark/hero headers */
const LOGO_SRC_BY_VARIANT: Record<LogoVariant, string> = {
  dark: "/assets/logo/logo-dark.png",
  white: "/assets/logo/logo-white.png",
};

export function Logo({ variant = "white", className }: LogoProps) {
  return (
    <div className={cn("flex items-center justify-start", className)}>
      <Link
        href="/"
        className="relative flex h-12 w-58 items-center transition-opacity duration-300 hover:opacity-90 sm:h-14 sm:w-68 md:h-16 md:w-78"
      >
        <Image
          src={LOGO_SRC_BY_VARIANT[variant]}
          alt="USA Limousine"
          fill
          sizes="(min-width: 768px) 312px, (min-width: 640px) 272px, 232px"
          className="object-contain object-left"
          priority
        />
      </Link>
    </div>
  );
}
