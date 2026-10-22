import { Controller, Get, Inject, Param, Query, UseGuards } from "@nestjs/common";
import { RoleKey } from "@prisma/client";
import { Roles } from "../../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../auth/guards/roles.guard";
import { AdminCustomerQueryDto } from "../dto/admin-customer.dto";
import { CustomerService } from "../services/customer.service";

@Controller("admin/customers")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleKey.SUPER_ADMIN)
export class AdminCustomerController {
  constructor(@Inject(CustomerService) private readonly customers: CustomerService) {}

  @Get()
  list(@Query() query: AdminCustomerQueryDto) {
    return this.customers.list(query);
  }

  @Get(":id")
  getOne(@Param("id") id: string) {
    return this.customers.getOne(id);
  }
}
