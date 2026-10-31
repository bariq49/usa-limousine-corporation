import { Test, type TestingModule } from "@nestjs/testing";
import { PLATFORM } from "@usa-limousine-corporation/config";
import type { BookingEmail } from "../src/infrastructure/email/types/booking";
import { EmailService } from "../src/infrastructure/email/email.service";
import type { SendMailOptions, SendMailResult } from "../src/infrastructure/email/types/mail";
import { TwilioService } from "../src/infrastructure/twilio/twilio.service";
import type { Message, Result } from "../src/infrastructure/twilio/types/twilio";
import { AppLogger } from "../src/common/logger/app.logger";
import { DriverEmailService } from "../src/modules/drivers/services/driver-email.service";
import { DriverSmsService } from "../src/modules/drivers/services/driver-sms.service";

async function createEmailService(send: jest.Mock<Promise<SendMailResult>, [SendMailOptions]>) {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      DriverEmailService,
      { provide: EmailService, useValue: { send } },
      { provide: AppLogger, useValue: { error: jest.fn() } },
    ],
  }).compile();

  return module.get(DriverEmailService);
}

async function createSmsService(
  isConfigured: boolean,
  send: jest.Mock<Promise<Result>, [Message]>,
) {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      DriverSmsService,
      { provide: TwilioService, useValue: { isConfigured: () => isConfigured, send } },
      { provide: AppLogger, useValue: { error: jest.fn() } },
    ],
  }).compile();

  return module.get(DriverSmsService);
}

const booking: BookingEmail = {
  id: "booking-1",
  bookingNumber: "BK-000001",
  bookingType: "ONE_WAY",
  vehicleCount: 1,
  vehicle: {
    name: "Sedan",
    description: null,
    image: null,
    passengerCount: 4,
  },
  pickupAddress: "1 Main Street",
  dropoffAddress: "2 Main Street",
  stops: [],
  distance: 10,
  travelDuration: 20,
  hourlyDuration: null,
  pickupDate: "2030-09-11",
  pickupTime: "14:00",
  returnDate: null,
  returnTime: null,
  passenger: {
    name: "Ada",
    email: "ada@example.com",
    phone: "+17325550100",
    ccEmail: null,
    passengerCount: 1,
  },
  flight: { number: null },
  meetAndGreet: { enabled: false, returnEnabled: false, signName: null },
  luggage: [],
  extras: [],
  notes: null,
  returnNotes: null,
  pricing: { total: 110 },
};

describe("DriverEmailService", () => {
  it("sends assignment email using the driver assignment template", async () => {
    const send = jest.fn<Promise<SendMailResult>, [SendMailOptions]>(async () => ({
      messageId: "mail-1",
      accepted: ["driver@example.com"],
      rejected: [],
    }));
    const service = await createEmailService(send);

    await service.sendAssigned({
      to: "driver@example.com",
      booking,
      assignment: {
        driverName: "Dana Driver",
        driverAmount: 88,
        note: "Meet at door 4",
      },
    });

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "driver@example.com",
        subject: expect.stringContaining(booking.bookingNumber),
        html: expect.stringContaining("New Ride Assigned"),
      }),
    );
  });
});

describe("DriverSmsService", () => {
  it("sends assignment details to the driver's phone", async () => {
    const send = jest.fn<Promise<Result>, [Message]>(async () => ({
      sid: "sms-1",
      status: "queued",
      to: "+17325550100",
      from: "+17325550199",
    }));
    const service = await createSmsService(true, send);

    await service.sendAssigned({
      to: "+17325550100",
      bookingNumber: booking.bookingNumber,
      pickupDate: booking.pickupDate,
      pickupTime: booking.pickupTime,
      pickupAddress: booking.pickupAddress,
    });

    expect(send).toHaveBeenCalledWith({
      to: "+17325550100",
      body: expect.stringContaining(`${PLATFORM.name}: ride ${booking.bookingNumber}`),
    });
  });

  it("skips sending when Twilio is not configured", async () => {
    const send = jest.fn<Promise<Result>, [Message]>();
    const service = await createSmsService(false, send);

    await service.sendAssigned({
      to: "+17325550100",
      bookingNumber: booking.bookingNumber,
      pickupDate: booking.pickupDate,
      pickupTime: booking.pickupTime,
      pickupAddress: booking.pickupAddress,
    });

    expect(send).not.toHaveBeenCalled();
  });
});
