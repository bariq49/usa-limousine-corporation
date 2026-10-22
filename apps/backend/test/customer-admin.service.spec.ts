import { NotFoundException } from "@nestjs/common";
import { CustomerService } from "../src/modules/customer/services/customer.service";

describe("CustomerService (admin)", () => {
  it("returns the customer detail", async () => {
    const findById = jest.fn(async () => ({ id: "c1" }));
    const service = new CustomerService({ findById } as never);

    await expect(service.getOne("c1")).resolves.toEqual({ id: "c1" });
    expect(findById).toHaveBeenCalledWith("c1");
  });

  it("throws 404 for an unknown customer", async () => {
    const service = new CustomerService({ findById: jest.fn(async () => null) } as never);

    await expect(service.getOne("missing")).rejects.toBeInstanceOf(NotFoundException);
  });
});
