import { Audience } from "@prisma/client";
import { RecipientType } from "../../notification/types/notification";

export function recipientFor(audience: Audience): RecipientType {
  switch (audience) {
    case Audience.DRIVER:
      return RecipientType.DRIVER;
    case Audience.AGENCY:
      return RecipientType.USER;
    default: {
      const _exhaustive: never = audience;
      return _exhaustive;
    }
  }
}
