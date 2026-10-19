import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { RoleKey } from "@prisma/client";
import type { Request } from "express";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { AddDto, UpdateDto } from "../dto/bank-account.dto";
import { DriverBankAccountService } from "../services/bank-account.service";

@Controller("drivers")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleKey.DRIVER)
export class DriverBankAccountController {
  constructor(
    @Inject(DriverBankAccountService)
    private readonly bankAccountService: DriverBankAccountService,
  ) {}

  @Get("bank-account")
  listBankAccounts(@Req() request: Request) {
    return this.bankAccountService.listBankAccounts(request);
  }

  @Post("bank-account")
  addBankAccount(@Body() body: AddDto, @Req() request: Request) {
    return this.bankAccountService.addBankAccount(body, request);
  }

  @Patch("bank-account/:id")
  updateBankAccount(@Param("id") id: string, @Body() body: UpdateDto, @Req() request: Request) {
    return this.bankAccountService.updateBankAccount(id, body, request);
  }

  @Post("bank-account/:id/default")
  setDefaultBankAccount(@Param("id") id: string, @Req() request: Request) {
    return this.bankAccountService.setDefaultBankAccount(id, request);
  }

  @Delete("bank-account/:id")
  deleteBankAccount(@Param("id") id: string, @Req() request: Request) {
    return this.bankAccountService.deleteBankAccount(id, request);
  }
}
