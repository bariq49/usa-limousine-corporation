export const USER_ROOM_PREFIX = "user:";
export const SESSION_ROOM_PREFIX = "session:";

export function userRoom(userId: string): string {
  return `${USER_ROOM_PREFIX}${userId}`;
}

export function sessionRoom(sessionId: string): string {
  return `${SESSION_ROOM_PREFIX}${sessionId}`;
}
