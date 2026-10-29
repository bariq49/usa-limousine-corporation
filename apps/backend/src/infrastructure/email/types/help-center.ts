export type TicketMailView = {
  ticketNumber: string;
  subject: string;
  description: string;
  category: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
};

export type TicketReceivedMailProps = {
  siteUrl: string;
  ticket: TicketMailView;
};

export type TicketAdminMailProps = {
  siteUrl: string;
  ticket: TicketMailView;
  source: "website" | "portal";
};

export type TicketPriorityMailProps = {
  siteUrl: string;
  ticket: TicketMailView;
};

export type TicketRepliedMailProps = {
  siteUrl: string;
  ticket: TicketMailView;
  reply: string;
};
