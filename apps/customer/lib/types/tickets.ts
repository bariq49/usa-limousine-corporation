import type { ReactNode } from "react";
import type { TicketCategory } from "@/lib/api/types";

export type NewTicketFormValues = {
  subject: string;
  category: TicketCategory;
  description: string;
  attachment?: string | undefined;
};

export type NewTicketDialogProps = {
  onCreated?: ((id: string) => void) | undefined;
  trigger?: ReactNode | undefined;
};
