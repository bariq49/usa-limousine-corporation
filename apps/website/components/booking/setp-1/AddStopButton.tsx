import React from "react";
import { Plus } from "@usa-limousine-corporation/ui/svg";
import { cn } from "@/lib/utils";

interface AddStopButtonProps {
  onAdd: () => void;
  className?: string;
  label?: string;
}

export const AddStopButton: React.FC<AddStopButtonProps> = ({ onAdd, className, label }) => {
  const displayLabel = label || "Add Stop";

  return (
    <button
      type="button"
      onClick={onAdd}
      className={cn(
        "inline-flex items-center gap-2 py-1 transition-all group cursor-pointer",
        className,
      )}
      aria-label="Add a stop to your journey"
    >
      <div className="w-5 h-5 flex items-center justify-center bg-secondary text-white rounded-full group-hover:scale-110 transition-transform shadow-sm">
        <Plus className="w-3.5 h-3.5 stroke-3" />
      </div>
      <span className="text-secondary font-bold text-sm tracking-wide group-hover:translate-x-1 transition-transform uppercase">
        {displayLabel}
      </span>
    </button>
  );
};
