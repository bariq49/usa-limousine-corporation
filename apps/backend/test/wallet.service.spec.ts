import { Test, type TestingModule } from "@nestjs/testing";
import { WalletTransactionType } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { WalletRepository } from "../src/modules/wallet/repositories/wallet.repository";
import { WalletService } from "../src/modules/wallet/services/wallet.service";

describe("WalletService", () => {
  it("credits a trip amount", async () => {
    const wallet = {
      id: "w1",
      ownerType: "DRIVER",
      ownerId: "d1",
      balance: new Decimal("45.50"),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const transaction = {
      id: "t1",
      walletId: "w1",
      type: WalletTransactionType.TRIP_CREDIT,
      amount: new Decimal("45.50"),
      balanceAfter: new Decimal("45.50"),
      bookingId: "b1",
      tripId: "trip-1",
      description: "Trip completed",
      createdAt: new Date(),
    };
    const credit = jest.fn(async () => ({
      credited: true,
      wallet,
      transaction,
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: WalletRepository,
          useValue: { credit, findById: jest.fn() },
        },
      ],
    }).compile();

    const service = module.get(WalletService);
    const result = await service.credit({
      walletId: "w1",
      tripId: "trip-1",
      bookingId: "b1",
      amount: 45.5,
    });

    expect(result.credited).toBe(true);
    expect(result.balance).toBe(45.5);
  });

  it("returns idempotent credit result without side effects", async () => {
    const wallet = {
      id: "w1",
      ownerType: "DRIVER",
      ownerId: "d1",
      balance: new Decimal("45.50"),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const transaction = {
      id: "t1",
      walletId: "w1",
      type: WalletTransactionType.TRIP_CREDIT,
      amount: new Decimal("45.50"),
      balanceAfter: new Decimal("45.50"),
      bookingId: "b1",
      tripId: "trip-1",
      description: null,
      createdAt: new Date(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: WalletRepository,
          useValue: {
            credit: jest.fn(async () => ({
              credited: false,
              wallet,
              transaction,
            })),
          },
        },
      ],
    }).compile();

    const service = module.get(WalletService);
    const result = await service.credit({
      walletId: "w1",
      tripId: "trip-1",
      bookingId: "b1",
      amount: 45.5,
    });

    expect(result.credited).toBe(false);
  });

  it("returns wallet summary by wallet id", async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: WalletRepository,
          useValue: {
            findById: async () => ({
              id: "w1",
              ownerType: "DRIVER",
              ownerId: "d1",
              balance: new Decimal("12"),
              createdAt: new Date(),
              updatedAt: new Date(),
            }),
          },
        },
      ],
    }).compile();

    const service = module.get(WalletService);
    const result = await service.get("w1");

    expect(result.id).toBe("w1");
    expect(result.balance).toBe(12);
  });
});
