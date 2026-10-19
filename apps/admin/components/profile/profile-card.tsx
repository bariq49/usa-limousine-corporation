"use client";

import {
  Mail,
  User,
  Phone,
  Location,
  CalendarClock,
  Globe,
  Calendar,
  Home,
  Signpost,
  Hash,
  Mail2,
  Building,
  Map,
} from "@usa-limousine-corporation/ui/svg";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@usa-limousine-corporation/ui/components/card";
import { formatDate } from "@usa-limousine-corporation/ui/utils/date";
import type { Driver } from "@/lib/types/drivers";

export interface ProfileCardProps {
  driver?: Driver | null | undefined;
}

export function ProfileCard({ driver }: ProfileCardProps) {
  return (
    <Card className="h-fit w-full shadow-xs border border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 -ml-2">
          <User className="h-6 w-6 text-primary" />
          <CardTitle className="text-lg font-semibold text-default-900">Personal Info</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="flex w-[145px] shrink-0 items-center gap-2">
                <User className="h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm font-semibold text-default-800">Full Name:</span>
              </div>
              <span className="min-w-0 flex-1 break-words text-sm text-default-700">
                {driver?.firstName ? driver.firstName + " " + driver.lastName : "..."}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex w-[145px] shrink-0 items-center gap-2">
                <Mail className="h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm font-semibold text-default-800">Email:</span>
              </div>
              <span className="min-w-0 flex-1 break-words text-sm text-default-700">
                {driver?.email || "—"}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex w-[145px] shrink-0 items-center gap-2">
                <Phone className="h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm font-semibold text-default-800">Phone:</span>
              </div>
              <span className="min-w-0 flex-1 break-words text-sm text-default-700">
                {driver?.phone || driver?.phoneNumber || "—"}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex w-[145px] shrink-0 items-center gap-2">
                <CalendarClock className="h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm font-semibold text-default-800">Experience:</span>
              </div>
              <span className="min-w-0 flex-1 break-words text-sm text-default-700">
                {driver?.yearsExperience ? `${driver.yearsExperience} Years` : "—"}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex w-[145px] shrink-0 items-center gap-2">
                <User className="h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm font-semibold text-default-800">Dresses in Suit:</span>
              </div>
              <span className="min-w-0 flex-1 break-words text-sm text-default-700">
                {driver?.dressesInSuit ? "Yes" : "No"}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex w-[145px] shrink-0 items-center gap-2">
                <Home className="h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm font-semibold text-default-800">Home Address:</span>
              </div>
              <span className="min-w-0 flex-1 break-words text-sm text-default-700">
                {driver?.homeAddress || "—"}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex w-[145px] shrink-0 items-center gap-2">
                <Signpost className="h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm font-semibold text-default-800">Street:</span>
              </div>
              <span className="min-w-0 flex-1 break-words text-sm text-default-700">
                {driver?.streetName || "—"}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex w-[145px] shrink-0 items-center gap-2">
                <Hash className="h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm font-semibold text-default-800">House No:</span>
              </div>
              <span className="min-w-0 flex-1 break-words text-sm text-default-700">
                {driver?.houseNo || "—"}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex w-[145px] shrink-0 items-center gap-2">
                <Mail2 className="h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm font-semibold text-default-800">Postal Code:</span>
              </div>
              <span className="min-w-0 flex-1 break-words text-sm text-default-700">
                {driver?.postalCode || "—"}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex w-[145px] shrink-0 items-center gap-2">
                <Building className="h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm font-semibold text-default-800">City:</span>
              </div>
              <span className="min-w-0 flex-1 break-words text-sm text-default-700">
                {driver?.city || "—"}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex w-[145px] shrink-0 items-center gap-2">
                <Map className="h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm font-semibold text-default-800">Province:</span>
              </div>
              <span className="min-w-0 flex-1 break-words text-sm text-default-700">
                {driver?.province || "—"}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex w-[145px] shrink-0 items-center gap-2">
                <Location className="h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm font-semibold text-default-800">Op. City:</span>
              </div>
              <span className="min-w-0 flex-1 break-words text-sm text-default-700">
                {driver?.operatingCity || "—"}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex w-[145px] shrink-0 items-center gap-2">
                <Globe className="h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm font-semibold text-default-800">Op. Country:</span>
              </div>
              <span className="min-w-0 flex-1 break-words text-sm text-default-700">
                {driver?.operatingCountry || "—"}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex w-[145px] shrink-0 items-center gap-2">
                <Calendar className="h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm font-semibold text-default-800">Applied On:</span>
              </div>
              <span className="min-w-0 flex-1 break-words text-sm text-default-700">
                {driver?.createdAt ? formatDate({ date: driver.createdAt }) : "—"}
              </span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
