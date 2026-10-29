import { Inject, Injectable } from "@nestjs/common";
import { HelpTicketCategory, HelpTicketPriority } from "@prisma/client";
import type { Request } from "express";
import { TicketService } from "../../help-center/services/ticket.service";
import type { ContactDto } from "../dto/contact.dto";

@Injectable()
export class ContactService {
  constructor(@Inject(TicketService) private readonly tickets: TicketService) {}

  async submit(body: ContactDto, request: Request) {
    const thanks = "Thank you! Your message has been sent. We will get back to you shortly.";
    if (body.website) {
      return { message: thanks, ticketNumber: null };
    }

    const ticket = await this.tickets.createFromWebsite(
      {
        name: [body.firstName, body.lastName].filter(Boolean).join(" "),
        email: body.email,
        phone: body.phone || null,
        subject: body.subject,
        description: body.message,
        category: body.category ?? HelpTicketCategory.OTHER,
        priority: HelpTicketPriority.HIGH,
      },
      request,
    );

    return {
      message: `${thanks} Your reference number is ${ticket.ticketNumber}.`,
      ticketNumber: ticket.ticketNumber,
    };
  }
}
