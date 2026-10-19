export const DRIVER_ROOM_PREFIX = "driver:";
export const USER_ROOM_PREFIX = "user:";
export const SESSION_ROOM_PREFIX = "session:";
export const TRIP_ROOM_PREFIX = "trip:";
export const CHAT_ROOM_PREFIX = "chat:";
export const DRIVERS_ONLINE_ROOM = "drivers:online";
export const DRIVERS_CATEGORY_ROOM_PREFIX = "drivers:cat:";
export const OPS_FLEET_ROOM = "ops:fleet";

export function driverRoom(driverId: string): string {
  return `${DRIVER_ROOM_PREFIX}${driverId}`;
}

export function userRoom(userId: string): string {
  return `${USER_ROOM_PREFIX}${userId}`;
}

export function sessionRoom(sessionId: string): string {
  return `${SESSION_ROOM_PREFIX}${sessionId}`;
}

export function tripRoom(tripId: string): string {
  return `${TRIP_ROOM_PREFIX}${tripId}`;
}

export function chatRoom(conversationId: string): string {
  return `${CHAT_ROOM_PREFIX}${conversationId}`;
}

export function driversOnlineRoom(): string {
  return DRIVERS_ONLINE_ROOM;
}

export function driversCategoryRoom(vehicleCategoryId: string): string {
  return `${DRIVERS_CATEGORY_ROOM_PREFIX}${vehicleCategoryId}`;
}

export function opsFleetRoom(): string {
  return OPS_FLEET_ROOM;
}
