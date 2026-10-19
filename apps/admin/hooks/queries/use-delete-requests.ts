import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  approveDeleteRequest,
  getDeleteRequestByDriverId,
  listDeleteRequests,
  rejectDeleteRequest,
} from "../../lib/api/delete-requests";
import type { Query, RejectPayload } from "../../lib/types/delete-requests";
import { driverKeys } from "./use-drivers";

export const deleteKeys = {
  all: ["driver-delete-requests"] as const,
  list: (params?: Query) => [...deleteKeys.all, "list", params] as const,
  byDriver: (driverId: string) => [...deleteKeys.all, "driver", driverId] as const,
};

export const useDeleteRequests = (params?: Query) => {
  return useQuery({
    queryKey: deleteKeys.list(params),
    queryFn: () => listDeleteRequests(params),
  });
};

export const useDriverDeleteRequest = (driverId: string) => {
  return useQuery({
    queryKey: deleteKeys.byDriver(driverId),
    queryFn: () => getDeleteRequestByDriverId(driverId),
    enabled: Boolean(driverId),
  });
};

export const useApproveDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => approveDeleteRequest(id),
    onSuccess: () => {
      toast.success("Delete request approved");
      queryClient.invalidateQueries({ queryKey: deleteKeys.all });
      queryClient.invalidateQueries({ queryKey: driverKeys.all });
      queryClient.invalidateQueries({
        queryKey: ["driver-applications", "activity"],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to approve delete request");
    },
  });
};

export const useRejectDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, adminNote }: { id: string; adminNote?: string }) => {
      const payload: RejectPayload = {};
      if (adminNote !== undefined) {
        payload.adminNote = adminNote;
      }
      return rejectDeleteRequest(id, payload);
    },
    onSuccess: () => {
      toast.success("Delete request rejected");
      queryClient.invalidateQueries({ queryKey: deleteKeys.all });
      queryClient.invalidateQueries({ queryKey: driverKeys.all });
      queryClient.invalidateQueries({ queryKey: ["driver-applications", "activity"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reject delete request");
    },
  });
};
