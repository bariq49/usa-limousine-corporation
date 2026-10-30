import Image from "next/image";
import Link from "next/link";
import { PLATFORM } from "@usa-limousine-corporation/config";
import { ASSETS } from "../assets/images";
import { cn } from "../utils/cn";

type LogoVariant = "full" | "short";
type LogoTone = "auto" | "dark" | "white";
type LogoSize = "md" | "lg";

type LogoProps = {
  variant?: LogoVariant;
  tone?: LogoTone;
  size?: LogoSize;
  href?: string;
  className?: string;
};

const FULL_SIZES: Record<LogoSize, string> = {
  md: "h-10 w-60",
  lg: "h-10 w-58 sm:h-11 sm:w-68 md:h-13 md:w-78",
};

function ShortMark({ className }: { className?: string | undefined }) {
  return (
    <span className={cn("relative inline-block h-12 w-12 select-none", className)}>
      <Image
        src={ASSETS.logo.short}
        alt={PLATFORM.name}
        fill
        sizes="96px"
        className="object-contain"
        priority
      />
    </span>
  );
}

function FullMark({
  tone,
  size,
  className,
}: {
  tone: LogoTone;
  size: LogoSize;
  className?: string | undefined;
}) {
  return (
    <span
      aria-label={PLATFORM.name}
      className={cn("relative inline-block select-none", FULL_SIZES[size], className)}
    >
      {tone !== "white" ? (
        <Image
          src={ASSETS.logo.dark}
          alt={PLATFORM.name}
          fill
          sizes="(min-width: 768px) 320px, 240px"
          className={cn("object-contain object-left", tone === "auto" && "dark:hidden")}
          priority
        />
      ) : null}
      {tone !== "dark" ? (
        <Image
          src={ASSETS.logo.white}
          alt={tone === "white" ? PLATFORM.name : ""}
          aria-hidden={tone === "auto"}
          fill
          sizes="(min-width: 768px) 320px, 240px"
          className={cn("object-contain object-left", tone === "auto" && "hidden dark:block")}
          priority
        />
      ) : null}
    </span>
  );
}

export function Logo({ variant = "full", tone = "auto", size = "md", href, className }: LogoProps) {
  const mark =
    variant === "short" ? (
      <ShortMark className={className} />
    ) : (
      <FullMark tone={tone} size={size} className={className} />
    );

  if (!href) return mark;

  return (
    <Link href={href} className="inline-flex transition-opacity duration-300 hover:opacity-90">
      {mark}
    </Link>
  );
}
