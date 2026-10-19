import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import type { Request } from "express";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type { UpdateFcmTokenDto } from "../dto/fcm-token.dto";
import { DriverRepository } from "../repositories/driver.repository";
import { requireDriver } from "../utils/require-driver";

@Injectable()
export class DriverFcmTokenService {
  constructor(
    @Inject(DriverRepository) private readonly driverRepository: DriverRepository,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  async updateFcmToken(body: UpdateFcmTokenDto, request: Request) {
    const driver = await requireDriver(this.driverRepository, request);
    return this.registerDevice(driver.id, body);
  }

  async registerDevice(driverId: string, body: UpdateFcmTokenDto) {
    const token = body.token.trim();
    if (!token) {
      throw new BadRequestException("token is required");
    }

    const deviceId = body.deviceId?.trim() || null;
    const platform = body.platform?.trim() || null;

    await this.prisma.$transaction(async (tx) => {
      const byToken = await tx.driverPushDevice.findUnique({ where: { token } });
      if (byToken) {
        const data: { driverId: string; deviceId?: string; platform?: string } = {
          driverId,
        };
        if (deviceId) {
          data.deviceId = deviceId;
        }
        if (platform) {
          data.platform = platform;
        }
        await tx.driverPushDevice.update({ where: { token }, data });
      } else if (deviceId) {
        const byDevice = await tx.driverPushDevice.findUnique({
          where: { driverId_deviceId: { driverId, deviceId } },
        });
        if (byDevice) {
          const data: { token: string; platform?: string } = { token };
          if (platform) {
            data.platform = platform;
          }
          await tx.driverPushDevice.update({ where: { id: byDevice.id }, data });
        } else {
          await tx.driverPushDevice.create({
            data: { driverId, token, deviceId, platform },
          });
        }
      } else {
        await tx.driverPushDevice.create({
          data: { driverId, token, deviceId: null, platform },
        });
      }

      await tx.driver.update({
        where: { id: driverId },
        data: { fcmToken: token },
      });
    });

    const deviceCount = await this.prisma.driverPushDevice.count({
      where: { driverId },
    });
    const updated = await this.prisma.driver.findUniqueOrThrow({
      where: { id: driverId },
      select: { updatedAt: true },
    });

    return {
      driverId,
      registered: true,
      deviceCount,
      updatedAt: updated.updatedAt,
    };
  }
}
