import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import type { Request } from "express";
import { auditLog } from "../../../common/utils/audit-log";
import { toRequestContext } from "../../../common/utils/to-request-context";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { UsersService } from "../../users/users.service";
import type { UpdateProfileDto } from "../dto/profile.dto";
import { CustomerRepository } from "../repositories/customer.repository";
import { requireCustomer } from "../utils/require-customer";

@Injectable()
export class CustomerProfileService {
  constructor(
    @Inject(CustomerRepository) private readonly customers: CustomerRepository,
    @Inject(UsersService) private readonly users: UsersService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  async getProfile(request: Request) {
    const customer = await requireCustomer(this.customers, request);
    const user = await this.users.findById({ id: customer.userId });
    if (!user) {
      throw new UnauthorizedException("Session is invalid");
    }

    return {
      id: customer.id,
      type: customer.type,
      isActive: user.isActive,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
      memberSince: user.createdAt,
      createdAt: customer.createdAt,
    };
  }

  async updateProfile(body: UpdateProfileDto, request: Request) {
    const customer = await requireCustomer(this.customers, request);
    const context = toRequestContext(request);

    await this.users.updateProfile({
      userId: customer.userId,
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      avatar: body.avatar,
    });

    await auditLog({
      prisma: this.prisma,
      event: "customer.profile_update",
      context,
      userId: customer.userId,
      result: "success",
      metadata: {
        customerId: customer.id,
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
        avatar: body.avatar,
      },
    });

    return this.getProfile(request);
  }
}
