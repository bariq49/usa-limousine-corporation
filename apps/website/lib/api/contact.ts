import API_ROUTES from "@/config/routes";
import { api } from "./client";

export type ContactTopic = "BOOKING" | "PAYMENTS" | "ACCOUNT" | "OTHER";

export interface ContactPayload {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    category: ContactTopic;
    website: string;
}

export const contactUs = async (payload: ContactPayload): Promise<{ message: string; ticketNumber: string | null }> => {
    const response = await api.post(API_ROUTES.CONTACT, payload);
    return response.data;
};
