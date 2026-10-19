import { Audience, PaymentPurpose } from "@prisma/client";

/** Map subscription audience → payment purpose. */
export function purposeFor(audience: Audience): PaymentPurpose {
  switch (audience) {
    case Audience.DRIVER:
      return PaymentPurpose.DRIVER_SUBSCRIPTION;
    case Audience.AGENCY:
      return PaymentPurpose.AGENCY_SUBSCRIPTION;
    default: {
      const _exhaustive: never = audience;
      return _exhaustive;
    }
  }
}
