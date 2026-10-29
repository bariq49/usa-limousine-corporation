import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { BookingStatus } from "@prisma/client";
import { roundAmount } from "../../../common/utils/money";
import { bucketIndex, periodBuckets } from "../../../common/utils/period-buckets";
import type { OverviewQueryDto } from "../dto/dashboard.dto";
import { DashboardRepository } from "../repositories/dashboard.repository";
import type { DashboardOverview } from "../types/dashboard";

@Injectable()
export class DashboardService {
  constructor(@Inject(DashboardRepository) private readonly repository: DashboardRepository) {}

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
}
