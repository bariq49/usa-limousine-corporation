import { ForbiddenException } from "@nestjs/common";
import { TripStatus } from "@prisma/client";
import { CallService } from "../src/modules/trip/services/call.service";
import { agoraUidFromUserId, tripCallChannel } from "../src/modules/trip/utils/agora-uid";

describe("trip call helpers", () => {
  it("derives stable non-zero agora uids", () => {
    const a = agoraUidFromUserId("user_abc");
    const b = agoraUidFromUserId("user_abc");
    const c = agoraUidFromUserId("user_xyz");
    expect(a).toBe(b);
    expect(a).not.toBe(c);
    expect(a).toBeGreaterThan(0);
  });

  it("builds trip call channel name", () => {
    expect(tripCallChannel("t1")).toBe("trip:t1");
  });
});

describe("CallService.assertCallable", () => {
  const service = new CallService({} as never, {} as never, {} as never, {} as never);

  it("allows in-progress trip statuses like chat", () => {
    expect(() => service.assertCallable(TripStatus.STARTED)).not.toThrow();
    expect(() => service.assertCallable(TripStatus.PASSENGER_ON_BOARD)).not.toThrow();
  });

  it("blocks before start and after complete", () => {
    expect(() => service.assertCallable(TripStatus.ACCEPTED)).toThrow(ForbiddenException);
    expect(() => service.assertCallable(TripStatus.COMPLETED)).toThrow(ForbiddenException);
  });
});
