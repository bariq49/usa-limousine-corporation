import type { RoleKey } from "@prisma/client";
import type { HttpRequest } from "../../../common/types/request-context.types";

export type AuthRequest = HttpRequest;

export type JwtAuthRequest = AuthRequest & {
  user: {
    sub: string;
    sid: string;
    email: string;
    roles: RoleKey[];
  };
};

export type RefreshAuthRequest = AuthRequest & {
  user: {
    sub: string;
    sid: string;
    email: string;
    rm?: boolean;
    refreshToken?: string;
  };
};
