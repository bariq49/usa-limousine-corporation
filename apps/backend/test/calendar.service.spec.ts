import { Test, type TestingModule } from "@nestjs/testing";
import { CalendarService } from "../src/modules/calendar/services/calendar.service";
import { CalendarRepository } from "../src/modules/calendar/repositories/calendar.repository";
import { CalendarOwnerType, CalendarEventType } from "@prisma/client";

describe("CalendarService", () => {
  let service: CalendarService;
  let repository: CalendarRepository;

  const mockRepository = {
    create: jest.fn(),
    findByOwner: jest.fn(),
    findById: jest.fn(),
    findByBookingId: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalendarService,
        {
          provide: CalendarRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CalendarService>(CalendarService);
    repository = module.get<CalendarRepository>(CalendarRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should create a calendar event", async () => {
    const mockData = {
      ownerType: CalendarOwnerType.DRIVER,
      ownerId: "driver-123",
      type: CalendarEventType.CUSTOM,
      title: "Vacation",
      startAt: new Date(),
      endAt: new Date(),
    };
    mockRepository.create.mockResolvedValue({ id: "event-1", ...mockData });

    const result = await service.create(mockData);

    expect(repository.create).toHaveBeenCalledWith(mockData);
    expect(result).toEqual({ id: "event-1", ...mockData });
  });

  it("should get events by owner", async () => {
    mockRepository.findByOwner.mockResolvedValue([{ id: "event-1" }]);

    const result = await service.getByOwner(CalendarOwnerType.DRIVER, "driver-123");

    expect(repository.findByOwner).toHaveBeenCalledWith(CalendarOwnerType.DRIVER, "driver-123");
    expect(result).toEqual([{ id: "event-1" }]);
  });

  it("should get event by id", async () => {
    mockRepository.findById.mockResolvedValue({ id: "event-1" });

    const result = await service.getById("event-1");

    expect(repository.findById).toHaveBeenCalledWith("event-1");
    expect(result).toEqual({ id: "event-1" });
  });

  it("should get event by reference id", async () => {
    mockRepository.findByBookingId.mockResolvedValue({ id: "event-1", bookingId: "booking-1" });

    const result = await service.getByReferenceId("booking-1");

    expect(repository.findByBookingId).toHaveBeenCalledWith("booking-1");
    expect(result).toEqual({ id: "event-1", bookingId: "booking-1" });
  });

  it("should update a calendar event", async () => {
    const updateData = { title: "Updated title" };
    mockRepository.update.mockResolvedValue({ id: "event-1", title: "Updated title" });

    const result = await service.update("event-1", updateData);

    expect(repository.update).toHaveBeenCalledWith("event-1", updateData);
    expect(result).toEqual({ id: "event-1", title: "Updated title" });
  });

  it("should delete a calendar event", async () => {
    mockRepository.softDelete.mockResolvedValue({ id: "event-1", deletedAt: new Date() });

    const result = await service.delete("event-1");

    expect(repository.softDelete).toHaveBeenCalledWith("event-1");
    expect(result.deletedAt).toBeDefined();
  });
});
