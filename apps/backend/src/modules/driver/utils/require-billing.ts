import { NotFoundException } from "@nestjs/common";
import type { Request } from "express";
import type { DriverRepository } from "../repositories/driver.repository";
import type { DriverSubscriptionRepository } from "../repositories/subscription.repository";
import { requireDriver } from "./require-driver";

export async function requireBilling(
  drivers: DriverRepository,
  subscriptions: DriverSubscriptionRepository,
  request: Request,
) {
  const driver = await requireDriver(drivers, request);
  const billing = await subscriptions.findBilling(driver.id);
  if (!billing) {
    throw new NotFoundException("Driver profile not found");
  }
  return billing;
}
