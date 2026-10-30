export type ContactTopic = "BOOKING" | "PAYMENTS" | "ACCOUNT" | "OTHER";

export type ContactPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  category: ContactTopic;
  website: string;
};

export type ContactResponse = {
  message: string;
  ticketNumber: string | null;
};
