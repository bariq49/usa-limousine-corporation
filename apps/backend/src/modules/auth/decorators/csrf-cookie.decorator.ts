import { SetMetadata } from "@nestjs/common";
import { CSRF_COOKIE_ACTION_KEY } from "../constants/auth.constants";

export const CsrfCookie = () => SetMetadata(CSRF_COOKIE_ACTION_KEY, true);
