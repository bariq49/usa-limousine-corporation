import React from "react";
import { ArrowDownUp } from "@usa-limousine-corporation/ui/svg";
import { cn } from "@/lib/utils";

interface SwapButtonProps {
  onSwap: () => void;
  isSwapping: boolean;
  className?: string;
}

export const SwapButton: React.FC<SwapButtonProps> = ({ onSwap, isSwapping, className }) => {
  return (
    <button
      type="button"
      onClick={onSwap}
      className={cn(
        "p-1 rounded transition-all duration-300 focus-visible:outline-secondary cursor-pointer",
        className,
      )}
      aria-label="Swap locations"
    >
      <ArrowDownUp
        className={cn(
          "w-5 h-5 text-secondary transition-transform duration-300",
          isSwapping && "rotate-180",
        )}
      />
    </button>
  );
};
