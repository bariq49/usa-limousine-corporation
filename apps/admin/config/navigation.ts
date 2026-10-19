import type { MenuSection } from "@usa-limousine-corporation/ui/types/navigation";
import {
  Dashboard,
  Calendar,
  CalendarCheck,
  Car,
  Grid,
  Luggage,
  Bicycle,
  Device,
  User,
  Blog,
  Graph,
  CalendarClock,
  CalendarCheck2,
  CalendarCross,
  ShieldCheck,
  Tag,
  Trash,
  Support,
} from "@usa-limousine-corporation/ui/svg";
import { APP_CONFIG } from "./app";

export const APP_NAME = APP_CONFIG.name;

export const navigation: MenuSection[] = [
  {
    id: "overview",
    label: "Overview",
    icon: Dashboard,
    submenu: true,
    groups: [
      {
        id: "main",
        items: [
          {
            id: "analytics",
            label: "Analytics",
            href: "/analytics",
            icon: Graph,
          },
        ],
      },
    ],
  },
  {
    id: "booking",
    label: "Booking",
    icon: Calendar,
    submenu: true,
    groups: [
      {
        id: "booking-group",
        items: [
          {
            id: "pending-bookings",
            label: "Pending Bookings",
            href: "/pending-bookings",
            icon: CalendarClock,
          },
          {
            id: "confirmed-bookings",
            label: "Confirmed Bookings",
            href: "/confirmed-bookings",
            icon: CalendarCheck,
          },
          {
            id: "completed-bookings",
            label: "Completed Bookings",
            href: "/completed-bookings",
            icon: CalendarCheck2,
          },
          {
            id: "cancelled-bookings",
            label: "Cancelled Bookings",
            href: "/cancelled-bookings",
            icon: CalendarCross,
          },
        ],
      },
    ],
  },
  {
    id: "driver",
    label: "Driver",
    icon: User,
    submenu: true,
    groups: [
      {
        id: "driver-group",
        items: [
          {
            id: "drivers",
            label: "Drivers",
            href: "/drivers",
            icon: Blog,
          },
          {
            id: "delete-requests",
            label: "Delete Requests",
            href: "/delete-requests",
            icon: Trash,
          },
        ],
      },
    ],
  },
  {
    id: "vehicle",
    label: "Vehicle",
    icon: Car,
    submenu: true,
    groups: [
      {
        id: "vehicle-group",
        items: [
          {
            id: "vehicles",
            label: "Vehicles",
            href: "/vehicles",
            icon: Car,
          },
          {
            id: "vehicle-categories",
            label: "Categories",
            href: "/categories",
            icon: Grid,
          },
          {
            id: "vehicle-pricing",
            label: "Pricing",
            href: "/pricing",
            icon: Tag,
          },
          {
            id: "vehicle-services",
            label: "Extra Services",
            href: "/extra-services",
            icon: ShieldCheck,
          },
          {
            id: "standard-luggage",
            label: "Standard Luggage",
            href: "/standard-luggage",
            icon: Luggage,
          },
          {
            id: "special-luggage",
            label: "Special Luggage",
            href: "/special-luggage",
            icon: Bicycle,
          },
        ],
      },
    ],
  },
  {
    id: "help-center",
    label: "Help Center",
    icon: Support,
    submenu: true,
    groups: [
      {
        id: "help-center-group",
        items: [
          {
            id: "tickets",
            label: "Tickets",
            href: "/help-center",
            icon: Blog,
          },
        ],
      },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: Device,
    submenu: true,
    groups: [
      {
        id: "settings-group",
        items: [
          {
            id: "profile-settings",
            label: "Profile Settings",
            href: "/profile-setting",
            icon: User,
          },
          {
            id: "platform-settings",
            label: "Platform Settings",
            href: "/platform-settings",
            icon: Device,
          },
        ],
      },
    ],
  },
];
