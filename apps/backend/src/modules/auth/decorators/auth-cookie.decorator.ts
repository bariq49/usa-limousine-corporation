import { SetMetadata } from "@nestjs/common";
import { AUTH_COOKIE_ACTION_KEY } from "../constants/auth.constants";
import type { CookieAction } from "../types/auth-cookie";

export const AuthCookie = (action: CookieAction) => SetMetadata(AUTH_COOKIE_ACTION_KEY, action);
