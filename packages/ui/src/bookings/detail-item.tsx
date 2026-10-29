import type { DetailItemProps } from "../types/bookings";

export function DetailItem(props: DetailItemProps) {
  const { icon, children, className } = props;

  return (
    <div
      className={["grid grid-cols-[20px_minmax(0,1fr)] items-start gap-3", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="mt-0.5 shrink-0 text-default-900">{icon}</div>
      <div className="min-w-0 break-words text-sm font-semibold text-default-900">{children}</div>
    </div>
  );
}
