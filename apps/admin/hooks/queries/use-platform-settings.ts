import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getPlatformSettings, updatePlatformSettings } from "../../lib/api/platform-settings";
import type { UpdatePayload } from "../../lib/types/platform-settings";

export const platformSettingsKeys = {
  all: ["platform-settings"] as const,
};

export const usePlatformSettings = () => {
  return useQuery({
    queryKey: platformSettingsKeys.all,
    queryFn: getPlatformSettings,
  });
};

export const useUpdatePlatformSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdatePayload) => updatePlatformSettings(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(platformSettingsKeys.all, data);
      toast.success("Platform settings saved");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save platform settings");
    },
  });
};
