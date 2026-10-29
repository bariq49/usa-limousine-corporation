"use client";

import { APP_TIMEZONE } from "@usa-limousine-corporation/ui/constants";
import { formatInTimeZone } from "date-fns-tz";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@usa-limousine-corporation/ui/components/avatar";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Card, CardContent } from "@usa-limousine-corporation/ui/components/card";
import { Skeleton } from "@usa-limousine-corporation/ui/components/skeleton";
import { DataTable } from "@usa-limousine-corporation/ui/data-table/data-table";
import { getColumns as getBookingColumns } from "@usa-limousine-corporation/ui/bookings/booking-columns";
import {
  BookingOverview,
  type OverviewStat,
} from "@usa-limousine-corporation/ui/dashboard/booking-overview";
import { Breadcrumbs } from "@usa-limousine-corporation/ui/layout/breadcrumbs";
import { CoverHeader } from "@usa-limousine-corporation/ui/profile/cover-header";
import { cn } from "@usa-limousine-corporation/ui/utils/cn";
import { formatDate } from "@usa-limousine-corporation/ui/utils/date";
import { Calendar, Mail, Phone, User, UserSign } from "@usa-limousine-corporation/ui/svg";
import { customerName } from "@/components/columns/customer-columns";
import { getColumns as getTicketColumns } from "@/components/columns/ticket-columns";
import { useBookingAnalytics, useBookings } from "@/hooks/queries/use-bookings";
import { useCustomer } from "@/hooks/queries/use-customers";
import { useTickets } from "@/hooks/queries/use-tickets";

const CURRENT_YEAR = Number(formatInTimeZone(new Date(), APP_TIMEZONE, "yyyy"));
const YEARS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2];
const EMPTY_MONTHS = Array<number>(12).fill(0);

/** One labelled value with a round icon, as on the driver profile card. */
function InfoItem(props: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <li className="flex items-center gap-3 rounded-lg bg-default-50 px-3 py-2.5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        {props.icon}
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-default-500">
          {props.label}
        </p>
        <div className="truncate text-sm font-medium text-default-900">{props.children}</div>
      </div>
    </li>
  );
}

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { data: customer, isLoading, isError } = useCustomer(params.id);
  const userId = customer?.user.id;

  const [year, setYear] = useState(CURRENT_YEAR);
  const [bookingPage, setBookingPage] = useState(1);
  const [bookingSize, setBookingSize] = useState(10);
  const [ticketPage, setTicketPage] = useState(1);
  const [ticketSize, setTicketSize] = useState(5);

  const analytics = useBookingAnalytics(year, userId, Boolean(userId));
  const bookings = useBookings({ userId, page: bookingPage, limit: bookingSize }, Boolean(userId));
  const tickets = useTickets({ customerId: params.id, page: ticketPage, limit: ticketSize });

  const bookingColumns = useMemo(() => getBookingColumns({ basePath: "/bookings" }), []);
  const ticketColumns = useMemo(
    () => getTicketColumns({ onView: (item) => router.push(`/help-center/${item.id}`) }),
    [router],
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-[240px] w-full" />
        <div className="grid grid-cols-12 gap-6">
          <Skeleton className="col-span-12 h-96 xl:col-span-4" />
          <Skeleton className="col-span-12 h-96 xl:col-span-8" />
        </div>
      </div>
    );
  }

  if (isError || !customer) {
    return (
      <Card className="shadow-xs">
        <CardContent className="p-8 text-center">
          <p className="text-sm text-default-600">This customer could not be found.</p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href="/customers">Back to customers</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const name = customerName(customer);
  const user = customer.user;
  const data = analytics.data;

  const stats: OverviewStat[] = [
    {
      key: "spent",
      label: "Total Spent",
      color: "primary",
      chartColor: "#C9A84C",
      kind: "currency",
      total: data?.totalRevenue ?? 0,
      monthly: data?.monthlyRevenue ?? EMPTY_MONTHS,
    },
    {
      key: "completed",
      label: "Completed Rides",
      color: "success",
      chartColor: "#22c55e",
      kind: "count",
      total: data?.completedBookings ?? 0,
      monthly: data?.monthlyBookings.completed ?? EMPTY_MONTHS,
    },
    {
      key: "upcoming",
      label: "Upcoming Rides",
      color: "info",
      chartColor: "#06b6d4",
      kind: "count",
      total: data?.confirmedBookings ?? 0,
      monthly: data?.monthlyBookings.confirmed ?? EMPTY_MONTHS,
    },
    {
      key: "cancelled",
      label: "Cancelled",
      color: "destructive",
      chartColor: "#ef4444",
      kind: "count",
      total: data?.cancelledBookings ?? 0,
      monthly: data?.monthlyBookings.cancelled ?? EMPTY_MONTHS,
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/analytics" },
          { label: "Customers", href: "/customers" },
          { label: name },
        ]}
      />

      <CoverHeader name={name} email={user.email} avatar={user.avatar} />

      <div className="grid grid-cols-12 items-stretch gap-6">
        <div className="col-span-12 xl:col-span-4">
          <Card className="h-full shadow-xs">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-20 w-20 border-2 border-border">
                  {user.avatar ? <AvatarImage src={user.avatar} alt={name} /> : null}
                  <AvatarFallback className="bg-primary/10 text-2xl font-semibold text-primary">
                    {(name[0] ?? "?").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h2 className="mt-3 text-lg font-bold text-default-900">{name}</h2>
                <p className="text-sm text-default-500">{user.email}</p>
              </div>

              <ul className="mt-5 space-y-2.5 border-t border-border pt-5">
                <InfoItem icon={<User className="h-5 w-5" />} label="Name">
                  {name}
                </InfoItem>
                <InfoItem icon={<Mail className="h-5 w-5" />} label="Email">
                  {user.email}
                </InfoItem>
                <InfoItem icon={<Phone className="h-5 w-5" />} label="Phone number">
                  {user.phone || "—"}
                </InfoItem>
                <InfoItem icon={<UserSign className="h-5 w-5" />} label="Status">
                  <span className={cn(user.isActive ? "text-success" : "text-destructive")}>
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                  {!user.isEmailVerified ? (
                    <span className="ml-2 text-xs text-warning">Email not verified</span>
                  ) : null}
                </InfoItem>
                <InfoItem icon={<Calendar className="h-5 w-5" />} label="Joined">
                  {formatDate({ date: customer.createdAt })}
                </InfoItem>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-12 xl:col-span-8">
          <BookingOverview
            title="Customer Stats"
            description={`${data?.totalBookings ?? 0} bookings in ${year} · ${user._count.bookings} all time · ${customer._count.helpTickets} support tickets`}
            stats={stats}
            year={year}
            years={YEARS}
            onYearChange={setYear}
            isLoading={analytics.isLoading}
          />
        </div>
      </div>

      <Card className="shadow-xs">
        <CardContent className="p-6">
          <h2 className="mb-5 text-base font-semibold text-default-900">Bookings</h2>
          <DataTable
            columns={bookingColumns}
            data={bookings.data?.data ?? []}
            manualFiltering={true}
            loading={bookings.isLoading}
            fetching={bookings.isFetching}
            pagination={{
              page: bookingPage,
              pageSize: bookingSize,
              total: bookings.data?.total ?? 0,
              totalPages: bookings.data?.pages ?? 1,
            }}
            onPageChange={setBookingPage}
            onPageSizeChange={setBookingSize}
          />
        </CardContent>
      </Card>

      <Card className="shadow-xs">
        <CardContent className="p-6">
          <h2 className="mb-5 text-base font-semibold text-default-900">Recent tickets</h2>
          <DataTable
            columns={ticketColumns}
            data={tickets.data?.data ?? []}
            manualFiltering={true}
            loading={tickets.isLoading}
            fetching={tickets.isFetching}
            pagination={{
              page: ticketPage,
              pageSize: ticketSize,
              total: tickets.data?.total ?? 0,
              totalPages: tickets.data?.pages ?? 1,
            }}
            onPageChange={setTicketPage}
            onPageSizeChange={setTicketSize}
          />
        </CardContent>
      </Card>
    </div>
  );
}
