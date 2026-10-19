import { http } from "../http/client";
import API_ROUTES from "./routes";
import type {
  ListResponse,
  PriorityPayload,
  Query,
  ReplyPayload,
  StatusPayload,
  Ticket,
} from "../types/tickets";

export const listTickets = (params?: Query) => {
  return http.get<ListResponse>(API_ROUTES.TICKETS, { params });
};

export const getTicket = (id: string) => {
  return http.get<Ticket>(`${API_ROUTES.TICKETS}/${id}`);
};

export const updateTicketStatus = (id: string, payload: StatusPayload) => {
  return http.patch<Ticket>(`${API_ROUTES.TICKETS}/${id}/status`, payload);
};

export const updateTicketPriority = (id: string, payload: PriorityPayload) => {
  return http.patch<Ticket>(`${API_ROUTES.TICKETS}/${id}/priority`, payload);
};

export const replyToTicket = (id: string, payload: ReplyPayload) => {
  return http.post<Ticket>(`${API_ROUTES.TICKETS}/${id}/messages`, payload);
};

export const deleteTicket = (id: string) => {
  return http.delete(`${API_ROUTES.TICKETS}/${id}`);
};

export const bulkDeleteTickets = (ids: string[]) => {
  return http.delete(`${API_ROUTES.TICKETS}/bulk`, { data: { ids } });
};
