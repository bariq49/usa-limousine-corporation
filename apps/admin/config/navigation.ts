import type { MenuSection } from "@usa-limousine-corporation/ui/types/navigation";
import {
  Dashboard,
  Calendar,
  CalendarCheck,
  Car,
  Card,
  Grid,
  Luggage,
  Device,
  User,
  Graph,
  CalendarClock,
  CalendarCheck2,
  CalendarCross,
  ShieldCheck,
  Tag,
  Support,
  UserList,
  Users,
  UserSign,
  Blog,
  FileText,
  MessageSquare,
  Plus,
  DollarSign,
  Refresh,
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
          {
            id: "booking-analytics",
            label: "Booking Analytics",
            href: "/booking-analytics",
            icon: Calendar,
          },
          {
            id: "user-analytics",
            label: "User Analytics",
            href: "/user-analytics",
            icon: Users,
          },
          {
            id: "driver-analytics",
            label: "Driver Analytics",
            href: "/driver-analytics",
            icon: UserSign,
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
            id: "all-bookings",
            label: "All Bookings",
            href: "/bookings",
            icon: Calendar,
          },
          {
            id: "scheduled-bookings",
            label: "Scheduled Bookings",
            href: "/scheduled-bookings",
            icon: CalendarClock,
          },
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
    id: "payment",
    label: "Payment",
    icon: Card,
    submenu: true,
    groups: [
      {
        id: "payment-group",
        items: [
          {
            id: "all-payments",
            label: "Payment History",
            href: "/payments",
            icon: DollarSign,
          },
          {
            id: "refunds",
            label: "Refunds",
            href: "/refunds",
            icon: Refresh,
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
        ],
      },
    ],
  },
  {
    id: "customer",
    label: "Customer",
    icon: Users,
    submenu: true,
    groups: [
      {
        id: "customer-group",
        items: [
          {
            id: "customers",
            label: "Customers",
            href: "/customers",
            icon: UserList,
          },
        ],
      },
    ],
  },
  {
    id: "driver",
    label: "Driver",
    icon: UserSign,
    submenu: true,
    groups: [
      {
        id: "driver-group",
        items: [
          {
            id: "drivers",
            label: "Drivers",
            href: "/drivers",
            icon: Users,
          },
        ],
      },
    ],
  },
  {
    id: "blog",
    label: "Blog",
    icon: Blog,
    submenu: true,
    groups: [
      {
        id: "blog-group",
        items: [
          { id: "all-blogs", label: "All Articles", href: "/blogs", icon: Blog },
          { id: "create-blog", label: "New Article", href: "/blogs/create", icon: Plus },
          { id: "draft-blogs", label: "Drafts", href: "/blogs/drafts", icon: FileText },
          {
            id: "scheduled-blogs",
            label: "Scheduled",
            href: "/blogs/scheduled",
            icon: CalendarClock,
          },
          { id: "blog-categories", label: "Categories", href: "/blog-categories", icon: Grid },
          { id: "blog-tags", label: "Tags", href: "/blog-tags", icon: Tag },
          { id: "blog-comments", label: "Comments", href: "/blog-comments", icon: MessageSquare },
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
            icon: Tag,
          },
          {
            id: "help-center",
            label: "Help Center",
            href: "/help-center",
            icon: Support,
          },
        ],
      },
    ],
  },
];
