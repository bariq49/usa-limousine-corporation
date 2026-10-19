import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  bulkDeleteServices,
  createService,
  deleteService,
  getServiceItem,
  getServices,
  updateService,
} from "../../lib/api/services";
import type { CreatePayload, Query, UpdatePayload } from "../../lib/types/services";

export const servicesKeys = {
  all: ["extra-services"] as const,
  list: (params?: Query) => [...servicesKeys.all, "list", params] as const,
  detail: (id: string) => [...servicesKeys.all, "detail", id] as const,
};

export const useServices = (params?: Query) => {
  return useQuery({
    queryKey: servicesKeys.list(params),
    queryFn: () => getServices(params),
  });
};

export const useServiceItem = (id: string) => {
  return useQuery({
    queryKey: servicesKeys.detail(id),
    queryFn: () => getServiceItem(id),
    enabled: Boolean(id),
  });
};

export const useCreateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePayload) => createService(payload),
    onSuccess: () => {
      toast.success("Service created successfully");
      return queryClient.invalidateQueries({ queryKey: servicesKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create service");
    },
  });
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePayload }) =>
      updateService(id, payload),
    onSuccess: () => {
      toast.success("Service updated successfully");
      return queryClient.invalidateQueries({ queryKey: servicesKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update service");
    },
  });
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteService(id),
    onSuccess: () => {
      toast.success("Service deleted successfully");
      return queryClient.invalidateQueries({ queryKey: servicesKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete service");
    },
  });
};

export const useBulkDeleteServices = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteServices(ids),
    onSuccess: () => {
      toast.success("Services deleted successfully");
      return queryClient.invalidateQueries({ queryKey: servicesKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete services");
    },
  });
};
