import { Body, Controller, Get, Inject, Patch, Req, UseGuards } from "@nestjs/common";
import { RoleKey } from "@prisma/client";
import type { Request } from "express";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { UpdateDocumentsDto } from "../dto/documents.dto";
import { DriverDocumentsService } from "../services/documents.service";

@Controller("drivers")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleKey.DRIVER)
export class DriverDocumentsController {
  constructor(
    @Inject(DriverDocumentsService) private readonly documentsService: DriverDocumentsService,
  ) {}

  @Get("documents")
  getDocuments(@Req() request: Request) {
    return this.documentsService.getDocuments(request);
  }

  @Patch("documents")
  updateDocuments(@Body() body: UpdateDocumentsDto, @Req() request: Request) {
    return this.documentsService.updateDocuments(body, request);
  }
}
