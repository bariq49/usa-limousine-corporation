import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import type { LoginSchema, RegisterSchema } from "@usa-limousine-corporation/ui/schemas";
import {
  changePassword,
  csrf,
  forgot,
  getMe,
  login,
  logout,
  register,
  resendOtp,
  resetPassword,
  updateProfile,
  verify,
} from "@/lib/api/auth";
import { isCustomerUser } from "@/lib/auth/roles";
import {
  applyAuthSession,
  clearAuthSession,
  hasAccessToken,
  setCsrfToken,
} from "@/lib/auth/session";
import { isHttpError } from "@/lib/http/error";

function errorMessage(error: unknown, fallback: string): string {
  if (isHttpError(error) && error.message) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

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
  const callback = searchParams.get("callbackUrl");
  // Same-origin paths only, so the param cannot send users to another site.
  const callbackUrl = callback?.startsWith("/") && !callback.startsWith("//") ? callback : null;

  return useMutation({
    mutationFn: async (values: LoginSchema) => {
      const data = await login(values);
      applyAuthSession(data);

      const csrfResponse = await csrf();
      setCsrfToken(csrfResponse.csrfToken);

      const user = await getMe();
      if (!isCustomerUser(user)) {
        clearAuthSession();
        throw new Error("Access denied. This portal is for customer accounts only.");
      }

      return data;
    },
    onSuccess: async () => {
      toast.success("Logged in successfully");
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.me });
      window.location.assign(callbackUrl || "/dashboard");
    },
    onError: (error: unknown) => {
      toast.error(errorMessage(error, "Failed to log in. Please check your credentials."));
    },
  });
};

export const useAuthRegister = () => {
  const router = useRouter();
  const callbackUrl = useSearchParams().get("callbackUrl");

  return useMutation({
    mutationFn: async (values: RegisterSchema) => {
      return register({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
      });
    },
    onSuccess: (_data, values) => {
      toast.success("Account created. Verify your email to continue.");
      const callback = callbackUrl ? `&callbackUrl=${encodeURIComponent(callbackUrl)}` : "";
      router.push(`/auth/verify?email=${encodeURIComponent(values.email)}${callback}`);
    },
    onError: (error: unknown) => {
      toast.error(errorMessage(error, "Failed to create account."));
    },
  });
};

export const useAuthForgot = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: forgot,
    onSuccess: (data) => {
      toast.success(data.message || "If the account exists, reset instructions were sent.");
      router.push("/auth/create-password");
    },
    onError: (error: unknown) => {
      toast.error(errorMessage(error, "Failed to send reset email."));
    },
  });
};

export const useAuthVerify = () => {
  const router = useRouter();
  const callbackUrl = useSearchParams().get("callbackUrl");

  return useMutation({
    mutationFn: verify,
    onSuccess: (data) => {
      toast.success(data.message || "Email verified");
      router.push(
        callbackUrl ? `/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/auth/login",
      );
    },
    onError: (error: unknown) => {
      toast.error(errorMessage(error, "Failed to verify."));
    },
  });
};

export const useAuthResendOtp = () => {
  return useMutation({
    mutationFn: resendOtp,
    onSuccess: (data) => {
      toast.success(data.message || "Verification code sent to email");
    },
    onError: (error: unknown) => {
      toast.error(errorMessage(error, "Failed to resend code."));
    },
  });
};

export const useAuthResetPassword = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: resetPassword,
    onSuccess: (data) => {
      toast.success(data.message || "Password reset successful");
      router.push("/auth/login");
    },
    onError: (error: unknown) => {
      toast.error(errorMessage(error, "Failed to reset password."));
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
    onError: (error: unknown) => {
      toast.error(errorMessage(error, "Failed to change password."));
    },
  });
};

export const useAuthUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: async () => {
      toast.success("Profile updated successfully");
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.me });
    },
    onError: (error: unknown) => {
      toast.error(errorMessage(error, "Failed to update profile."));
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
    onError: (error: unknown) => {
      queryClient.clear();
      toast.error(errorMessage(error, "Failed to log out."));
      window.location.assign("/auth/login");
    },
  });
};
