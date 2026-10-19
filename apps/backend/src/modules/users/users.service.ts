import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import type {
  Create,
  FindByEmail,
  FindById,
  MarkEmailVerified,
  UpdateLoginFailure,
  UpdatePassword,
  UpdateProfile,
} from "./types/user";

@Injectable()
export class UsersService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  findByEmail(params: FindByEmail) {
    const { email } = params;
    return this.prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  }

  findById(params: FindById) {
    const { id } = params;
    return this.prisma.user.findUnique({ where: { id } });
  }

  create(params: Create) {
    const { email, passwordHash, firstName, lastName, phone } = params;
    return this.prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
        firstName: firstName?.trim() || null,
        lastName: lastName?.trim() || null,
        phone: phone?.trim() || null,
      },
    });
  }

  async markEmailVerified(params: MarkEmailVerified) {
    const { userId } = params;
    await this.prisma.user.update({
      where: { id: userId },
      data: { isEmailVerified: true },
    });
  }

  async updatePassword(params: UpdatePassword) {
    const { userId, passwordHash } = params;
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash, failedLoginCount: 0, lockoutUntil: null },
    });
  }

  async updateLoginFailure(params: UpdateLoginFailure) {
    const { userId, failedLoginCount, lockoutUntil } = params;
    await this.prisma.user.update({
      where: { id: userId },
      data: { failedLoginCount, lockoutUntil },
    });
  }

  async updateProfile(params: UpdateProfile) {
    const { userId, firstName, lastName, phone, avatar } = params;
    const data: {
      firstName?: string | null;
      lastName?: string | null;
      phone?: string | null;
      avatar?: string | null;
    } = {};

    if (firstName !== undefined) {
      data.firstName = firstName?.trim() || null;
    }
    if (lastName !== undefined) {
      data.lastName = lastName?.trim() || null;
    }
    if (phone !== undefined) {
      data.phone = phone?.trim() || null;
    }
    if (avatar !== undefined) {
      data.avatar = avatar?.trim() || null;
    }

    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }
}
