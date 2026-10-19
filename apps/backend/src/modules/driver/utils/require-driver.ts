import { NotFoundException, UnauthorizedException } from "@nestjs/common";
import type { Request } from "express";
import { toRequestContext } from "../../../common/utils/to-request-context";
import type { DriverRepository } from "../repositories/driver.repository";

export async function requireDriver(driverRepository: DriverRepository, request: Request) {
  const { userId } = toRequestContext(request);
  if (!userId) {
    throw new UnauthorizedException();
  }
  const driver = await driverRepository.findByUserId(userId);
  if (!driver) {
    throw new NotFoundException("Driver profile not found");
  }
  return driver;
}
