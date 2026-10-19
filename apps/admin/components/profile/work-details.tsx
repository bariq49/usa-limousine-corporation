import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@usa-limousine-corporation/ui/components/card";
import { Luggage, CalendarClock, Grid, Graph, Calendar } from "@usa-limousine-corporation/ui/svg";
import { formatDate } from "@usa-limousine-corporation/ui/utils/date";
import type { Driver } from "@/lib/types/drivers";

export interface WorkDetailsProps {
  driver?: Driver | null | undefined;
}

function formatShiftLabel(driver?: Driver | null) {
  const shift = driver?.shift?.toUpperCase();
  if (!shift) return "—";

  const label = shift.charAt(0) + shift.slice(1).toLowerCase();
  if (shift === "FLEXIBLE") {
    return label;
  }

  if ((shift === "DAY" || shift === "NIGHT") && driver?.startTime && driver?.endTime) {
    return `${label} (${driver.startTime} – ${driver.endTime})`;
  }

  return label;
}

export function WorkDetails({ driver }: WorkDetailsProps) {
  const shift = driver?.shift?.toUpperCase();
  const showTiming = shift === "DAY" || shift === "NIGHT";

  return (
    <Card className="h-full w-full shadow-xs border border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 -ml-2">
          <Luggage className="h-6 w-6 text-primary" />
          <CardTitle className="text-lg font-semibold text-default-900">
            Work & Licensing Details
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="flex w-[145px] shrink-0 items-center gap-2">
                <Grid className="h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm font-semibold text-default-800">KVK Number:</span>
              </div>
              <span className="min-w-0 flex-1 break-words text-sm text-default-700">
                {driver?.kvkNo || "—"}
              </span>
            </li>

            <li className="flex items-start gap-3">
              <div className="flex w-[145px] shrink-0 items-center gap-2">
                <CalendarClock className="h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm font-semibold text-default-800">License Expiry:</span>
              </div>
              <span className="min-w-0 flex-1 break-words text-sm text-default-700">
                {driver?.licenseExpiry ? formatDate({ date: driver.licenseExpiry }) : "—"}
              </span>
            </li>

            <li className="flex items-start gap-3">
              <div className="flex w-[145px] shrink-0 items-center gap-2">
                <Calendar className="h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm font-semibold text-default-800">Shift Type:</span>
              </div>
              <span className="min-w-0 flex-1 break-words text-sm text-default-700 capitalize">
                {formatShiftLabel(driver)}
              </span>
            </li>

            {showTiming ? (
              <li className="flex items-start gap-3">
                <div className="flex w-[145px] shrink-0 items-center gap-2">
                  <CalendarClock className="h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm font-semibold text-default-800">Shift Hours:</span>
                </div>
                <span className="min-w-0 flex-1 break-words text-sm text-default-700">
                  {driver?.startTime && driver?.endTime
                    ? `${driver.startTime} – ${driver.endTime}`
                    : "—"}
                </span>
              </li>
            ) : null}

            <li className="flex items-start gap-3">
              <div className="flex w-[145px] shrink-0 items-center gap-2">
                <Graph className="h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm font-semibold text-default-800">Status:</span>
              </div>
              <span className="min-w-0 flex-1 break-words text-sm text-default-700">
                {driver?.status || "—"}
              </span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
