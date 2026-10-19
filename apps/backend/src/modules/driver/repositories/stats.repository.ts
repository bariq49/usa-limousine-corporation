import { Inject, Injectable } from "@nestjs/common";
import { WalletOwnerType, WalletTransactionType } from "@prisma/client";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { ACTIVE_TRIP_STATUSES } from "../../trip/constants/trip.constants";
import { toAmount } from "../../../common/utils/money";
import type { Stats, StatsQuery } from "../types/stats";

@Injectable()
export class DriverStatsRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getStats(query: StatsQuery): Promise<Stats> {
    const { driverId, start, end } = query;

    const [earnings, acceptedRides, cancelledRides, pendingRides] = await Promise.all([
      this.prisma.walletTransaction.aggregate({
        where: {
          type: WalletTransactionType.TRIP_CREDIT,
          createdAt: { gte: start, lt: end },
          wallet: {
            ownerType: WalletOwnerType.DRIVER,
            ownerId: driverId,
          },
        },
        _sum: { amount: true },
      }),
      this.prisma.trip.count({
        where: {
          driverId,
          deletedAt: null,
          acceptedAt: { gte: start, lt: end },
        },
      }),
      this.prisma.trip.count({
        where: {
          driverId,
          deletedAt: null,
          cancelledAt: { gte: start, lt: end },
        },
      }),
      this.prisma.trip.count({
        where: {
          driverId,
          deletedAt: null,
          status: { in: ACTIVE_TRIP_STATUSES },
        },
      }),
    ]);

    return {
      todayEarnings: toAmount(earnings._sum.amount ?? 0) || 0,
      acceptedRides,
      cancelledRides,
      pendingRides,
    };
  }
}
