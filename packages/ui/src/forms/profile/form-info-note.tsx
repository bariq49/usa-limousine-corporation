import type { ReactNode } from "react";
import { Info } from "lucide-react";
import { cn } from "../../utils/cn";

export function FormInfoNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("mb-6 flex items-start gap-2.5", className)}>
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-default-400" />
      <p className="text-sm leading-relaxed text-default-500">{children}</p>
    </div>
  );
}
