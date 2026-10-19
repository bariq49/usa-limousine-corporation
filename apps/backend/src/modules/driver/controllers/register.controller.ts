import { Body, Controller, Inject, Param, Post, Req } from "@nestjs/common";
import type { Request } from "express";
import { DocumentsDto } from "../dto/documents.dto";
import {
  CreateDto,
  DetailsDto,
  ResendOtpDto,
  StatusDto,
  VerifyEmailDto,
} from "../dto/register.dto";
import { VehicleDto } from "../dto/vehicle.dto";
import { DriverRegisterService } from "../services/register.service";

@Controller("drivers")
export class DriverRegisterController {
  constructor(
    @Inject(DriverRegisterService) private readonly registerService: DriverRegisterService,
  ) {}

  @Post()
  create(@Body() body: CreateDto, @Req() request: Request) {
    return this.registerService.create(body, request);
  }

  @Post("verify-email")
  verifyEmail(@Body() body: VerifyEmailDto, @Req() request: Request) {
    return this.registerService.verifyEmail(body, request);
  }

  @Post("resend-otp")
  resendOtp(@Body() body: ResendOtpDto, @Req() request: Request) {
    return this.registerService.resendOtp(body, request);
  }

  @Post("status")
  getStatusByEmail(@Body() body: StatusDto) {
    return this.registerService.getStatusByEmail(body.email);
  }

  @Post(":id/details")
  saveDetails(@Param("id") id: string, @Body() body: DetailsDto, @Req() request: Request) {
    return this.registerService.saveDetails(id, body, request);
  }

  @Post(":id/vehicle")
  saveVehicle(@Param("id") id: string, @Body() body: VehicleDto, @Req() request: Request) {
    return this.registerService.saveVehicle(id, body, request);
  }

  @Post(":id/documents")
  saveDocuments(@Param("id") id: string, @Body() body: DocumentsDto, @Req() request: Request) {
    return this.registerService.saveDocuments(id, body, request);
  }
}
