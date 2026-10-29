"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@usa-limousine-corporation/ui/components/select";
import { STATS_PERIODS } from "@/config/periods";
import type { StatsPeriod } from "@/lib/types/drivers";

export function PeriodSelect(props: {
  value: StatsPeriod;
  onChange: (value: StatsPeriod) => void;
}) {
  return (
    <Select value={props.value} onValueChange={(value) => props.onChange(value as StatsPeriod)}>
      <SelectTrigger className="h-9 w-32" aria-label="Period">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATS_PERIODS.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
