import { createHmac } from "node:crypto";
import { PaymentMode } from "@prisma/client";
import { SquareService } from "../src/infrastructure/square/square.service";

const URL = "https://api.usalimocorp.com/api/v1/payments/square/webhook";
const body = JSON.stringify({ type: "payment.updated", data: { object: {} } });
const sign = (key: string) =>
  createHmac("sha256", key)
    .update(URL + body)
    .digest("base64");

const service = new SquareService({
  get: (name: string) =>
    ({
      SQUARE_WEBHOOK_URL: URL,
      SQUARE_WEBHOOK_SIGNATURE_KEY_TEST: "test-key",
      SQUARE_WEBHOOK_SIGNATURE_KEY_LIVE: "live-key",
    })[name],
} as never);

describe("SquareService.verifyWebhook", () => {
  it("accepts events signed with either mode's key and reports the mode", async () => {
    await expect(service.verifyWebhook(body, sign("test-key"))).resolves.toBe(PaymentMode.TEST);
    await expect(service.verifyWebhook(body, sign("live-key"))).resolves.toBe(PaymentMode.LIVE);
  });

  it("rejects events with a wrong signature", async () => {
    await expect(service.verifyWebhook(body, sign("other-key"))).rejects.toThrow(
      "Invalid Square webhook signature",
    );
  });
});
