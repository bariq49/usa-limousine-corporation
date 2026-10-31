import type { Request } from "express";
import type { AssignDto } from "../dto/driver.dto";

export type AssignInput = {
  bookingId: string;
  body: AssignDto;
  request: Request;
};

export type AssignmentData = {
  bookingId: string;
  driverId: string;
  commissionRate: number;
  commissionAmount: number;
  driverAmount: number;
  note: string | null;
};
