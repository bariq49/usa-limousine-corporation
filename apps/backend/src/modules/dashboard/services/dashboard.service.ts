import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { BookingStatus, CustomerType } from "@prisma/client";
import {
  ANALYTICS_SHORT_RANGES,
  analyticsAnchoredRangeBounds,
  analyticsBucketIndex,
  analyticsCalendarBounds,
  analyticsRangeBounds,
  type AnalyticsBucket,
  type AnalyticsRange,
  type AnalyticsShortRange,
} from "../../../common/utils/analytics-range";
import { formatDate } from "../../../common/utils/format-date";
import { roundAmount } from "../../../common/utils/money";
import { bucketIndex, periodBuckets } from "../../../common/utils/period-buckets";
import type { AnalyticsQueryDto, OverviewQueryDto } from "../dto/dashboard.dto";
import { DashboardRepository } from "../repositories/dashboard.repository";
import type {
  BookingAnalytics,
  DashboardOverview,
  DriverAnalytics,
  PlatformAnalytics,
  StatusAmounts,
  StatusCounts,
  UserAnalytics,
} from "../types/dashboard";

@Injectable()
export class DashboardService {
  constructor(@Inject(DashboardRepository) private readonly repository: DashboardRepository) {}

  emptySeries(size: number) {
    return Array<number>(size).fill(0);
  }

  emptyStatus(): StatusCounts {
    return {
      completed: 0,
      confirmed: 0,
      pending: 0,
      unpaid: 0,
      cancelled: 0,
    };
  }

  emptyAmounts(): StatusAmounts {
    return {
      completed: 0,
      confirmed: 0,
      pending: 0,
      unpaid: 0,
      cancelled: 0,
    };
  }

  resolveWindow(query: AnalyticsQueryDto): {
    year: number;
    month: number | null;
    range: AnalyticsRange | null;
    start: Date;
    end: Date;
    buckets: AnalyticsBucket[];
    labels: string[];
  } {
    const currentYear = Number(formatDate({ as: "value" }).slice(0, 4));
    const year = query.year ?? currentYear;
    const month = query.month ?? null;
    const shortRange = ANALYTICS_SHORT_RANGES.find((item) => item === query.range);

    if (shortRange) {
      const bounds = analyticsAnchoredRangeBounds(shortRange as AnalyticsShortRange, year, month);
      return {
        year,
        month,
        range: shortRange,
        start: bounds.start,
        end: bounds.end,
        buckets: bounds.buckets,
        labels: bounds.labels,
      };
    }

    if (query.range) {
      const bounds = analyticsRangeBounds(query.range);
      return {
        year,
        month: null,
        range: query.range,
        start: bounds.start,
        end: bounds.end,
        buckets: bounds.buckets,
        labels: bounds.labels,
      };
    }

    const bounds = analyticsCalendarBounds(year, month);
    return {
      year,
      month,
      range: null,
      start: bounds.start,
      end: bounds.end,
      buckets: bounds.buckets,
      labels: bounds.labels,
    };
  }

  async overview(query: OverviewQueryDto): Promise<DashboardOverview> {
    const buckets = periodBuckets(query.period);
    const first = buckets[0];
    const last = buckets[buckets.length - 1];
    if (!first || !last) {
      throw new BadRequestException("Unsupported period");
    }

    const [bookings, assignments, activeDrivers] = await Promise.all([
      this.repository.bookingRows(first.start, last.end),
      this.repository.assignmentRows(first.start, last.end),
      this.repository.countActiveDrivers(),
    ]);

    const series = () => buckets.map(() => 0);
    const result: DashboardOverview = {
      period: query.period,
      labels: buckets.map((bucket) => bucket.label),
      totalBookings: 0,
      totalRevenue: 0,
      completedBookings: 0,
      confirmedBookings: 0,
      pendingBookings: 0,
      cancelledBookings: 0,
      revenueSeries: series(),
      bookingSeries: {
        completed: series(),
        confirmed: series(),
        pending: series(),
        cancelled: series(),
      },
      assignedRides: 0,
      assignedRideTotal: 0,
      totalCommission: 0,
      totalDriverPayout: 0,
      assignmentSeries: {
        rides: series(),
        rideTotal: series(),
        commission: series(),
        driverPayout: series(),
      },
      activeDrivers,
    };

    for (const row of bookings) {
      const index = bucketIndex(buckets, row.day);
      if (index < 0) continue;
      result.totalBookings += row.count;
      if (row.status === BookingStatus.COMPLETED) {
        result.completedBookings += row.count;
        result.bookingSeries.completed[index] =
          (result.bookingSeries.completed[index] ?? 0) + row.count;
        result.totalRevenue += row.amount;
        result.revenueSeries[index] = roundAmount((result.revenueSeries[index] ?? 0) + row.amount);
      } else if (row.status === BookingStatus.CONFIRMED) {
        result.confirmedBookings += row.count;
        result.bookingSeries.confirmed[index] =
          (result.bookingSeries.confirmed[index] ?? 0) + row.count;
      } else if (row.status === BookingStatus.PENDING) {
        result.pendingBookings += row.count;
        result.bookingSeries.pending[index] =
          (result.bookingSeries.pending[index] ?? 0) + row.count;
      } else if (row.status === BookingStatus.CANCELLED) {
        result.cancelledBookings += row.count;
        result.bookingSeries.cancelled[index] =
          (result.bookingSeries.cancelled[index] ?? 0) + row.count;
      }
    }

    for (const row of assignments) {
      const index = bucketIndex(buckets, row.day);
      if (index < 0) continue;
      const target = result.assignmentSeries;
      target.rides[index] = (target.rides[index] ?? 0) + row.rides;
      target.rideTotal[index] = roundAmount((target.rideTotal[index] ?? 0) + row.rideTotal);
      target.commission[index] = roundAmount((target.commission[index] ?? 0) + row.commission);
      target.driverPayout[index] = roundAmount(
        (target.driverPayout[index] ?? 0) + row.driverPayout,
      );
      result.assignedRides += row.rides;
      result.assignedRideTotal += row.rideTotal;
      result.totalCommission += row.commission;
      result.totalDriverPayout += row.driverPayout;
    }

    result.totalRevenue = roundAmount(result.totalRevenue);
    result.assignedRideTotal = roundAmount(result.assignedRideTotal);
    result.totalCommission = roundAmount(result.totalCommission);
    result.totalDriverPayout = roundAmount(result.totalDriverPayout);
    return result;
  }

  async platform(query: AnalyticsQueryDto): Promise<PlatformAnalytics> {
    const window = this.resolveWindow(query);
    const { start, end, buckets, labels, year, month, range } = window;
    const size = buckets.length;

    const [bookingRows, assignmentRows, customerRows, typeCounts, activeDrivers, totalDrivers] =
      await Promise.all([
        this.repository.bookingEvents(start, end),
        this.repository.assignmentEvents(start, end),
        this.repository.customerEvents(start, end),
        this.repository.countCustomersByType(),
        this.repository.countActiveDrivers(),
        this.repository.countDrivers(),
      ]);

    let normalCustomers = 0;
    let corporateCustomers = 0;
    for (const row of typeCounts) {
      if (row.type === CustomerType.NORMAL) normalCustomers = row._count._all;
      if (row.type === CustomerType.CORPORATE) corporateCustomers = row._count._all;
    }

    const result: PlatformAnalytics = {
      year,
      month,
      range,
      labels,
      totalBookings: 0,
      totalRevenue: 0,
      completedAmount: 0,
      confirmedAmount: 0,
      pendingAmount: 0,
      unpaidAmount: 0,
      cancelledAmount: 0,
      totalCustomers: normalCustomers + corporateCustomers,
      normalCustomers,
      corporateCustomers,
      activeDrivers,
      totalDrivers,
      totalCommission: 0,
      totalDriverPayout: 0,
      assignedRides: 0,
      completedAssignedRides: 0,
      confirmedBookings: 0,
      completedBookings: 0,
      pendingBookings: 0,
      unpaidBookings: 0,
      cancelledBookings: 0,
      newCustomers: customerRows.length,
      revenueSeries: this.emptySeries(size),
      bookingCountSeries: this.emptySeries(size),
      newCustomersSeries: this.emptySeries(size),
      assignedRidesSeries: this.emptySeries(size),
      completedAssignedSeries: this.emptySeries(size),
      commissionSeries: this.emptySeries(size),
      payoutSeries: this.emptySeries(size),
      amountSeries: {
        completed: this.emptySeries(size),
        confirmed: this.emptySeries(size),
        pending: this.emptySeries(size),
        cancelled: this.emptySeries(size),
      },
      statusBreakdown: this.emptyStatus(),
      statusAmounts: this.emptyAmounts(),
    };

    for (const row of bookingRows) {
      const index = analyticsBucketIndex(buckets, new Date(row.createdAt));
      result.totalBookings += 1;
      if (index >= 0) {
        result.bookingCountSeries[index] = (result.bookingCountSeries[index] ?? 0) + 1;
      }
      if (row.status === BookingStatus.COMPLETED) {
        result.completedBookings += 1;
        result.statusBreakdown.completed += 1;
        result.totalRevenue += row.amount;
        result.completedAmount += row.amount;
        result.statusAmounts.completed += row.amount;
        if (index >= 0) {
          result.revenueSeries[index] = roundAmount(
            (result.revenueSeries[index] ?? 0) + row.amount,
          );
          result.amountSeries.completed[index] = roundAmount(
            (result.amountSeries.completed[index] ?? 0) + row.amount,
          );
        }
      } else if (row.status === BookingStatus.CONFIRMED) {
        result.confirmedBookings += 1;
        result.statusBreakdown.confirmed += 1;
        result.confirmedAmount += row.amount;
        result.statusAmounts.confirmed += row.amount;
        if (index >= 0) {
          result.amountSeries.confirmed[index] = roundAmount(
            (result.amountSeries.confirmed[index] ?? 0) + row.amount,
          );
        }
      } else if (row.status === BookingStatus.PENDING) {
        result.pendingBookings += 1;
        result.statusBreakdown.pending += 1;
        result.pendingAmount += row.amount;
        result.statusAmounts.pending += row.amount;
        if (index >= 0) {
          result.amountSeries.pending[index] = roundAmount(
            (result.amountSeries.pending[index] ?? 0) + row.amount,
          );
        }
        if (row.unpaid) {
          result.unpaidBookings += 1;
          result.statusBreakdown.unpaid += 1;
          result.unpaidAmount += row.amount;
          result.statusAmounts.unpaid += row.amount;
        }
      } else if (row.status === BookingStatus.CANCELLED) {
        result.cancelledBookings += 1;
        result.statusBreakdown.cancelled += 1;
        result.cancelledAmount += row.amount;
        result.statusAmounts.cancelled += row.amount;
        if (index >= 0) {
          result.amountSeries.cancelled[index] = roundAmount(
            (result.amountSeries.cancelled[index] ?? 0) + row.amount,
          );
        }
      }
    }

    for (const row of assignmentRows) {
      const index = analyticsBucketIndex(buckets, new Date(row.pickupAt));
      result.assignedRides += 1;
      result.totalCommission += row.commission;
      result.totalDriverPayout += row.driverPayout;
      if (index >= 0) {
        result.assignedRidesSeries[index] = (result.assignedRidesSeries[index] ?? 0) + 1;
        result.commissionSeries[index] = roundAmount(
          (result.commissionSeries[index] ?? 0) + row.commission,
        );
        result.payoutSeries[index] = roundAmount(
          (result.payoutSeries[index] ?? 0) + row.driverPayout,
        );
      }
      if (row.completed) {
        result.completedAssignedRides += 1;
        if (index >= 0) {
          result.completedAssignedSeries[index] =
            (result.completedAssignedSeries[index] ?? 0) + 1;
        }
      }
    }

    for (const row of customerRows) {
      const index = analyticsBucketIndex(buckets, new Date(row.createdAt));
      if (index >= 0) {
        result.newCustomersSeries[index] = (result.newCustomersSeries[index] ?? 0) + 1;
      }
    }

    result.totalRevenue = roundAmount(result.totalRevenue);
    result.completedAmount = roundAmount(result.completedAmount);
    result.confirmedAmount = roundAmount(result.confirmedAmount);
    result.pendingAmount = roundAmount(result.pendingAmount);
    result.unpaidAmount = roundAmount(result.unpaidAmount);
    result.cancelledAmount = roundAmount(result.cancelledAmount);
    result.statusAmounts.completed = result.completedAmount;
    result.statusAmounts.confirmed = result.confirmedAmount;
    result.statusAmounts.pending = result.pendingAmount;
    result.statusAmounts.unpaid = result.unpaidAmount;
    result.statusAmounts.cancelled = result.cancelledAmount;
    result.totalCommission = roundAmount(result.totalCommission);
    result.totalDriverPayout = roundAmount(result.totalDriverPayout);
    result.revenueSeries = result.revenueSeries.map((value) => roundAmount(value));
    return result;
  }

  async bookings(query: AnalyticsQueryDto): Promise<BookingAnalytics> {
    const window = this.resolveWindow(query);
    const { start, end, buckets, labels, year, month, range } = window;
    const size = buckets.length;
    const [rows, assignmentRows] = await Promise.all([
      this.repository.bookingEvents(start, end),
      this.repository.assignmentEvents(start, end),
    ]);

    const result: BookingAnalytics = {
      year,
      month,
      range,
      labels,
      totalBookings: 0,
      totalRevenue: 0,
      completedAmount: 0,
      confirmedAmount: 0,
      pendingAmount: 0,
      unpaidAmount: 0,
      cancelledAmount: 0,
      completedBookings: 0,
      confirmedBookings: 0,
      pendingBookings: 0,
      unpaidBookings: 0,
      cancelledBookings: 0,
      averageOrderValue: 0,
      totalCommission: 0,
      totalDriverPayout: 0,
      revenueSeries: this.emptySeries(size),
      commissionSeries: this.emptySeries(size),
      payoutSeries: this.emptySeries(size),
      amountSeries: {
        completed: this.emptySeries(size),
        confirmed: this.emptySeries(size),
        pending: this.emptySeries(size),
        cancelled: this.emptySeries(size),
      },
      series: {
        completed: this.emptySeries(size),
        confirmed: this.emptySeries(size),
        pending: this.emptySeries(size),
        unpaid: this.emptySeries(size),
        cancelled: this.emptySeries(size),
      },
    };

    for (const row of rows) {
      const index = analyticsBucketIndex(buckets, new Date(row.createdAt));
      result.totalBookings += 1;
      if (row.status === BookingStatus.COMPLETED) {
        result.completedBookings += 1;
        result.totalRevenue += row.amount;
        result.completedAmount += row.amount;
        if (index >= 0) {
          result.series.completed[index] = (result.series.completed[index] ?? 0) + 1;
          result.revenueSeries[index] = roundAmount(
            (result.revenueSeries[index] ?? 0) + row.amount,
          );
          result.amountSeries.completed[index] = roundAmount(
            (result.amountSeries.completed[index] ?? 0) + row.amount,
          );
        }
      } else if (row.status === BookingStatus.CONFIRMED) {
        result.confirmedBookings += 1;
        result.confirmedAmount += row.amount;
        if (index >= 0) {
          result.series.confirmed[index] = (result.series.confirmed[index] ?? 0) + 1;
          result.amountSeries.confirmed[index] = roundAmount(
            (result.amountSeries.confirmed[index] ?? 0) + row.amount,
          );
        }
      } else if (row.status === BookingStatus.PENDING) {
        result.pendingBookings += 1;
        result.pendingAmount += row.amount;
        if (index >= 0) {
          result.series.pending[index] = (result.series.pending[index] ?? 0) + 1;
          result.amountSeries.pending[index] = roundAmount(
            (result.amountSeries.pending[index] ?? 0) + row.amount,
          );
        }
        if (row.unpaid) {
          result.unpaidBookings += 1;
          result.unpaidAmount += row.amount;
          if (index >= 0) {
            result.series.unpaid[index] = (result.series.unpaid[index] ?? 0) + 1;
          }
        }
      } else if (row.status === BookingStatus.CANCELLED) {
        result.cancelledBookings += 1;
        result.cancelledAmount += row.amount;
        if (index >= 0) {
          result.series.cancelled[index] = (result.series.cancelled[index] ?? 0) + 1;
          result.amountSeries.cancelled[index] = roundAmount(
            (result.amountSeries.cancelled[index] ?? 0) + row.amount,
          );
        }
      }
    }

    for (const row of assignmentRows) {
      const index = analyticsBucketIndex(buckets, new Date(row.pickupAt));
      result.totalCommission += row.commission;
      result.totalDriverPayout += row.driverPayout;
      if (index >= 0) {
        result.commissionSeries[index] = roundAmount(
          (result.commissionSeries[index] ?? 0) + row.commission,
        );
        result.payoutSeries[index] = roundAmount(
          (result.payoutSeries[index] ?? 0) + row.driverPayout,
        );
      }
    }

    result.totalRevenue = roundAmount(result.totalRevenue);
    result.completedAmount = roundAmount(result.completedAmount);
    result.confirmedAmount = roundAmount(result.confirmedAmount);
    result.pendingAmount = roundAmount(result.pendingAmount);
    result.unpaidAmount = roundAmount(result.unpaidAmount);
    result.cancelledAmount = roundAmount(result.cancelledAmount);
    result.totalCommission = roundAmount(result.totalCommission);
    result.totalDriverPayout = roundAmount(result.totalDriverPayout);
    result.averageOrderValue = roundAmount(
      result.completedBookings > 0 ? result.totalRevenue / result.completedBookings : 0,
    );
    result.revenueSeries = result.revenueSeries.map((value) => roundAmount(value));
    return result;
  }

  async users(query: AnalyticsQueryDto): Promise<UserAnalytics> {
    const window = this.resolveWindow(query);
    const { start, end, buckets, labels, year, month, range } = window;
    const size = buckets.length;

    const [customerRows, bookingRows, typeCounts, activeCustomers] = await Promise.all([
      this.repository.customerEvents(start, end),
      this.repository.bookingEvents(start, end),
      this.repository.countCustomersByType(),
      this.repository.countActiveCustomers(start, end),
    ]);

    let normalCustomers = 0;
    let corporateCustomers = 0;
    for (const row of typeCounts) {
      if (row.type === CustomerType.NORMAL) normalCustomers = row._count._all;
      if (row.type === CustomerType.CORPORATE) corporateCustomers = row._count._all;
    }

    const result: UserAnalytics = {
      year,
      month,
      range,
      labels,
      totalCustomers: normalCustomers + corporateCustomers,
      normalCustomers,
      corporateCustomers,
      newCustomers: customerRows.length,
      activeCustomers,
      totalSpent: 0,
      totalBookings: 0,
      completedBookings: 0,
      confirmedBookings: 0,
      pendingBookings: 0,
      unpaidBookings: 0,
      cancelledBookings: 0,
      newCustomersSeries: this.emptySeries(size),
      spentSeries: this.emptySeries(size),
      bookingSeries: {
        completed: this.emptySeries(size),
        confirmed: this.emptySeries(size),
        pending: this.emptySeries(size),
        cancelled: this.emptySeries(size),
      },
    };

    for (const row of customerRows) {
      const index = analyticsBucketIndex(buckets, new Date(row.createdAt));
      if (index >= 0) {
        result.newCustomersSeries[index] = (result.newCustomersSeries[index] ?? 0) + 1;
      }
    }

    for (const row of bookingRows) {
      const index = analyticsBucketIndex(buckets, new Date(row.createdAt));
      result.totalBookings += 1;
      if (row.status === BookingStatus.COMPLETED) {
        result.completedBookings += 1;
        result.totalSpent += row.amount;
        if (index >= 0) {
          result.bookingSeries.completed[index] =
            (result.bookingSeries.completed[index] ?? 0) + 1;
          result.spentSeries[index] = roundAmount((result.spentSeries[index] ?? 0) + row.amount);
        }
      } else if (row.status === BookingStatus.CONFIRMED) {
        result.confirmedBookings += 1;
        if (index >= 0) {
          result.bookingSeries.confirmed[index] =
            (result.bookingSeries.confirmed[index] ?? 0) + 1;
        }
      } else if (row.status === BookingStatus.PENDING) {
        result.pendingBookings += 1;
        if (index >= 0) {
          result.bookingSeries.pending[index] = (result.bookingSeries.pending[index] ?? 0) + 1;
        }
        if (row.unpaid) result.unpaidBookings += 1;
      } else if (row.status === BookingStatus.CANCELLED) {
        result.cancelledBookings += 1;
        if (index >= 0) {
          result.bookingSeries.cancelled[index] =
            (result.bookingSeries.cancelled[index] ?? 0) + 1;
        }
      }
    }

    result.totalSpent = roundAmount(result.totalSpent);
    result.spentSeries = result.spentSeries.map((value) => roundAmount(value));
    return result;
  }

  async drivers(query: AnalyticsQueryDto): Promise<DriverAnalytics> {
    const window = this.resolveWindow(query);
    const { start, end, buckets, labels, year, month, range } = window;
    const size = buckets.length;

    const [assignmentRows, activeDrivers, totalDrivers] = await Promise.all([
      this.repository.assignmentEvents(start, end),
      this.repository.countActiveDrivers(),
      this.repository.countDrivers(),
    ]);

    const result: DriverAnalytics = {
      year,
      month,
      range,
      labels,
      activeDrivers,
      totalDrivers,
      assignedRides: 0,
      completedAssignedRides: 0,
      confirmedAssignedRides: 0,
      assignedRideTotal: 0,
      totalCommission: 0,
      totalDriverPayout: 0,
      assignedRidesSeries: this.emptySeries(size),
      completedAssignedSeries: this.emptySeries(size),
      rideTotalSeries: this.emptySeries(size),
      commissionSeries: this.emptySeries(size),
      payoutSeries: this.emptySeries(size),
    };

    for (const row of assignmentRows) {
      const index = analyticsBucketIndex(buckets, new Date(row.pickupAt));
      result.assignedRides += 1;
      result.assignedRideTotal += row.rideTotal;
      result.totalCommission += row.commission;
      result.totalDriverPayout += row.driverPayout;
      if (row.completed) {
        result.completedAssignedRides += 1;
      } else {
        result.confirmedAssignedRides += 1;
      }
      if (index >= 0) {
        result.assignedRidesSeries[index] = (result.assignedRidesSeries[index] ?? 0) + 1;
        result.rideTotalSeries[index] = roundAmount(
          (result.rideTotalSeries[index] ?? 0) + row.rideTotal,
        );
        result.commissionSeries[index] = roundAmount(
          (result.commissionSeries[index] ?? 0) + row.commission,
        );
        result.payoutSeries[index] = roundAmount((result.payoutSeries[index] ?? 0) + row.driverPayout);
        if (row.completed) {
          result.completedAssignedSeries[index] =
            (result.completedAssignedSeries[index] ?? 0) + 1;
        }
      }
    }

    result.assignedRideTotal = roundAmount(result.assignedRideTotal);
    result.totalCommission = roundAmount(result.totalCommission);
    result.totalDriverPayout = roundAmount(result.totalDriverPayout);
    return result;
  }
}
