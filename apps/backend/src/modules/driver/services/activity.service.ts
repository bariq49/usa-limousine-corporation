import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { DriverRequestOutcome } from "@prisma/client";
import type { Request } from "express";
import { APP_TIMEZONE } from "../../../common/utils/format-time";
import type { QueryDto } from "../dto/activity.dto";
import { DriverRepository } from "../repositories/driver.repository";
import { DriverRequestEventRepository } from "../repositories/request-event.repository";
import { DriverSettingsRepository } from "../repositories/settings.repository";
import type { Activity, Filter, ReasonCount } from "../types/activity";
import { requireDriver } from "../utils/require-driver";
import {
  bucketKeyForGroup,
  emptySeriesForWindow,
  resolveActivityWindow,
} from "../utils/activity-range";

function reason(count: number, total: number): ReasonCount {
  return {
    count,
    percent: total === 0 ? 0 : Math.round((count / total) * 100),
  };
}

function toFilter(query: QueryDto): Filter {
  const filter: Filter = {};
  if (query.startDate !== undefined) {
    filter.startDate = query.startDate;
  }
  if (query.endDate !== undefined) {
    filter.endDate = query.endDate;
  }
  if (query.year !== undefined) {
    filter.year = query.year;
  }
  if (query.month !== undefined) {
    filter.month = query.month;
  }
  if (query.day !== undefined) {
    filter.day = query.day;
  }
  if (query.groupBy !== undefined) {
    filter.groupBy = query.groupBy;
  }
  return filter;
}

@Injectable()
export class DriverActivityService {
  constructor(
    @Inject(DriverRepository) private readonly drivers: DriverRepository,
    @Inject(DriverSettingsRepository) private readonly settings: DriverSettingsRepository,
    @Inject(DriverRequestEventRepository)
    private readonly events: DriverRequestEventRepository,
  ) {}

  async getActivity(request: Request, query: QueryDto): Promise<Activity> {
    const driver = await requireDriver(this.drivers, request);
    return this.getForDriver(driver.id, query);
  }

  async getForDriver(driverId: string, query: QueryDto): Promise<Activity> {
    const driver = await this.drivers.findById(driverId);
    if (!driver) {
      throw new NotFoundException("Driver not found");
    }

    const settings = await this.settings.getSettings(driverId);
    const timezone = settings.timezone || APP_TIMEZONE;
    const window = resolveActivityWindow(toFilter(query), timezone);

    const rows = await this.events.listForDriver({
      driverId,
      start: window.start,
      end: window.end,
    });

    const series = emptySeriesForWindow(window);
    const byKey = new Map(series.map((b) => [b.key, b]));

    let finishedRides = 0;
    let youCancelled = 0;
    let youDidNotAccept = 0;
    let clientCancelled = 0;
    let clientNoShow = 0;

    for (const row of rows) {
      const key = bucketKeyForGroup(window.groupBy, row.createdAt, timezone);
      const bucket = byKey.get(key);
      if (bucket) {
        bucket.incoming += 1;
        if (row.outcome === DriverRequestOutcome.FINISHED) {
          bucket.finished += 1;
        }
      }

      if (row.outcome === DriverRequestOutcome.FINISHED) {
        finishedRides += 1;
      } else if (row.outcome === DriverRequestOutcome.DRIVER_CANCELLED) {
        youCancelled += 1;
      } else if (row.outcome === DriverRequestOutcome.NOT_ACCEPTED) {
        youDidNotAccept += 1;
      } else if (row.outcome === DriverRequestOutcome.CLIENT_CANCELLED) {
        clientCancelled += 1;
      } else if (row.outcome === DriverRequestOutcome.CLIENT_NO_SHOW) {
        clientNoShow += 1;
      }
    }

    const incomingRequests = rows.length;
    const acceptanceRate =
      incomingRequests === 0 ? 0 : Math.round((finishedRides / incomingRequests) * 100);

    const cancelTotal = youCancelled + youDidNotAccept + clientCancelled + clientNoShow;

    return {
      timezone,
      groupBy: window.groupBy,
      startDate: window.startDate,
      endDate: window.endDate,
      acceptanceRate,
      finishedRides,
      incomingRequests,
      series,
      cancelReasons: {
        total: cancelTotal,
        youCancelled: reason(youCancelled, cancelTotal),
        youDidNotAccept: reason(youDidNotAccept, cancelTotal),
        clientCancelled: reason(clientCancelled, cancelTotal),
        clientNoShow: reason(clientNoShow, cancelTotal),
      },
    };
  }
}
