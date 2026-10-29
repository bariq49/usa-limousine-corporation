import { cloneElement, isValidElement } from "react";
import type { DetailItemProps } from "../../types/bookings";

export function DetailItem(props: DetailItemProps) {
  const { icon, children, className } = props;
  const sizedIcon =
    isValidElement<{ className?: string }>(icon)
      ? cloneElement(icon, {
          className: ["block size-5 shrink-0", icon.props.className].filter(Boolean).join(" "),
        })
      : icon;

  return (
    <div
      className={["flex items-center gap-3", className].filter(Boolean).join(" ")}
    >
      <span className="inline-flex size-5 shrink-0 items-center justify-center text-default-900 [&>svg]:block [&>svg]:size-5">
        {sizedIcon}
      </span>
      <div className="min-w-0 flex-1 break-words text-sm font-semibold leading-5 text-default-900">
        {children}
      </div>
    </div>
  );
}
