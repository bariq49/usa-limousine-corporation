import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getSessions, revokeSession } from "@/lib/api/sessions";

export const sessionsQueryKeys = {
  all: ["sessions"] as const,
};

export const useSessions = () => {
  return useQuery({
    queryKey: sessionsQueryKeys.all,
    queryFn: getSessions,
    retry: 1,
  });
};

export const useRevokeSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => revokeSession(sessionId),
    onSuccess: () => {
      toast.success("Session removed successfully");
      return queryClient.invalidateQueries({ queryKey: sessionsQueryKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove session");
    },
  });
};
