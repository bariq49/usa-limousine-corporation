import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import type { LoginSchema } from "@usa-limousine-corporation/ui/schemas";
import { changePassword, csrf, getMe, login, logout, updateProfile } from "@/lib/api/auth";
import { isAdminUser } from "@/lib/auth/roles";
import {
  applyAuthSession,
  clearAuthSession,
  hasAccessToken,
  setCsrfToken,
} from "@/lib/auth/session";

export const authQueryKeys = {
  me: ["me"] as const,
};

export const useAuthMe = (enabled = true) => {
  return useQuery({
    queryKey: authQueryKeys.me,
    queryFn: getMe,
    enabled: enabled && hasAccessToken(),
    retry: false,
  });
};

export const useAuthLogin = () => {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  return useMutation({
    mutationFn: async (values: LoginSchema) => {
      const data = await login(values);
      applyAuthSession(data);

      const csrfResponse = await csrf();
      setCsrfToken(csrfResponse.csrfToken);

      const user = await getMe();
      if (!isAdminUser(user)) {
        clearAuthSession();
        throw new Error("Access denied. You do not have Super Admin privileges.");
      }

      return data;
    },
    onSuccess: async () => {
      toast.success("Logged in successfully");
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.me });
      window.location.assign(callbackUrl || "/analytics");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useAuthLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      queryClient.clear();
      toast.success("Logged out");
      window.location.assign("/auth/login");
    },
    onError: (error: Error) => {
      queryClient.clear();
      toast.error(error.message);
      window.location.assign("/auth/login");
    },
  });
};

export const useAuthChangePassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changePassword,
    onSuccess: (data) => {
      queryClient.clear();
      toast.success(data.message || "Password changed. Please log in again.");
      window.location.assign("/auth/login");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useAuthUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: async (data) => {
      toast.success("Profile updated successfully");
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.me });
      return data;
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });
};
