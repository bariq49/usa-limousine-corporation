import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  bulkDeleteTickets,
  deleteTicket,
  getTicket,
  listTickets,
  replyToTicket,
  updateTicketPriority,
  updateTicketStatus,
} from "../../lib/api/tickets";
import type { PriorityPayload, Query, ReplyPayload, StatusPayload } from "../../lib/types/tickets";

export const ticketKeys = {
  all: ["help-center-tickets"] as const,
  list: (params?: Query) => [...ticketKeys.all, "list", params] as const,
  detail: (id: string) => [...ticketKeys.all, "detail", id] as const,
};

export const useTickets = (params?: Query) => {
  return useQuery({
    queryKey: ticketKeys.list(params),
    queryFn: () => listTickets(params),
  });
};

export const useTicket = (id: string) => {
  return useQuery({
    queryKey: ticketKeys.detail(id),
    queryFn: () => getTicket(id),
    enabled: Boolean(id),
  });
};

export const useUpdateTicketStatus = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: StatusPayload) => updateTicketStatus(id, payload),
    onSuccess: () => {
      toast.success("Ticket status updated");
      queryClient.invalidateQueries({ queryKey: ticketKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update status");
    },
  });
};

export const useUpdateTicketPriority = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PriorityPayload) => updateTicketPriority(id, payload),
    onSuccess: () => {
      toast.success("Ticket priority updated");
      queryClient.invalidateQueries({ queryKey: ticketKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update priority");
    },
  });
};

export const useReplyToTicket = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReplyPayload) => replyToTicket(id, payload),
    onSuccess: () => {
      toast.success("Reply sent");
      queryClient.invalidateQueries({ queryKey: ticketKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send reply");
    },
  });
};

export const useDeleteTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTicket(id),
    onSuccess: () => {
      toast.success("Ticket deleted");
      return queryClient.invalidateQueries({ queryKey: ticketKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete ticket");
    },
  });
};

export const useBulkDeleteTickets = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteTickets(ids),
    onSuccess: () => {
      toast.success("Tickets deleted");
      return queryClient.invalidateQueries({ queryKey: ticketKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete tickets");
    },
  });
};
