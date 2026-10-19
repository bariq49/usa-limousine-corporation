import Image from "next/image";
import { cn } from "../utils/cn";

type LogoVariant = "full" | "short";

type LogoProps = {
  className?: string;
  variant?: LogoVariant;
};

import logoFull from "../../public/assets/logo/logo-full.png";
import logoShort from "../../public/assets/logo/logo-short.png";

function Logo({ className, variant = "full" }: LogoProps) {
  const isShort = variant === "short";
  const src = isShort ? logoShort : logoFull;

  return (
    <span
      aria-label="Nav Airport Limo"
      className={cn(
        "relative inline-block select-none",
        className,
        isShort ? "!h-10 !w-14" : "!h-14 !w-56",
      )}
    >
      <Image
        src={src}
        alt="USA Limousine Corporation"
        fill
        sizes={isShort ? "66px" : "224px"}
        className={cn("object-contain", isShort ? "object-center" : "object-left")}
        priority
      />
    </span>
  );
}

export default Logo;
