import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { HelpTicketOwnerType } from "@prisma/client";
import type { Request } from "express";
import type { CreateDto, QueryDto } from "../../help-center/dto/ticket.dto";
import { TicketService } from "../../help-center/services/ticket.service";
import { DriverRepository } from "../repositories/driver.repository";
import { requireDriver } from "../utils/require-driver";

@Injectable()
export class DriverTicketService {
  constructor(
    @Inject(DriverRepository) private readonly drivers: DriverRepository,
    @Inject(TicketService) private readonly tickets: TicketService,
  ) {}

  async create(body: CreateDto, request: Request) {
    const driver = await requireDriver(this.drivers, request);
    return this.tickets.create(
      {
        ownerType: HelpTicketOwnerType.DRIVER,
        ownerId: driver.id,
        ownerName: `${driver.firstName} ${driver.lastName}`.trim(),
        ownerEmail: driver.email,
        subject: body.subject,
        description: body.description,
        attachment: body.attachment,
        category: body.category,
        priority: body.priority,
      },
      request,
    );
  }

  async list(query: QueryDto, request: Request) {
    const driver = await requireDriver(this.drivers, request);
    query.ownerType = HelpTicketOwnerType.DRIVER;
    query.ownerId = driver.id;
    return this.tickets.list(query);
  }

  async getOne(id: string, request: Request) {
    const driver = await requireDriver(this.drivers, request);
    const ticket = await this.tickets.getOne(id);
    if (ticket.ownerType !== HelpTicketOwnerType.DRIVER || ticket.ownerId !== driver.id) {
      throw new NotFoundException("Help ticket not found");
    }
    return ticket;
  }
}
