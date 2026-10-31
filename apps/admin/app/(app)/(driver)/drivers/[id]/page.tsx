"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { Badge } from "@usa-limousine-corporation/ui/components/badge";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Card, CardContent } from "@usa-limousine-corporation/ui/components/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@usa-limousine-corporation/ui/components/select";
import { Skeleton } from "@usa-limousine-corporation/ui/components/skeleton";
import { DataTable } from "@usa-limousine-corporation/ui/components/data-table/data-table";
import {
  Analytics,
  type OverviewStat,
} from "@usa-limousine-corporation/ui/components/dashboard/analytics";
import { Breadcrumbs } from "@usa-limousine-corporation/ui/layout/breadcrumbs";
import { CoverHeader } from "@usa-limousine-corporation/ui/components/profile/cover-header";
import { BOOKING_STATUS_LABELS } from "@usa-limousine-corporation/ui/components/bookings/labels";
import { cn } from "@usa-limousine-corporation/ui/utils/cn";
import { formatDate } from "@usa-limousine-corporation/ui/utils/date";
import {
  Calendar,
  Car,
  Hash,
  Mail,
  Pencil,
  Phone,
  User,
  UserSign,
} from "@usa-limousine-corporation/ui/svg";
import { getColumns } from "@/components/columns/driver-booking-columns";
import { DRIVER_STATUS_LABELS, driverName } from "@/components/columns/driver-columns";
import { DriverModal } from "@/components/modals/driver-modal";
import { PeriodSelect } from "@/components/period-select";
import { STATS_PERIODS } from "@/config/periods";
import { useDriver, useDriverBookings, useDriverStats } from "@/hooks/queries/use-drivers";
import type { BookingStatus } from "@/lib/types/bookings";
import type { StatsPeriod } from "@/lib/types/drivers";

const BOOKING_FILTERS: { value: BookingStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All rides" },
  { value: "CONFIRMED", label: BOOKING_STATUS_LABELS.CONFIRMED },
  { value: "PENDING", label: BOOKING_STATUS_LABELS.PENDING },
  { value: "COMPLETED", label: BOOKING_STATUS_LABELS.COMPLETED },
  { value: "CANCELLED", label: BOOKING_STATUS_LABELS.CANCELLED },
];

function InfoItem(props: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <li className="flex items-center gap-3 rounded-lg bg-default-50 px-3 py-2.5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        {props.icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-default-500">
          {props.label}
        </p>
        <div className="truncate text-sm font-medium text-default-900">{props.children}</div>
      </div>
    </li>
  );
}

export default function DriverDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: driver, isLoading, isError } = useDriver(params.id);
  const [period, setPeriod] = useState<StatsPeriod>("monthly");
  const [bookingStatus, setBookingStatus] = useState<BookingStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editOpen, setEditOpen] = useState(false);

  const stats = useDriverStats(params.id, period);
  const bookings = useDriverBookings(params.id, {
    page,
    limit: pageSize,
    bookingStatus: bookingStatus === "ALL" ? undefined : bookingStatus,
  });
  const columns = useMemo(() => getColumns(), []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-60 w-full" />
        <div className="grid grid-cols-12 gap-6">
          <Skeleton className="col-span-12 h-96 xl:col-span-4" />
          <Skeleton className="col-span-12 h-96 xl:col-span-8" />
        </div>
      </div>
    );
  }

  if (isError || !driver) {
    return (
      <Card className="shadow-xs">
        <CardContent className="p-8 text-center">
          <p className="text-sm text-default-600">This driver could not be found.</p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href="/drivers">Back to drivers</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const name = driverName(driver);
  const data = stats.data;
  const selectedPeriod = STATS_PERIODS.find((item) => item.value === period);
  const empty = (data?.labels ?? []).map(() => 0);

  const overview: OverviewStat[] = [
    {
      key: "earnings",
      label: "Driver Earnings",
      color: "primary",
      chartColor: "#C9A84C",
      kind: "currency",
      total: data?.totalEarnings ?? 0,
      monthly: data?.earnings ?? empty,
    },
    {
      key: "rides",
      label: "Rides",
      color: "success",
      chartColor: "#22c55e",
      kind: "count",
      total: data?.totalRides ?? 0,
      monthly: data?.rides ?? empty,
    },
    {
      key: "commission",
      label: "Admin Commission",
      color: "info",
      chartColor: "#06b6d4",
      kind: "currency",
      total: data?.totalCommission ?? 0,
      monthly: data?.commission ?? empty,
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/analytics" },
          { label: "Drivers", href: "/drivers" },
          { label: name },
        ]}
      />

      <CoverHeader
        name={name}
        email={driver.user.email}
        avatar={driver.user.avatar}
        aside={
          <>
            <Badge color={driver.status === "ACTIVE" ? "success" : "destructive"} variant="soft">
              {DRIVER_STATUS_LABELS[driver.status]}
            </Badge>
            <Button size="sm" variant="outline" className="gap-2" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-12 items-stretch gap-6">
        <div className="col-span-12 xl:col-span-4">
          <Card className="h-full shadow-xs">
            <CardContent className="p-6">
              <h2 className="text-base font-semibold text-default-900">Driver Information</h2>
              <ul className="mt-5 space-y-2.5">
                <InfoItem icon={<User className="h-5 w-5" />} label="Name">
                  {name}
                </InfoItem>
                <InfoItem icon={<Mail className="h-5 w-5" />} label="Email">
                  {driver.user.email}
                </InfoItem>
                <InfoItem icon={<Phone className="h-5 w-5" />} label="Phone number">
                  {driver.user.phone || "—"}
                </InfoItem>
                <InfoItem icon={<Car className="h-5 w-5" />} label="Vehicle category">
                  {driver.vehicleCategory.name}
                </InfoItem>
                <InfoItem icon={<Hash className="h-5 w-5" />} label="License number">
                  {driver.licenseNumber || "—"}
                </InfoItem>
                <InfoItem icon={<UserSign className="h-5 w-5" />} label="Status">
                  <span
                    className={cn(driver.status === "ACTIVE" ? "text-success" : "text-destructive")}
                  >
                    {DRIVER_STATUS_LABELS[driver.status]}
                  </span>
                </InfoItem>
                <InfoItem icon={<Calendar className="h-5 w-5" />} label="Joined">
                  {formatDate({ date: driver.createdAt })}
                </InfoItem>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-12 xl:col-span-8">
          <Analytics
            key={period}
            title="Driver Stats"
            description={`${data?.totalRides ?? 0} rides · ${driver._count.assignments} assigned all time`}
            stats={overview}
            year={Number(formatDate({ date: new Date(), as: "value" }).slice(0, 4))}
            categories={data?.labels ?? []}
            chartDescription={selectedPeriod?.description}
            isLoading={stats.isLoading}
            actions={<PeriodSelect value={period} onChange={setPeriod} />}
          />
        </div>
      </div>

      <Card className="shadow-xs">
        <CardContent className="p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-default-900">Assigned Rides</h2>
            <Select
              value={bookingStatus}
              onValueChange={(value) => {
                setBookingStatus(value as BookingStatus | "ALL");
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-40" aria-label="Ride status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BOOKING_FILTERS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DataTable
            columns={columns}
            data={bookings.data?.data ?? []}
            manualFiltering={true}
            loading={bookings.isLoading}
            fetching={bookings.isFetching}
            pagination={{
              page,
              pageSize,
              total: bookings.data?.total ?? 0,
              totalPages: bookings.data?.pages ?? 1,
            }}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </CardContent>
      </Card>

      <DriverModal open={editOpen} onOpenChange={setEditOpen} initialData={driver} />
    </div>
  );
}
