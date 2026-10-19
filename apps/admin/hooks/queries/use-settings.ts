import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getPlatformSettings, updatePlatformSettings } from "@/lib/api/settings";
import type { Update } from "@/lib/types/settings";

export const settingsQueryKeys = {
  all: ["platform-settings"] as const,
};

export const usePlatformSettings = () => {
  return useQuery({
    queryKey: settingsQueryKeys.all,
    queryFn: getPlatformSettings,
  });
};

export const useUpdatePlatformSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Update) => updatePlatformSettings(payload),
    onSuccess: (data) => {
      toast.success("Platform settings updated successfully");
      queryClient.setQueryData(settingsQueryKeys.all, data);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update platform settings");
    },
  });
};
