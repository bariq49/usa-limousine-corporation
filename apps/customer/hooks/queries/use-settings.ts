import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getSettings, updateSettings } from "@/lib/api/settings";
import type { CustomerSettings } from "@/lib/api/types";

export const settingsQueryKeys = {
  detail: ["customer-settings"] as const,
};

export const useCustomerSettings = () => {
  return useQuery({
    queryKey: settingsQueryKeys.detail,
    queryFn: getSettings,
  });
};

export const useUpdateCustomerSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSettings,
    onSuccess: (settings: CustomerSettings) => {
      queryClient.setQueryData(settingsQueryKeys.detail, settings);
      toast.success("Settings saved");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save settings");
    },
  });
};
