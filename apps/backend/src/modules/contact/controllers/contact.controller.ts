import { Body, Controller, Inject, Post, Req, UseGuards } from "@nestjs/common";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
import type { Request } from "express";
import { ContactDto } from "../dto/contact.dto";
import { ContactService } from "../services/contact.service";

@Controller("public/contact")
@UseGuards(ThrottlerGuard)
export class ContactController {
  constructor(@Inject(ContactService) private readonly contact: ContactService) {}

  @Post()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  submit(@Body() body: ContactDto, @Req() request: Request) {
    return this.contact.submit(body, request);
  }
}
