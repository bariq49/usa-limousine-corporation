import { cn } from "../utils/cn";

type Props = {
  text: string;
  className?: string | undefined;
};

export function Marquee({ text, className }: Props) {
  return (
    <div className={cn("overflow-hidden", className)}>
      <div className="ui-marquee flex w-max">
        <span className="pr-8">{text}</span>
        <span className="pr-8" aria-hidden>
          {text}
        </span>
      </div>
      <style>{`
        .ui-marquee { animation: ui-marquee 12s linear infinite; }
        @keyframes ui-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @media (prefers-reduced-motion: reduce) { .ui-marquee { animation: none; } }
      `}</style>
    </div>
  );
}
