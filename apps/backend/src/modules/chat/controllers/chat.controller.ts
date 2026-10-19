import { Body, Controller, Get, Inject, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { QueryDto, SendDto } from "../dto/chat.dto";
import { ChatService } from "../services/chat.service";

@Controller("chat")
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(@Inject(ChatService) private readonly chat: ChatService) {}

  @Get("conversations")
  list(@Query() query: QueryDto, @Req() request: Request) {
    return this.chat.list(query, request);
  }

  @Get("conversations/:id")
  getOne(@Param("id") id: string, @Req() request: Request) {
    return this.chat.getOne(id, request);
  }

  @Get("conversations/:id/messages")
  listMessages(@Param("id") id: string, @Query() query: QueryDto, @Req() request: Request) {
    return this.chat.listMessages(id, query, request);
  }

  @Post("conversations/:id/messages")
  send(@Param("id") id: string, @Body() body: SendDto, @Req() request: Request) {
    return this.chat.send(id, body, request);
  }
}
