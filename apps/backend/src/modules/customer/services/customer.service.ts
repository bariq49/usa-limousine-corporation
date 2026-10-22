import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { AdminCustomerQueryDto } from "../dto/admin-customer.dto";
import { CustomerRepository } from "../repositories/customer.repository";
import type { Create } from "../types/customer";

@Injectable()
export class CustomerService {
  constructor(@Inject(CustomerRepository) private readonly customers: CustomerRepository) {}

  create(params: Create) {
    return this.customers.create(params);
  }

  list(query: AdminCustomerQueryDto) {
    return this.customers.findMany(query);
  }

  async getOne(id: string) {
    const customer = await this.customers.findById(id);
    if (!customer) {
      throw new NotFoundException("Customer not found");
    }
    return customer;
  }
}
