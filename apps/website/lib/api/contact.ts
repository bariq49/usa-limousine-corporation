import API_ROUTES from "@/config/routes";
import { api } from "./client";
import type { ContactPayload, ContactResponse } from "@/types/contact.types";

export const contactUs = async (payload: ContactPayload): Promise<ContactResponse> => {
  const response = await api.post(API_ROUTES.CONTACT, payload);
  return response.data;
};
