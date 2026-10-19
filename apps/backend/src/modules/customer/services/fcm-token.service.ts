import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import type { Request } from "express";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type { UpdateFcmTokenDto } from "../dto/fcm-token.dto";
import { CustomerRepository } from "../repositories/customer.repository";
import { requireCustomer } from "../utils/require-customer";

@Injectable()
export class CustomerFcmTokenService {
  constructor(
    @Inject(CustomerRepository) private readonly customers: CustomerRepository,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  async updateFcmToken(body: UpdateFcmTokenDto, request: Request) {
    const customer = await requireCustomer(this.customers, request);

    const token = body.token.trim();
    if (!token) {
      throw new BadRequestException("token is required");
    }

    const deviceId = body.deviceId?.trim() || null;
    const platform = body.platform?.trim() || null;

    await this.prisma.$transaction(async (tx) => {
      const byToken = await tx.customerPushDevice.findUnique({ where: { token } });
      if (byToken) {
        const data: { customerId: string; deviceId?: string; platform?: string } = {
          customerId: customer.id,
        };
        if (deviceId) {
          data.deviceId = deviceId;
        }
        if (platform) {
          data.platform = platform;
        }
        await tx.customerPushDevice.update({ where: { token }, data });
      } else if (deviceId) {
        const byDevice = await tx.customerPushDevice.findUnique({
          where: { customerId_deviceId: { customerId: customer.id, deviceId } },
        });
        if (byDevice) {
          const data: { token: string; platform?: string } = { token };
          if (platform) {
            data.platform = platform;
          }
          await tx.customerPushDevice.update({ where: { id: byDevice.id }, data });
        } else {
          await tx.customerPushDevice.create({
            data: { customerId: customer.id, token, deviceId, platform },
          });
        }
      } else {
        await tx.customerPushDevice.create({
          data: { customerId: customer.id, token, deviceId: null, platform },
        });
      }

      await tx.customer.update({
        where: { id: customer.id },
        data: { fcmToken: token },
      });
    });

    const deviceCount = await this.prisma.customerPushDevice.count({
      where: { customerId: customer.id },
    });
    const updated = await this.prisma.customer.findUniqueOrThrow({
      where: { id: customer.id },
      select: { updatedAt: true },
    });

    return {
      customerId: customer.id,
      userId: customer.userId,
      registered: true,
      deviceCount,
      updatedAt: updated.updatedAt,
    };
  }
}
