import { useQuery } from "@tanstack/react-query";
import { formatHrs } from "@usa-limousine-corporation/ui/utils/duration";
import { getHourlyDurations } from "@/lib/api/hourly-durations";

export const useHourlyDurations = (enabled = true) => {
  return useQuery({
    queryKey: ["hourly-durations"],
    queryFn: getHourlyDurations,
    enabled,
    select: (hours) =>
      hours.map((value) => ({
        label: formatHrs({ hours: value }),
        value: String(value),
      })),
  });
};
