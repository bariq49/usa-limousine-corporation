import { http } from "../http/client";
import API_ROUTES from "./routes";
import type { SessionApiItem } from "./types";

export const getSessions = () => {
  return http.get<SessionApiItem[]>(API_ROUTES.SESSIONS_ME);
};

export const revokeSession = (sessionId: string) => {
  return http.delete(`${API_ROUTES.SESSIONS}/${sessionId}`);
};
