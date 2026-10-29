import { BookingEmailService } from "../src/modules/booking/services/booking-email.service";
import { BookingSmsService } from "../src/modules/booking/services/booking-sms.service";

const row = (userId: string | null, choices = { notifyByEmail: true, notifyBySms: true }) => ({
  notifyByEmail: choices.notifyByEmail,
  notifyBySms: choices.notifyBySms,
  id: "book-1",
  userId,
  bookingNumber: "BK-000001",
  bookingType: "ONE_WAY",
  vehicleCount: 1,
  totalPrice: { toFixed: () => "110.00" },
  vehicleCategory: { name: "Sedan", description: null, image: null, passengerCount: 4 },
  address: { pickup: { address: "A" }, dropoff: { address: "B" }, distance: 10, duration: 20 },
  passenger: { passengerCount: 1, name: "Ada", email: "ada@example.com", phone: "+17322898928" },
  bookingTime: { pickupDate: "2030-09-11", pickupTime: "14:00" },
  flightDetails: null,
  meetAndGreet: null,
  luggage: [],
  extraServices: [],
  notes: null,
  pricing: { total: 110 },
});

function repository(
  userId: string | null,
  prefs = { email: true, sms: true },
  choices = { notifyByEmail: true, notifyBySms: true },
) {
  return {
    findById: jest.fn(async () => row(userId, choices)),
    contactPreferences: jest.fn(async () => prefs),
  };
}

describe("BookingSmsService", () => {
  const twilio = () => ({ isConfigured: () => true, send: jest.fn(async () => undefined) });

  it("texts a customer who has SMS turned on", async () => {
    const sms = twilio();
    const service = new BookingSmsService(repository("user-1") as never, sms as never, {} as never);

    await service.sendCancelled("book-1", "Flight cancelled");

    expect(sms.send).toHaveBeenCalledWith({
      to: "+17322898928",
      body: expect.stringContaining("BK-000001 has been cancelled. Reason: Flight cancelled."),
    });
  });

  it("skips customers who turned SMS off", async () => {
    const sms = twilio();
    const repo = repository("user-1", { email: true, sms: false });
    const service = new BookingSmsService(repo as never, sms as never, {} as never);

    await service.sendPaid("book-1");

    expect(repo.contactPreferences).toHaveBeenCalledWith("user-1");
    expect(sms.send).not.toHaveBeenCalled();
  });

  it("skips SMS when the rider did not choose SMS notifications for the booking", async () => {
    const sms = twilio();
    const repo = repository("user-1", undefined, { notifyByEmail: true, notifyBySms: false });
    const service = new BookingSmsService(repo as never, sms as never, {} as never);

    await service.sendPaid("book-1");

    expect(sms.send).not.toHaveBeenCalled();
  });

  it("does nothing when Twilio is not set up", async () => {
    const repo = repository(null);
    const service = new BookingSmsService(
      repo as never,
      { isConfigured: () => false, send: jest.fn() } as never,
      {} as never,
    );

    await service.sendConfirmed("book-1");

    expect(repo.findById).not.toHaveBeenCalled();
  });
});

describe("BookingEmailService preferences", () => {
  const setup = (
    prefs: { email: boolean; sms: boolean },
    choices = { notifyByEmail: true, notifyBySms: true },
  ) => {
    const email = { send: jest.fn(async () => ({ messageId: "m1" })) };
    const service = new BookingEmailService(
      repository("user-1", prefs, choices) as never,
      email as never,
      {
        get: (key: string) => (key === "DEFAULT_ADMIN_EMAIL" ? "admin@example.com" : undefined),
        getOrThrow: (key: string) =>
          ({
            EMAIL_HOST: "h",
            EMAIL_PORT: 465,
            EMAIL_FROM: "f@x.co",
            EMAIL_USER: "u",
            EMAIL_PASS: "p",
            WEBSITE_URL: "https://demo.usalimocorp.com",
          })[key],
      } as never,
      { error: jest.fn() } as never,
    );
    return { service, email };
  };

  it("skips customer emails when email is turned off but still tells the admin", async () => {
    const { service, email } = setup({ email: false, sms: true });

    await service.sendPaid({ bookingId: "book-1" });

    expect(email.send).toHaveBeenCalledTimes(1);
    expect(email.send).toHaveBeenCalledWith(expect.objectContaining({ to: "admin@example.com" }));
  });

  it("skips customer emails when the rider turned email notifications off for the booking", async () => {
    const { service, email } = setup(
      { email: true, sms: true },
      { notifyByEmail: false, notifyBySms: true },
    );

    await service.sendPaid({ bookingId: "book-1" });

    expect(email.send).toHaveBeenCalledTimes(1);
    expect(email.send).toHaveBeenCalledWith(expect.objectContaining({ to: "admin@example.com" }));
  });

  it("emails the customer when email is on", async () => {
    const { service, email } = setup({ email: true, sms: true });

    await service.sendConfirmed({ bookingId: "book-1" });

    expect(email.send).toHaveBeenCalledWith(expect.objectContaining({ to: "ada@example.com" }));
  });
});
