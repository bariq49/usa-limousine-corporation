import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createTicket, getTicket, getTickets, replyToTicket } from "@/lib/api/tickets";
import type { TicketQuery } from "@/lib/api/types";

export const ticketQueryKeys = {
  all: ["tickets"] as const,
  list: (params?: TicketQuery) => ["tickets", "list", params] as const,
  detail: (id: string) => ["tickets", "detail", id] as const,
};

export const useTickets = (params?: TicketQuery) => {
  return useQuery({
    queryKey: ticketQueryKeys.list(params),
    queryFn: () => getTickets(params),
  });
};

export const useTicket = (id: string) => {
  return useQuery({
    queryKey: ticketQueryKeys.detail(id),
    queryFn: () => getTicket(id),
    enabled: Boolean(id),
  });
};

export const useCreateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTicket,
    onSuccess: (ticket) => {
      toast.success(`Ticket ${ticket.ticketNumber} created`);
      return queryClient.invalidateQueries({ queryKey: ticketQueryKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create ticket");
    },
  });
};

export const useReplyToTicket = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: string) => replyToTicket(id, body),
    onSuccess: (ticket) => {
      queryClient.setQueryData(ticketQueryKeys.detail(id), ticket);
      return queryClient.invalidateQueries({ queryKey: ["tickets", "list"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send reply");
    },
  });
};
