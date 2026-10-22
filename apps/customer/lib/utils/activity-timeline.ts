import {
  formatDate,
  formatRelativeTime,
  formatTime,
} from "@usa-limousine-corporation/ui/utils/date";

type StampProps = {
  date?: string | null | undefined;
};

type Stamp = {
  primary: string;
  secondary: string;
};

export function timelineStamp(props: StampProps): Stamp {
  const { date } = props;

  if (!date) {
    return { primary: "—", secondary: "" };
  }

  const relative = formatRelativeTime({ date });
  if (relative === "Just now" || relative.endsWith("m ago") || relative.endsWith("h ago")) {
    return { primary: relative, secondary: "" };
  }

  const absoluteDate = formatDate({ date });
  const absoluteTime = formatTime({ date });

  return {
    primary: absoluteDate !== "—" ? absoluteDate : relative,
    secondary: absoluteTime !== "—" ? absoluteTime : "",
  };
}
