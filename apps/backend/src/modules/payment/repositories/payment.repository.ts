import { Inject, Injectable } from "@nestjs/common";
import { PaymentStatus, Prisma, type PaymentPurpose } from "@prisma/client";
import { APIFeature } from "../../../common/api-feature";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type { QueryDto } from "../dto/payment.dto";
import type { CreateInput, PrepareInput, UpdateInput } from "../types/payment";
import { assertCheckoutPaymentAllowed } from "../utils/checkout-validation";
import { buildPaymentUpdateData } from "../utils/payment-update";

@Injectable()
export class PaymentRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  findMany(query: QueryDto) {
    const feature = new APIFeature(query, {
      filterFields: ["status", "purpose", "referenceId", "transactionId"],
      search: {
        searchFields: ["transactionId", "id", "referenceId"],
      },
      sort: {
        allowedFields: ["createdAt", "updatedAt", "status", "amount"],
        defaultSortBy: "createdAt",
        defaultSortOrder: "desc",
      },
      pagination: {
        defaultLimit: 20,
        maxLimit: 100,
      },
    });

    return feature.execute({
      findMany: (args) =>
        this.prisma.payment.findMany({
          where: args.where as never,
          orderBy: args.orderBy as never,
          skip: args.skip,
          take: args.take,
        }),
      count: ({ where }) => this.prisma.payment.count({ where: where as never }),
    });
  }

  findById(id: string) {
    return this.prisma.payment.findUnique({ where: { id } });
  }

  findByReference(purpose: PaymentPurpose, referenceId: string) {
    return this.prisma.payment.findUnique({
      where: { purpose_referenceId: { purpose, referenceId } },
    });
  }

  findByCheckoutSessionId(sessionId: string) {
    return this.prisma.payment.findFirst({
      where: {
        checkout: {
          path: ["sessionId"],
          equals: sessionId,
        },
      },
    });
  }

  create(data: CreateInput) {
    const createData: Prisma.PaymentCreateInput = {
      purpose: data.purpose,
      referenceId: data.referenceId,
      amount: data.amount,
    };

    if (data.transactionId !== undefined) {
      createData.transactionId = data.transactionId;
    }
    if (data.status !== undefined) {
      createData.status = data.status;
    }
    if (data.method !== undefined) {
      createData.method = data.method as Prisma.InputJsonValue;
    }
    if (data.checkout !== undefined) {
      createData.checkout = data.checkout as Prisma.InputJsonValue;
    }

    return this.prisma.payment.create({ data: createData });
  }

  async prepareForCheckout(input: PrepareInput) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.payment.findUnique({
        where: { purpose_referenceId: { purpose: input.purpose, referenceId: input.referenceId } },
      });

      if (existing) {
        assertCheckoutPaymentAllowed(existing.status, input.purpose);
        const payment = await tx.payment.update({
          where: { id: existing.id },
          data: {
            amount: input.amount,
            status: PaymentStatus.PENDING,
            method: input.method as Prisma.InputJsonValue,
          },
        });
        return { payment, created: false };
      }

      const createData: Prisma.PaymentCreateInput = {
        purpose: input.purpose,
        referenceId: input.referenceId,
        amount: input.amount,
        status: PaymentStatus.PENDING,
        method: input.method as Prisma.InputJsonValue,
      };

      if (input.transactionId !== undefined) {
        createData.transactionId = input.transactionId;
      }

      try {
        const payment = await tx.payment.create({ data: createData });
        return { payment, created: true };
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
          const raced = await tx.payment.findUnique({
            where: {
              purpose_referenceId: {
                purpose: input.purpose,
                referenceId: input.referenceId,
              },
            },
          });
          if (!raced) {
            throw error;
          }
          assertCheckoutPaymentAllowed(raced.status, input.purpose);
          const payment = await tx.payment.update({
            where: { id: raced.id },
            data: {
              amount: input.amount,
              status: PaymentStatus.PENDING,
              method: input.method as Prisma.InputJsonValue,
            },
          });
          return { payment, created: false };
        }
        throw error;
      }
    });
  }

  deleteById(id: string) {
    return this.prisma.payment.delete({ where: { id } });
  }

  update(id: string, data: UpdateInput) {
    return this.prisma.payment.update({
      where: { id },
      data: buildPaymentUpdateData(data),
    });
  }
}
