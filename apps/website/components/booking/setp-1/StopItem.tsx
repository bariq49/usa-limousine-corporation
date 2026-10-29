import React from "react";
import { Input } from "@usa-limousine-corporation/ui/components/input";
import { Close } from "@usa-limousine-corporation/ui/svg";
import { formatPrice } from "@usa-limousine-corporation/ui/utils/price";

interface StopItemProps {
  index: number;
  onRemove: (index: number) => void;
  stopFeePerStop?: number;
}

export const StopItem: React.FC<StopItemProps> = ({ index, onRemove, stopFeePerStop = 0 }) => {
  return (
    <div className="flex items-center gap-1">
      <div className="w-5 h-5 rounded-full border-4 border-secondary bg-white z-10 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="relative">
          <Input
            name={`stops.${index}.address`}
            type="location"
            label={
              <>
                Stop {index + 1}
                {stopFeePerStop > 0 ? (
                  <span className="text-secondary ml-1">({formatPrice({ price: stopFeePerStop })} extra)</span>
                ) : null}
              </>
            }
            placeholder="Enter Stop Location"
            className="flex-1"
          />
          <button
            type="button"
            onClick={() => onRemove(index)}
            aria-label={`Remove stop ${index + 1}`}
            className="absolute -top-2 -right-2 z-20 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-secondary text-white"
          >
            <Close width={12} height={12} />
          </button>
        </div>
      </div>
    </div>
  );
};
