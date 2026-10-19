import type {
  Driver,
  DriverPresenceStatus,
  DriverShift,
  DriverShiftEndedReason,
  DriverShiftSession,
} from "@prisma/client";
import type { Request } from "express";
import type { DurationParts } from "../../../common/utils/format-duration";

export type View = {
  presenceStatus: DriverPresenceStatus;
  online: boolean;
  presenceUpdatedAt: Date | null;
  lastHeartbeatAt: Date | null;
  presenceDeviceId: string | null;
  session: DriverShiftSession | null;
};

export type RealtimePayload = {
  driverId: string;
  online: boolean;
  presenceStatus: DriverPresenceStatus;
  presenceDeviceId: string | null;
  sessionId: string | null;
  startedAt: Date | null;
  endedAt: Date | null;
  duration: DurationParts | null;
  extra: DurationParts | null;
  endedReason: DriverShiftEndedReason | null;
  lastLat: number | null;
  lastLng: number | null;
  locationUpdatedAt: Date | null;
  vehicleCategoryId: string | null;
};

export type OnlineParams = {
  driver: Driver;
  deviceId: string;
  request: Request;
  lat: number;
  lng: number;
  fcmToken?: string;
};

export type OfflineParams = {
  driver: Driver;
  deviceId: string;
  request: Request;
  endedReason: DriverShiftEndedReason;
};

export type RemoveResult = {
  deleted: true;
  id: string;
};

export type ClearResult = {
  deleted: true;
  count: number;
};

export type GoOnlineData = {
  driverId: string;
  deviceId: string;
  shiftType: DriverShift;
  scheduledStartTime: string | null;
  scheduledEndTime: string | null;
  timezone: string;
  now: Date;
  lat: number;
  lng: number;
  fcmToken?: string;
};

export type GoOnlineUpdate = {
  presenceStatus: DriverPresenceStatus;
  presenceUpdatedAt: Date;
  lastHeartbeatAt: Date;
  presenceDeviceId: string;
  fcmToken?: string;
  lastLat?: number;
  lastLng?: number;
  locationUpdatedAt?: Date;
};

export type LocationUpdate = {
  lastHeartbeatAt: Date;
  lastLat?: number;
  lastLng?: number;
  locationUpdatedAt?: Date;
};

export type GoOfflineData = {
  driverId: string;
  endedReason: DriverShiftEndedReason;
  now: Date;
};

export type ShiftResult = {
  driver: Driver;
  session: DriverShiftSession;
};

export type OfflineResult = {
  driver: Driver;
  session: DriverShiftSession | null;
};
