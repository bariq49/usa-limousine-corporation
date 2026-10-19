import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { HelpTicketOwnerType } from "@prisma/client";
import type { Request } from "express";
import type { CreateDto, QueryDto } from "../../help-center/dto/ticket.dto";
import { TicketService } from "../../help-center/services/ticket.service";
import { CustomerRepository } from "../repositories/customer.repository";
import { requireCustomer } from "../utils/require-customer";

@Injectable()
export class CustomerTicketService {
  constructor(
    @Inject(CustomerRepository) private readonly customers: CustomerRepository,
    @Inject(TicketService) private readonly tickets: TicketService,
  ) {}

  async create(body: CreateDto, request: Request) {
    const customer = await requireCustomer(this.customers, request);
    const ownerName = [customer.user?.firstName, customer.user?.lastName]
      .filter((part): part is string => Boolean(part && part.trim()))
      .join(" ")
      .trim();

    return this.tickets.create(
      {
        ownerType: HelpTicketOwnerType.CUSTOMER,
        ownerId: customer.id,
        ownerName: ownerName || null,
        ownerEmail: customer.user?.email ?? null,
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
    const customer = await requireCustomer(this.customers, request);
    query.ownerType = HelpTicketOwnerType.CUSTOMER;
    query.ownerId = customer.id;
    return this.tickets.list(query);
  }

  async getOne(id: string, request: Request) {
    const customer = await requireCustomer(this.customers, request);
    const ticket = await this.tickets.getOne(id);
    if (ticket.ownerType !== HelpTicketOwnerType.CUSTOMER || ticket.ownerId !== customer.id) {
      throw new NotFoundException("Help ticket not found");
    }
    return ticket;
  }
}
