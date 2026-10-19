import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  bulkDeleteCategories,
  createCategory,
  deleteCategory,
  getCategories,
  getCategory,
  updateCategory,
} from "../../lib/api/vehicle-categories";
import type { CreatePayload, Query, UpdatePayload } from "../../lib/types/vehicle-categories";

export const categoryKeys = {
  all: ["vehicle-categories"] as const,
  list: (params?: Query) => [...categoryKeys.all, "list", params] as const,
  detail: (id: string) => [...categoryKeys.all, "detail", id] as const,
};

export const useCategories = (params?: Query) => {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: () => getCategories(params),
  });
};

export const useCategory = (id: string) => {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => getCategory(id),
    enabled: Boolean(id),
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePayload) => createCategory(payload),
    onSuccess: () => {
      toast.success("Category created successfully");
      return queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create category");
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePayload }) =>
      updateCategory(id, payload),
    onSuccess: () => {
      toast.success("Category updated successfully");
      return queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update category");
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      toast.success("Category deleted successfully");
      return queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete category");
    },
  });
};

export const useBulkDeleteCategories = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteCategories(ids),
    onSuccess: () => {
      toast.success("Categories deleted successfully");
      return queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete categories");
    },
  });
};
