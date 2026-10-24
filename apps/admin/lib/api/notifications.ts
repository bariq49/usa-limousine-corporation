import { http } from "../http/client";
import API_ROUTES from "./routes";
import type { NotificationList } from "../types/notifications";

export const NOTIFICATION_PAGE_SIZE = 20;

export const getNotifications = (cursor = "") => {
  return http.get<NotificationList>(API_ROUTES.NOTIFICATIONS, {
    params: { cursor, limit: NOTIFICATION_PAGE_SIZE },
  });
};

export const markNotificationRead = (id: string) => {
  return http.patch(`${API_ROUTES.NOTIFICATIONS}/${id}/read`);
};

export const markAllNotificationsRead = () => {
  return http.patch(`${API_ROUTES.NOTIFICATIONS}/read-all`);
};

export const deleteNotifications = (ids: string[]) => {
  return ids.length === 1
    ? http.delete(`${API_ROUTES.NOTIFICATIONS}/${ids[0]}`)
    : http.delete(`${API_ROUTES.NOTIFICATIONS}/bulk`, { data: { ids } });
};
