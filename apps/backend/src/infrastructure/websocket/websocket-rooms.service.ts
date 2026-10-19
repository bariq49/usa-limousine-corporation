import { Inject, Injectable } from "@nestjs/common";
import { DriverPresenceStatus, RoleKey, TripStatus } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";
import {
  driverRoom,
  driversCategoryRoom,
  driversOnlineRoom,
  opsFleetRoom,
  sessionRoom,
  tripRoom,
  userRoom,
} from "./constants/rooms";
import type { WebsocketIdentity } from "./types/websocket.types";

@Injectable()
export class WebsocketRoomsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async forIdentity(identity: WebsocketIdentity): Promise<string[]> {
    const rooms = [userRoom(identity.userId), sessionRoom(identity.sessionId)];

    const [driver, roles, tripIds] = await Promise.all([
      this.prisma.driver.findFirst({
        where: { userId: identity.userId, deletedAt: null },
        select: {
          id: true,
          presenceStatus: true,
          vehicle: { select: { vehicleCategoryId: true, deletedAt: true } },
        },
      }),
      this.prisma.userRole.findMany({
        where: { userId: identity.userId },
        select: { role: { select: { key: true } } },
      }),
      this.activeTripIds(identity.userId),
    ]);

    if (driver) {
      rooms.push(driverRoom(driver.id));
      if (driver.presenceStatus === DriverPresenceStatus.ONLINE) {
        rooms.push(driversOnlineRoom());
        const categoryId =
          driver.vehicle && !driver.vehicle.deletedAt ? driver.vehicle.vehicleCategoryId : null;
        if (categoryId) {
          rooms.push(driversCategoryRoom(categoryId));
        }
      }
    }

    const keys = new Set(roles.map((row) => row.role.key));
    if (keys.has(RoleKey.SUPER_ADMIN) || keys.has(RoleKey.EMPLOYEE)) {
      rooms.push(opsFleetRoom());
    }

    for (const id of tripIds) {
      rooms.push(tripRoom(id));
    }

    return rooms;
  }

  /** Driver or booking customer — reconnect joins `trip:<id>` for live `driver.location`. */
  private async activeTripIds(userId: string): Promise<string[]> {
    const trips = await this.prisma.trip.findMany({
      where: {
        deletedAt: null,
        status: { notIn: [TripStatus.COMPLETED, TripStatus.CANCELLED] },
        OR: [{ driver: { userId } }, { booking: { userId } }],
      },
      select: { id: true },
    });
    return trips.map((trip) => trip.id);
  }
}
