import { Test, type TestingModule } from "@nestjs/testing";
import { DriverCalendarRepository } from "../src/modules/driver/repositories/calendar.repository";
import { PrismaService } from "../src/infrastructure/database/prisma.service";
import type { CalendarQueryDto } from "../src/modules/driver/dto/calendar.dto";

describe("DriverCalendarRepository", () => {
  let repository: DriverCalendarRepository;
  let prisma: PrismaService;

  const mockPrisma = {
    calendarEvent: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    booking: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DriverCalendarRepository,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    repository = module.get<DriverCalendarRepository>(DriverCalendarRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(repository).toBeDefined();
  });

  it("should find and enrich events with bookings", async () => {
    const mockEvents = [
      { id: "event-1", bookingId: "booking-1" },
      { id: "event-2", bookingId: null },
    ];
    mockPrisma.calendarEvent.findMany.mockResolvedValue(mockEvents);
    mockPrisma.calendarEvent.count.mockResolvedValue(2);

    const mockBookings = [{ id: "booking-1", vehicleCategory: { id: "cat-1" } }];
    mockPrisma.booking.findMany.mockResolvedValue(mockBookings);

    const query = { page: 1, limit: 10 };
    const result = await repository.findEvents("driver-1", query as CalendarQueryDto);

    expect(prisma.calendarEvent.findMany).toHaveBeenCalled();
    expect(prisma.calendarEvent.count).toHaveBeenCalled();
    expect(prisma.booking.findMany).toHaveBeenCalledWith({
      where: { id: { in: ["booking-1"] } },
      include: {
        vehicleCategory: true,
        trip: true,
      },
    });

    expect(result.data).toHaveLength(2);
    expect(result.data[0]!.booking).toEqual(mockBookings[0]);
    expect(result.data[1]!.booking).toBeNull();
    expect(result.total).toBe(2);
  });
});
