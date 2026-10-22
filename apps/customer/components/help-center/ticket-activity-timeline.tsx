"use client";

import { timelineStamp } from "@/lib/utils/activity-timeline";
import type { TicketActivityItem } from "@/lib/utils/ticket-activity";

type Props = {
  items: TicketActivityItem[];
};

export function TicketActivityTimeline(props: Props) {
  const { items } = props;

  if (items.length === 0) {
    return <p className="text-sm text-default-500">No activity yet.</p>;
  }

  return (
    <ul className="space-y-0">
      {items.map((item, index) => {
        const stamp = timelineStamp({ date: item.at });
        const isLast = index === items.length - 1;

        return (
          <li key={item.id} className="relative flex gap-4">
            <div className="relative flex w-4 shrink-0 flex-col items-center">
              <span
                className={`relative z-10 mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${item.color}`}
              />
              {!isLast ? <span className="mt-1 w-px flex-1 bg-border" /> : null}
            </div>

            <div className={`min-w-0 flex-1 ${isLast ? "pb-0" : "pb-5"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-1">
                  <h4 className="text-sm font-semibold text-default-900">{item.title}</h4>
                  <p className="text-sm leading-5 text-default-500">{item.description}</p>
                  {item.meta ? (
                    <p className="text-xs leading-5 text-default-400">{item.meta}</p>
                  ) : null}
                </div>

                <div className="w-[88px] shrink-0 text-right sm:w-[100px]">
                  <div className="text-xs font-medium text-default-500">{stamp.primary}</div>
                  {stamp.secondary ? (
                    <div className="mt-0.5 text-[11px] text-default-400">{stamp.secondary}</div>
                  ) : null}
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
