import { BadRequestException } from "@nestjs/common";
import { BlogStatus } from "@prisma/client";
import { wallClock } from "../../../common/utils/day-bounds";
import { formatDate } from "../../../common/utils/format-date";
import { APP_TIMEZONE, formatTime } from "../../../common/utils/format-time";
import type { ScheduleProps } from "../types/blog";

export function scheduleParts(value: Date | null) {
  if (!value) return { scheduledDate: undefined, scheduledTime: undefined };
  return {
    scheduledDate: formatDate({ date: value, as: "value" }),
    scheduledTime: formatTime({ date: value, as: "value" }),
  };
}

export function resolveSchedule(props: ScheduleProps) {
  const { status, scheduledDate, scheduledTime, publishedAt } = props;

  if (status === BlogStatus.SCHEDULED) {
    if (!scheduledDate) {
      throw new BadRequestException("Choose a date to schedule this article");
    }
    const scheduledAt = wallClock(APP_TIMEZONE, scheduledDate, scheduledTime || "09:00");
    if (!scheduledAt || scheduledAt.getTime() <= Date.now()) {
      throw new BadRequestException("The schedule time must be in the future");
    }
    return { status, scheduledAt, publishedAt: scheduledAt };
  }
  if (status === BlogStatus.PUBLISHED) {
    return { status, scheduledAt: null, publishedAt: publishedAt ?? new Date() };
  }
  return { status, scheduledAt: null, publishedAt: null };
}
