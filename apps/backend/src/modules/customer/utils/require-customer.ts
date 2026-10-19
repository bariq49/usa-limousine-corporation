import { NotFoundException, UnauthorizedException } from "@nestjs/common";
import type { Request } from "express";
import { toRequestContext } from "../../../common/utils/to-request-context";
import type { CustomerRepository } from "../repositories/customer.repository";

export async function requireCustomer(customers: CustomerRepository, request: Request) {
  const { userId } = toRequestContext(request);
  if (!userId) {
    throw new UnauthorizedException();
  }

  const customer = await customers.findByUserId(userId);
  if (!customer) {
    throw new NotFoundException("Customer profile not found");
  }

  return customer;
}
