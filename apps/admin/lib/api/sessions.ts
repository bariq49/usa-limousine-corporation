import { http } from "../http/client";
import type { SessionApiItem } from "../types/sessions";

export const getSessions = () => {
  return http.get<SessionApiItem[]>("/sessions/me");
};

export const revokeSession = (sessionId: string) => {
  return http.delete(`/sessions/${sessionId}`);
};
