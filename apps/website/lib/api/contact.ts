import { COMPANY_EMAIL } from "@/constants/app-default";

export interface ContactPayload {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
}

/** No contact endpoint yet: opens the visitor's email app addressed to our inbox. */
export const contactUs = async (payload: ContactPayload) => {
    const body = [
        payload.message,
        "",
        `Name: ${payload.firstName} ${payload.lastName}`.trim(),
        `Email: ${payload.email}`,
        `Phone: ${payload.phone}`,
    ].join("\n");
    const query = new URLSearchParams({ subject: payload.subject || "Website enquiry", body });
    window.location.href = `mailto:${COMPANY_EMAIL}?${query.toString().replace(/\+/g, "%20")}`;
    return { message: "Your email app has opened with your message." };
};
