import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MiniMonthCalendar } from "../../packages/ui/src/components/bookings/mini-month-calendar";
import { formatDate, formatDateTime } from "../../packages/ui/src/utils/date";

describe("app timezone dates", () => {
  afterEach(() => vi.useRealTimers());

  it("shows a pickup date as the same calendar day", () => {
    expect(formatDate({ date: "2026-08-25" })).toBe("Aug 25, 2026");
    expect(formatDate({ date: "2026-01-01" })).toBe("Jan 1, 2026");
  });

  it("formats instants in New York time", () => {
    expect(formatDateTime({ date: "2026-08-25T02:30:00Z" })).toBe("Aug 24, 2026, 10:30 PM");
  });

  it("marks today from New York, not the browser", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2027-01-01T03:15:00Z"));

    render(
      <MiniMonthCalendar
        month={new Date(2026, 11, 1)}
        selected={new Date(2026, 11, 1)}
        onMonthChange={() => undefined}
        onSelect={() => undefined}
      />,
    );

    const lastDay = screen.getAllByRole("button", { name: "31" })[0];
    expect(lastDay?.className).toContain("bg-default-100");
  });
});
