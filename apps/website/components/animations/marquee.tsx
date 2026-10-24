import { cn } from "@/lib/utils";

type Props = {
  text: string;
  className?: string;
};

/** Text that scrolls sideways in a loop, for lines too long to fit on small screens. */
export function Marquee({ text, className }: Props) {
  return (
    <div className={cn("overflow-hidden", className)}>
      <div className="flex w-max animate-marquee motion-reduce:animate-none">
        <span className="pr-8">{text}</span>
        <span className="pr-8" aria-hidden>
          {text}
        </span>
      </div>
    </div>
  );
}
