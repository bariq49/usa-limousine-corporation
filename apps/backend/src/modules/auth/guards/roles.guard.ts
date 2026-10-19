import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { RoleKey } from "@prisma/client";
import { ROLES_KEY } from "../constants/auth.constants";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(@Inject(Reflector) private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleKey[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: { roles?: RoleKey[] } }>();
    const userRoles = request.user?.roles ?? [];

    if (requiredRoles.some((role) => userRoles.includes(role))) {
      return true;
    }

    throw new ForbiddenException("Insufficient role");
  }
}
