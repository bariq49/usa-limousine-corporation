import { BUFFER_MIN } from "../src/modules/trip/constants/trip.constants";
import { hasOverlap, slots } from "../src/modules/trip/utils/overlap";

const timezone = "Europe/Amsterdam";

describe("trip overlap", () => {
  it("treats the same pickup date and time as overlap", () => {
    const left = slots({
      bookingTime: { pickupDate: "2026-09-11", pickupTime: "14:00" },
      duration: 0,
      timezone,
    });
    const right = slots({
      bookingTime: { pickupDate: "2026-09-11", pickupTime: "14:00" },
      duration: 30,
      timezone,
    });
    expect(hasOverlap({ left, right })).toBe(true);
  });

  it("blocks a booking that starts during another duration", () => {
    const left = slots({
      bookingTime: { pickupDate: "2026-09-11", pickupTime: "14:00" },
      duration: 60,
      timezone,
    });
    const right = slots({
      bookingTime: { pickupDate: "2026-09-11", pickupTime: "14:30" },
      duration: 30,
      timezone,
    });
    expect(hasOverlap({ left, right })).toBe(true);
  });

  it("allows a booking that starts when the previous duration ends", () => {
    const left = slots({
      bookingTime: { pickupDate: "2026-09-11", pickupTime: "14:00" },
      duration: 60,
      timezone,
      bufferMin: 0,
    });
    const right = slots({
      bookingTime: { pickupDate: "2026-09-11", pickupTime: "15:00" },
      duration: 30,
      timezone,
      bufferMin: 0,
    });
    expect(hasOverlap({ left, right })).toBe(false);
  });

  it("blocks a booking that starts during the travel buffer", () => {
    const left = slots({
      bookingTime: { pickupDate: "2026-09-11", pickupTime: "14:00" },
      duration: 60,
      timezone,
      bufferMin: BUFFER_MIN,
    });
    const right = slots({
      bookingTime: { pickupDate: "2026-09-11", pickupTime: "15:00" },
      duration: 30,
      timezone,
      bufferMin: BUFFER_MIN,
    });
    expect(hasOverlap({ left, right })).toBe(true);
  });

  it("allows a booking that starts when the travel buffer ends", () => {
    const left = slots({
      bookingTime: { pickupDate: "2026-09-11", pickupTime: "14:00" },
      duration: 60,
      timezone,
      bufferMin: BUFFER_MIN,
    });
    const right = slots({
      bookingTime: { pickupDate: "2026-09-11", pickupTime: "15:15" },
      duration: 30,
      timezone,
      bufferMin: BUFFER_MIN,
    });
    expect(hasOverlap({ left, right })).toBe(false);
  });
});
