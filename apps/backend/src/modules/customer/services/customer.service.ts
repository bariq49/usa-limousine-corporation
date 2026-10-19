import { Inject, Injectable } from "@nestjs/common";
import { CustomerRepository } from "../repositories/customer.repository";
import type { Create } from "../types/customer";

@Injectable()
export class CustomerService {
  constructor(@Inject(CustomerRepository) private readonly customers: CustomerRepository) {}

  create(params: Create) {
    return this.customers.create(params);
  }
}
