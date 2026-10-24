import type {
  ChangePasswordSchema,
  ForgotSchema,
  LoginSchema,
  RegisterSchema,
} from "@usa-limousine-corporation/ui/schemas";
import { clearAuthSession } from "../auth/session";
import { http } from "../http/client";
import type { AuthTokens, CsrfResponse, CurrentUser, MessageResponse } from "./types";
import API_ROUTES from "./routes";

export const csrf = () => {
  return http.get<CsrfResponse>(API_ROUTES.AUTH_CSRF);
};

export const login = (payload: LoginSchema) => {
  return http.post<AuthTokens>(API_ROUTES.AUTH_LOGIN, payload);
};

export const register = (
  payload: Pick<RegisterSchema, "firstName" | "lastName" | "email" | "password">,
) => {
  return http.post<MessageResponse>(API_ROUTES.AUTH_REGISTER, payload);
};

export const forgot = (payload: ForgotSchema) => {
  return http.post<MessageResponse>(API_ROUTES.AUTH_FORGOT, payload);
};

export const verify = (payload: { email: string; token: string }) => {
  return http.post<MessageResponse>(API_ROUTES.AUTH_VERIFY, payload);
};

export const resendOtp = (payload: { email: string }) => {
  return http.post<MessageResponse>(API_ROUTES.AUTH_RESEND_OTP, payload);
};

export const resetPassword = (payload: { token: string; newPassword: string }) => {
  return http.post<MessageResponse>(API_ROUTES.AUTH_RESET, payload);
};

export const refresh = (csrfToken: string) => {
  return http.post<AuthTokens>(
    API_ROUTES.AUTH_REFRESH,
    {},
    {
      headers: {
        "x-csrf-token": csrfToken,
      },
    },
  );
};

export const getMe = () => {
  return http.get<CurrentUser>(API_ROUTES.AUTH_ME);
};

export const logout = async () => {
  try {
    return await http.post<MessageResponse>(API_ROUTES.AUTH_LOGOUT);
  } finally {
    clearAuthSession();
  }
};

export const changePassword = async (payload: ChangePasswordSchema) => {
  try {
    return await http.post<MessageResponse>(API_ROUTES.AUTH_CHANGE_PASSWORD, {
      currentPassword: payload.currentPassword,
      newPassword: payload.newPassword,
    });
  } finally {
    clearAuthSession();
  }
};

export interface UpdateProfilePayload {
  firstName?: string | undefined;
  lastName?: string | undefined;
  phone?: string | undefined;
  avatar?: string | undefined;
}

export const updateProfile = (payload: UpdateProfilePayload) => {
  return http.patch<CurrentUser>(API_ROUTES.AUTH_PROFILE, payload);
};
