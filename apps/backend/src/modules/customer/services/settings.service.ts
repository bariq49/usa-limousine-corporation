import { Inject, Injectable } from "@nestjs/common";
import type { Request } from "express";
import { auditLog } from "../../../common/utils/audit-log";
import { toRequestContext } from "../../../common/utils/to-request-context";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type { UpdateSettingsDto } from "../dto/settings.dto";
import { CustomerRepository } from "../repositories/customer.repository";
import { CustomerSettingsRepository } from "../repositories/settings.repository";
import { requireCustomer } from "../utils/require-customer";

@Injectable()
export class CustomerSettingsService {
  constructor(
    @Inject(CustomerRepository) private readonly customers: CustomerRepository,
    @Inject(CustomerSettingsRepository)
    private readonly settingsRepository: CustomerSettingsRepository,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  async getSettings(request: Request) {
    const customer = await requireCustomer(this.customers, request);
    const settings = await this.settingsRepository.getSettings(customer.id);

    return {
      email: settings.email,
      notification: settings.notification,
      sms: settings.sms,
    };
  }

  async updateSettings(body: UpdateSettingsDto, request: Request) {
    const context = toRequestContext(request);
    const customer = await requireCustomer(this.customers, request);

    const current = await this.settingsRepository.getSettings(customer.id);
    const email = body.email !== undefined ? body.email : current.email;
    const notification = body.notification !== undefined ? body.notification : current.notification;
    const sms = body.sms !== undefined ? body.sms : current.sms;

    const settings = await this.settingsRepository.updateSettings(customer.id, {
      email,
      notification,
      sms,
    });

    await auditLog({
      prisma: this.prisma,
      event: "customer.settings_updated",
      result: "success",
      context,
      userId: context.userId,
      metadata: {
        customerId: customer.id,
        email: settings.email,
        notification: settings.notification,
        sms: settings.sms,
      },
    });

    return {
      email: settings.email,
      notification: settings.notification,
      sms: settings.sms,
    };
  }
}
