import { http } from "../http/client";
import API_ROUTES from "./routes";
import type { NotificationList } from "./types";

export const NOTIFICATION_PAGE_SIZE = 20;

export const getNotifications = () => {
  return http.get<NotificationList>(API_ROUTES.NOTIFICATIONS, {
    // Empty cursor = first page of keyset paging (no total count on the server).
    params: { cursor: "", limit: NOTIFICATION_PAGE_SIZE },
  });
};

export const markNotificationRead = (id: string) => {
  return http.patch(`${API_ROUTES.NOTIFICATIONS}/${id}/read`);
};

export const markAllNotificationsRead = () => {
  return http.patch(`${API_ROUTES.NOTIFICATIONS}/read-all`);
};
