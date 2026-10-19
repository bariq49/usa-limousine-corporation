export interface ApplicationStatus {
  to: string;
  status: "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  reason?: string;
}
