import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  bulkDeleteLuggage,
  createLuggage,
  deleteLuggage,
  getLuggage,
  updateLuggage,
} from "../../lib/api/luggage";
import type { CreatePayload, Query, UpdatePayload } from "../../lib/types/luggage";

export const luggageKeys = {
  all: ["luggage"] as const,
  list: (params?: Query) => [...luggageKeys.all, "list", params] as const,
  detail: (id: string) => [...luggageKeys.all, "detail", id] as const,
};

export const useLuggage = (params?: Query) => {
  return useQuery({
    queryKey: luggageKeys.list(params),
    queryFn: () => getLuggage(params),
  });
};

export const useCreateLuggage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePayload) => createLuggage(payload),
    onSuccess: () => {
      toast.success("Luggage created successfully");
      return queryClient.invalidateQueries({ queryKey: luggageKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create luggage");
    },
  });
};

export const useUpdateLuggage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePayload }) =>
      updateLuggage(id, payload),
    onSuccess: () => {
      toast.success("Luggage updated successfully");
      return queryClient.invalidateQueries({ queryKey: luggageKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update luggage");
    },
  });
};

export const useDeleteLuggage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteLuggage(id),
    onSuccess: () => {
      toast.success("Luggage deleted successfully");
      return queryClient.invalidateQueries({ queryKey: luggageKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete luggage");
    },
  });
};

export const useBulkDeleteLuggage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteLuggage(ids),
    onSuccess: () => {
      toast.success("Luggage deleted successfully");
      return queryClient.invalidateQueries({ queryKey: luggageKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete luggage");
    },
  });
};
