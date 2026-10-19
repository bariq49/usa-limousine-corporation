import {
  formatDate,
  formatRelativeTime,
  formatTime,
} from "@usa-limousine-corporation/ui/utils/date";
import type { ActivityItem } from "@/lib/types/drivers";

export type Item = {
  id: string;
  at: string;
  title: string;
  description: string;
  color: string;
  meta?: string;
};

type Copy = Pick<Item, "title" | "description" | "color">;

type BuildProps = {
  activity?: ActivityItem[] | null | undefined;
};

type FilterProps = {
  items: Item[];
  search: string;
};

type StampProps = {
  date?: string | null | undefined;
};

type Stamp = {
  primary: string;
  secondary: string;
};

const FIELD_LABELS: Record<string, string> = {
  firstName: "First name",
  lastName: "Last name",
  phone: "Phone number",
  avatarUrl: "Profile photo",
  about: "About",
  address: "Address",
  houseNo: "House number",
  streetName: "Street name",
  postalCode: "Postal code",
  city: "City",
  province: "Province",
  country: "Country",
  countryCode: "Country code",
  yearsExperience: "Years of experience",
  shift: "Shift schedule",
  dressesInSuit: "Dress code",
  services: "Services",
  languages: "Languages",
};

const DOCUMENT_LABELS: Record<string, string> = {
  CHAUFFEUR_FRONT: "Chauffeur card (front)",
  CHAUFFEUR_BACK: "Chauffeur card (back)",
  KIWA_PERMIT: "Kiwa permit",
  LICENSE_FRONT: "License (front)",
  LICENSE_BACK: "License (back)",
  NATIONAL_ID_FRONT: "National ID (front)",
  NATIONAL_ID_BACK: "National ID (back)",
  AIRPORT_STA_PASS: "Airport STA pass",
  CAR_REGISTRATION: "Car registration",
  CAR_FRONT: "Car front photo",
  CAR_BACK: "Car back photo",
  CAR_LEFT: "Car left photo",
  CAR_RIGHT: "Car right photo",
  CAR_INSIDE: "Car interior photo",
  LICENSE_PLATE: "License plate photo",
  INSURANCE: "Insurance",
};

const EVENTS: Record<string, Copy> = {
  APPLICATION_UNDER_REVIEW: {
    title: "Marked Under Review",
    description: "Application status changed to under review.",
    color: "bg-amber-500",
  },
  APPLICATION_APPROVED: {
    title: "Application Approved",
    description: "Application was approved.",
    color: "bg-emerald-500",
  },
  APPLICATION_REJECTED: {
    title: "Application Rejected",
    description: "Application was rejected.",
    color: "bg-rose-500",
  },
  SUSPENDED: {
    title: "Account Suspended",
    description: "Account access was suspended.",
    color: "bg-rose-500",
  },
  UNSUSPENDED: {
    title: "Account Unsuspended",
    description: "Account access was restored.",
    color: "bg-emerald-500",
  },
  DELETE_REQUESTED: {
    title: "Account Deletion Requested",
    description: "Account deletion was requested.",
    color: "bg-rose-500",
  },
  DELETE_APPROVED: {
    title: "Account Deletion Approved",
    description: "Account deletion was approved and the account was deactivated.",
    color: "bg-emerald-500",
  },
  DELETE_REJECTED: {
    title: "Account Deletion Rejected",
    description: "Account deletion request was rejected.",
    color: "bg-amber-500",
  },
  DELETE_CANCELLED: {
    title: "Account Deletion Cancelled",
    description: "Account deletion request was cancelled.",
    color: "bg-default-400",
  },
  PROFILE_UPDATED: {
    title: "Profile Updated",
    description: "Profile details were updated.",
    color: "bg-sky-500",
  },
  DOCUMENTS_UPDATED: {
    title: "Documents Updated",
    description: "Driver documents were updated.",
    color: "bg-violet-500",
  },
  VEHICLE_UPDATED: {
    title: "Vehicle Updated",
    description: "Vehicle details were updated.",
    color: "bg-indigo-500",
  },
  TICKET_CREATED: {
    title: "Support Ticket Created",
    description: "A support ticket was created.",
    color: "bg-orange-500",
  },
  TICKET_REPLIED: {
    title: "Support Ticket Replied",
    description: "A reply was added to the support ticket.",
    color: "bg-sky-500",
  },
  TICKET_STATUS_UPDATED: {
    title: "Support Ticket Updated",
    description: "Support ticket status was updated.",
    color: "bg-amber-500",
  },
};

function label(map: Record<string, string>, key: string) {
  if (map[key]) return map[key];
  return key.includes("_")
    ? key.replace(/_/g, " ").toLowerCase()
    : key.replace(/([A-Z])/g, " $1").toLowerCase();
}

function joinLabels(labels: string[]) {
  if (labels.length === 0) return "";
  if (labels.length === 1) return labels[0]!;
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")}, and ${labels.at(-1)}`;
}

function makeItem(
  id: string,
  at: string,
  title: string,
  description: string,
  color: string,
  meta?: string | null,
): Item {
  const item: Item = {
    id,
    at,
    title,
    description,
    color,
  };

  if (meta) {
    item.meta = meta;
  }

  return item;
}

function fromProfile(item: ActivityItem): Item {
  const fields = item.data?.changedFields ?? [];
  const labels = fields.map((field) => label(FIELD_LABELS, field));
  const only = fields[0];

  if (fields.length === 1 && only === "avatarUrl") {
    return makeItem(
      item.id,
      item.createdAt,
      "Profile Photo Updated",
      "Profile photo was updated.",
      "bg-sky-500",
    );
  }

  if (fields.length === 1 && only === "phone") {
    return makeItem(
      item.id,
      item.createdAt,
      "Phone Number Updated",
      "Phone number was updated.",
      "bg-sky-500",
    );
  }

  const copy = EVENTS["PROFILE_UPDATED"]!;
  return makeItem(
    item.id,
    item.createdAt,
    copy.title,
    labels.length > 0 ? `${joinLabels(labels)} updated.` : copy.description,
    copy.color,
    labels.length > 1 ? `Fields: ${labels.join(", ")}` : null,
  );
}

function fromDocuments(item: ActivityItem): Item {
  const labels = (item.data?.documentTypes ?? []).map((type) => label(DOCUMENT_LABELS, type));

  let meta: string | null = null;
  if (item.data?.licenseExpiry) {
    meta = `License expiry: ${item.data?.licenseExpiry}`;
  } else if (item.data?.kvkNo) {
    meta = `KVK: ${item.data?.kvkNo}`;
  }

  const copy = EVENTS["DOCUMENTS_UPDATED"]!;
  return makeItem(
    item.id,
    item.createdAt,
    copy.title,
    labels.length > 0 ? `${joinLabels(labels)} updated.` : copy.description,
    copy.color,
    meta,
  );
}

function fromVehicle(item: ActivityItem): Item {
  const copy = EVENTS["VEHICLE_UPDATED"]!;
  return makeItem(
    item.id,
    item.createdAt,
    copy.title,
    copy.description,
    copy.color,
    item.data?.licensePlate ? `Plate: ${item.data?.licensePlate}` : null,
  );
}

function deleteMeta(item: ActivityItem) {
  if (item.type === "DELETE_REQUESTED" && item.data?.reason) {
    return `Reason: ${item.data?.reason}`;
  }

  if (item.data?.adminNote) {
    return `Note: ${item.data?.adminNote}`;
  }

  if (item.data?.reason) {
    return `Reason: ${item.data?.reason}`;
  }

  return null;
}

function statusLabel(value?: string | null) {
  if (!value) return "";
  return value.replace(/_/g, " ").toLowerCase();
}

function ticketMeta(item: ActivityItem) {
  const parts: string[] = [];
  if (item.data?.ticketNumber) {
    parts.push(item.data.ticketNumber);
  }
  if (item.data?.subject) {
    parts.push(item.data.subject);
  }
  return parts.length > 0 ? parts.join(" · ") : null;
}

function fromTicket(item: ActivityItem): Item {
  const meta = ticketMeta(item);

  if (item.type === "TICKET_CREATED") {
    const copy = EVENTS["TICKET_CREATED"]!;
    return makeItem(
      item.id,
      item.createdAt,
      copy.title,
      item.data?.ticketNumber
        ? `Support ticket ${item.data.ticketNumber} was created.`
        : copy.description,
      copy.color,
      meta,
    );
  }

  if (item.type === "TICKET_REPLIED") {
    const copy = EVENTS["TICKET_REPLIED"]!;
    return makeItem(
      item.id,
      item.createdAt,
      copy.title,
      item.data?.ticketNumber
        ? `A reply was added to ticket ${item.data.ticketNumber}.`
        : copy.description,
      copy.color,
      meta,
    );
  }

  const copy = EVENTS["TICKET_STATUS_UPDATED"]!;
  const from = statusLabel(item.data?.from);
  const to = statusLabel(item.data?.to);
  const description =
    from && to ? `Ticket status changed from ${from} to ${to}.` : copy.description;

  return makeItem(
    item.id,
    item.createdAt,
    copy.title,
    description,
    copy.color,
    item.data?.note ? `Note: ${item.data.note}` : meta,
  );
}

function fromActivity(item: ActivityItem): Item {
  if (item.type === "PROFILE_UPDATED") {
    return fromProfile(item);
  }

  if (item.type === "DOCUMENTS_UPDATED") {
    return fromDocuments(item);
  }

  if (item.type === "VEHICLE_UPDATED") {
    return fromVehicle(item);
  }

  if (
    item.type === "TICKET_CREATED" ||
    item.type === "TICKET_REPLIED" ||
    item.type === "TICKET_STATUS_UPDATED"
  ) {
    return fromTicket(item);
  }

  const copy = EVENTS[item.type];
  if (copy) {
    return makeItem(
      item.id,
      item.createdAt,
      copy.title,
      copy.description,
      copy.color,
      deleteMeta(item),
    );
  }

  return makeItem(
    item.id,
    item.createdAt,
    "Activity",
    item.type.replace(/_/g, " ").toLowerCase(),
    "bg-default-400",
  );
}

export function buildTimeline(props: BuildProps): Item[] {
  const { activity } = props;
  return (activity ?? []).map(fromActivity);
}

export function filterTimeline(props: FilterProps): Item[] {
  const { items, search } = props;
  const query = search.trim().toLowerCase();

  if (!query) return items;

  return items.filter((item) => {
    const haystack = `${item.title} ${item.description} ${item.meta ?? ""}`.toLowerCase();
    return haystack.includes(query);
  });
}

export function timelineStamp(props: StampProps): Stamp {
  const { date } = props;

  if (!date) {
    return { primary: "—", secondary: "" };
  }

  const relative = formatRelativeTime({ date });
  if (relative === "Just now" || relative.endsWith("m ago") || relative.endsWith("h ago")) {
    return { primary: relative, secondary: "" };
  }

  const absoluteDate = formatDate({ date });
  const absoluteTime = formatTime({ date });

  return {
    primary: absoluteDate !== "—" ? absoluteDate : relative,
    secondary: absoluteTime !== "—" ? absoluteTime : "",
  };
}
