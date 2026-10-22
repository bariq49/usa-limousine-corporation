import { http } from "../http/client";
import API_ROUTES from "./routes";
import type { CreateTicket, Ticket, TicketList, TicketQuery } from "./types";

export const getTickets = (params?: TicketQuery) => {
  return http.get<TicketList>(API_ROUTES.TICKETS, {
    params: {
      sortBy: "createdAt",
      sortOrder: "desc",
      page: params?.page,
      limit: params?.limit,
      status: params?.status,
      search: params?.search,
    },
  });
};

export const getTicket = (id: string) => {
  return http.get<Ticket>(`${API_ROUTES.TICKETS}/${id}`);
};

export const createTicket = (payload: CreateTicket) => {
  return http.post<Ticket>(API_ROUTES.TICKETS, payload);
};

export const replyToTicket = (id: string, body: string) => {
  return http.post<Ticket>(`${API_ROUTES.TICKETS}/${id}/messages`, { body });
};
