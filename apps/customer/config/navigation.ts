import type { MenuSection } from "@usa-limousine-corporation/ui/types/navigation";
import {
  Bell,
  Calendar,
  CalendarCheck,
  CalendarCheck2,
  CalendarClock,
  CalendarCross,
  Dashboard,
  Device,
  Graph,
  Support,
  User,
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
        items: [{ id: "dashboard", label: "Dashboard", href: "/dashboard", icon: Graph }, {
            id: "booking-calendar",
            label: "Calendar",
            href: "/calendar",
            icon: CalendarClock,
          },],
        
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
          { id: "all-bookings", label: "All Bookings", href: "/bookings", icon: Calendar },
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
    id: "settings",
    label: "Settings",
    icon: Device,
    submenu: true,
    groups: [
      {
        id: "settings-group",
        items: [
          {
            id: "profile-setting",
            label: "Profile Settings",
            href: "/profile-setting",
            icon: User,
          },
          { id: "notifications", label: "Notifications", href: "/notifications", icon: Bell },
          { id: "help-center", label: "Help Center", href: "/help-center", icon: Support },
        ],
      },
    ],
  },
];
