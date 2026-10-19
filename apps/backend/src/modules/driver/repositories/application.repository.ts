import { Inject, Injectable } from "@nestjs/common";
import {
  ActivityOwnerType,
  Audience,
  CalendarOwnerType,
  DriverApprovalStatus,
  DriverDocumentVerificationStatus,
  DriverOnboardingStatus,
  DriverPresenceStatus,
  DriverStatus,
  HelpTicketOwnerType,
  NotificationRecipientType,
  PaymentPurpose,
  WalletOwnerType,
} from "@prisma/client";
import { APIFeature } from "../../../common/api-feature";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type { ApplicationQueryDto } from "../dto/application.dto";
import { DriverRepository } from "./driver.repository";

@Injectable()
export class DriverApplicationRepository {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(DriverRepository) private readonly drivers: DriverRepository,
  ) {}

  findMany(query: ApplicationQueryDto) {
    const feature = new APIFeature(query, {
      initialFilter: { deletedAt: null },
      filterFields: ["approvalStatus", "onboardingStatus"],
      search: {
        searchFields: ["applicationNumber", "firstName", "lastName", "email", "phone"],
      },
      sort: {
        allowedFields: ["createdAt", "updatedAt", "applicationNumber"],
        defaultSortBy: "createdAt",
        defaultSortOrder: "desc",
      },
      pagination: {
        defaultLimit: 20,
        maxLimit: 100,
      },
    });

    return feature.execute({
      findMany: (args) =>
        this.prisma.driver.findMany({
          where: args.where as never,
          orderBy: args.orderBy as never,
          skip: args.skip,
          take: args.take,
          include: {
            user: { select: { id: true, email: true } },
            vehicle: {
              include: {
                vehicleCategory: {
                  include: {
                    luggageCapacity: true,
                  },
                },
                luggageCapacity: {
                  include: { luggageType: true },
                  orderBy: { luggageType: { name: "asc" } },
                },
              },
            },
            documents: {
              where: { deletedAt: null },
              orderBy: { uploadedAt: "desc" },
            },
          },
        }),
      count: ({ where }) => this.prisma.driver.count({ where: where as never }),
    });
  }

  findById(id: string) {
    return this.drivers.findById(id);
  }

  async markUnderReview(id: string) {
    await this.prisma.driver.update({
      where: { id },
      data: {
        approvalStatus: DriverApprovalStatus.UNDER_REVIEW,
        onboardingStatus: DriverOnboardingStatus.UNDER_REVIEW,
      },
    });
    return this.drivers.findById(id);
  }

  async approve(id: string) {
    await this.prisma.$transaction(async (tx) => {
      await tx.driver.update({
        where: { id },
        data: {
          approvalStatus: DriverApprovalStatus.APPROVED,
          status: DriverStatus.ACTIVE,
          onboardingStatus: DriverOnboardingStatus.COMPLETED,
          notes: null,
        },
      });

      // Approving the application also approves submitted vehicle + identity documents.
      await tx.driverDocument.updateMany({
        where: {
          driverId: id,
          deletedAt: null,
          verificationStatus: {
            in: [
              DriverDocumentVerificationStatus.PENDING,
              DriverDocumentVerificationStatus.UNDER_REVIEW,
            ],
          },
        },
        data: {
          verificationStatus: DriverDocumentVerificationStatus.APPROVED,
        },
      });
    });

    return this.drivers.findById(id);
  }

  async reject(id: string, reason: string) {
    await this.prisma.driver.update({
      where: { id },
      data: {
        approvalStatus: DriverApprovalStatus.REJECTED,
        status: DriverStatus.REJECTED,
        onboardingStatus: DriverOnboardingStatus.COMPLETED,
        notes: reason,
      },
    });
    return this.drivers.findById(id);
  }

  countBlockingTrips(driverId: string) {
    return this.prisma.trip.count({
      where: {
        driverId,
        deletedAt: null,
        status: {
          notIn: ["COMPLETED", "CANCELLED"],
        },
      },
    });
  }

  async suspend(id: string, userId: string) {
    await this.prisma.$transaction(async (tx) => {
      await tx.driver.update({
        where: { id },
        data: {
          status: DriverStatus.SUSPENDED,
          presenceStatus: DriverPresenceStatus.OFFLINE,
          presenceDeviceId: null,
          fcmToken: null,
        },
      });
      await tx.user.update({
        where: { id: userId },
        data: { isActive: false },
      });
    });
    return this.drivers.findById(id);
  }

  async unsuspend(id: string, userId: string) {
    await this.prisma.$transaction(async (tx) => {
      await tx.driver.update({
        where: { id },
        data: {
          status: DriverStatus.ACTIVE,
        },
      });
      await tx.user.update({
        where: { id: userId },
        data: { isActive: true },
      });
    });
    return this.drivers.findById(id);
  }

  /**
   * Hard-purge a driver and related data (trips, wallet, payouts, subscriptions, etc.).
   * Caller must ensure there are no active/upcoming trips.
   */
  async purge(driverId: string, userId: string) {
    await this.prisma.$transaction(async (tx) => {
      await tx.tripReview.deleteMany({ where: { driverId } });
      await tx.trip.deleteMany({ where: { driverId } });

      const wallet = await tx.wallet.findUnique({
        where: {
          ownerType_ownerId: {
            ownerType: WalletOwnerType.DRIVER,
            ownerId: driverId,
          },
        },
        select: { id: true },
      });

      const recipientPayouts = await tx.payout.findMany({
        where: {
          recipientType: WalletOwnerType.DRIVER,
          recipientId: driverId,
        },
        select: { id: true },
      });
      const createdPayouts = await tx.payout.findMany({
        where: { createdBy: userId },
        select: { id: true },
      });
      const payoutIdSet = new Set<string>();
      for (const payout of recipientPayouts) {
        payoutIdSet.add(payout.id);
      }
      for (const payout of createdPayouts) {
        payoutIdSet.add(payout.id);
      }
      const payoutIds = Array.from(payoutIdSet);

      if (wallet) {
        await tx.walletTransaction.deleteMany({ where: { walletId: wallet.id } });
      }
      if (payoutIds.length) {
        await tx.walletTransaction.deleteMany({
          where: { payoutId: { in: payoutIds } },
        });
        await tx.payout.deleteMany({ where: { id: { in: payoutIds } } });
      }
      if (wallet) {
        await tx.wallet.delete({ where: { id: wallet.id } });
      }

      const subscriptions = await tx.subscription.findMany({
        where: { audience: Audience.DRIVER, referenceId: driverId },
        select: { id: true },
      });
      const subscriptionIds = subscriptions.map((s) => s.id);
      if (subscriptionIds.length) {
        await tx.payment.deleteMany({
          where: {
            purpose: PaymentPurpose.DRIVER_SUBSCRIPTION,
            referenceId: { in: subscriptionIds },
          },
        });
        await tx.subscription.deleteMany({
          where: { id: { in: subscriptionIds } },
        });
      }

      await tx.notification.deleteMany({
        where: {
          recipientType: NotificationRecipientType.DRIVER,
          recipientId: driverId,
        },
      });

      await tx.activity.deleteMany({
        where: {
          ownerType: ActivityOwnerType.DRIVER,
          ownerId: driverId,
        },
      });

      await tx.calendarEvent.deleteMany({
        where: {
          ownerType: CalendarOwnerType.DRIVER,
          ownerId: driverId,
        },
      });

      await tx.helpTicket.deleteMany({
        where: {
          ownerType: HelpTicketOwnerType.DRIVER,
          ownerId: driverId,
        },
      });
      await tx.helpTicketMessage.deleteMany({ where: { authorUserId: userId } });
      await tx.helpTicketEvent.deleteMany({ where: { actorUserId: userId } });

      await tx.user.delete({ where: { id: userId } });
    });
  }

  findUserIdsByDriverIds(ids: string[]) {
    return this.prisma.driver.findMany({
      where: { id: { in: ids }, deletedAt: null },
      select: { id: true, userId: true },
    });
  }
}
