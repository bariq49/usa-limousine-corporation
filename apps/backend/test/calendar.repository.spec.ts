import { Test, type TestingModule } from "@nestjs/testing";
import { CalendarOwnerType, CalendarEventType } from "@prisma/client";
import { PrismaService } from "../src/infrastructure/database/prisma.service";
import { CalendarRepository } from "../src/modules/calendar/repositories/calendar.repository";

describe("CalendarRepository", () => {
  let repository: CalendarRepository;
  let prisma: PrismaService;

  const mockPrisma = {
    calendarEvent: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalendarRepository,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    repository = module.get<CalendarRepository>(CalendarRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(repository).toBeDefined();
  });

  it("should create an event", async () => {
    const data = {
      ownerType: CalendarOwnerType.DRIVER,
      ownerId: "driver-1",
      type: CalendarEventType.CUSTOM,
      title: "Test",
      startAt: new Date(),
      endAt: new Date(),
    };
    mockPrisma.calendarEvent.create.mockResolvedValue({ id: "event-1", ...data });

    const result = await repository.create(data);

    expect(prisma.calendarEvent.create).toHaveBeenCalled();
    expect(result.id).toBe("event-1");
  });

  it("should find an event by id", async () => {
    mockPrisma.calendarEvent.findFirst.mockResolvedValue({ id: "event-1" });

    const result = await repository.findById("event-1");

    expect(prisma.calendarEvent.findFirst).toHaveBeenCalledWith({
      where: { id: "event-1", deletedAt: null },
    });
    expect(result?.id).toBe("event-1");
  });

  it("should find events by owner", async () => {
    mockPrisma.calendarEvent.findMany.mockResolvedValue([{ id: "event-1" }]);

    const result = await repository.findByOwner(CalendarOwnerType.DRIVER, "driver-1");

    expect(prisma.calendarEvent.findMany).toHaveBeenCalledWith({
      where: { ownerType: CalendarOwnerType.DRIVER, ownerId: "driver-1", deletedAt: null },
      orderBy: { startAt: "asc" },
    });
    expect(result).toHaveLength(1);
  });

  it("should find an event by booking id", async () => {
    mockPrisma.calendarEvent.findFirst.mockResolvedValue({ id: "event-1" });

    const result = await repository.findByBookingId("booking-1");

    expect(prisma.calendarEvent.findFirst).toHaveBeenCalledWith({
      where: { bookingId: "booking-1", deletedAt: null },
    });
    expect(result?.id).toBe("event-1");
  });

  it("should update an event", async () => {
    const data = { title: "New title" };
    mockPrisma.calendarEvent.update.mockResolvedValue({ id: "event-1", title: "New title" });

    const result = await repository.update("event-1", data);

    expect(prisma.calendarEvent.update).toHaveBeenCalledWith({
      where: { id: "event-1" },
      data: { title: "New title" },
    });
    expect(result.title).toBe("New title");
  });

  it("should soft delete an event", async () => {
    mockPrisma.calendarEvent.update.mockResolvedValue({ id: "event-1", deletedAt: new Date() });

    const result = await repository.softDelete("event-1");

    expect(prisma.calendarEvent.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "event-1" },
        data: { deletedAt: expect.any(Date) },
      }),
    );
    expect(result.deletedAt).toBeDefined();
  });
});
