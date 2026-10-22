"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import type { ReactNode } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@usa-limousine-corporation/ui/components/avatar";
import { Badge } from "@usa-limousine-corporation/ui/components/badge";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Card, CardContent } from "@usa-limousine-corporation/ui/components/card";
import { Skeleton } from "@usa-limousine-corporation/ui/components/skeleton";
import { Breadcrumbs } from "@usa-limousine-corporation/ui/layout/breadcrumbs";
import { formatDate } from "@usa-limousine-corporation/ui/utils/date";
import { formatPrice } from "@usa-limousine-corporation/ui/utils/price";
import { CUSTOMER_TYPE_LABELS, customerName } from "@/components/columns/customer-columns";
import { useCustomer } from "@/hooks/queries/use-customers";
import { STATUS_LABELS as TICKET_STATUS_LABELS, statusBadgeColor } from "@/lib/utils/ticket-labels";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <span className="text-default-500">{label}</span>
      <span className="text-right font-medium text-default-900">{children}</span>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="py-6 text-center text-sm text-default-500">{text}</p>;
}

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: customer, isLoading, isError } = useCustomer(params.id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
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

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/analytics" },
          { label: "Customers", href: "/customers" },
          { label: name },
        ]}
      />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4">
          <Card className="shadow-xs">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-20 w-20">
                  {user.avatar ? <AvatarImage src={user.avatar} alt={name} /> : null}
                  <AvatarFallback className="bg-primary/10 text-2xl font-semibold text-primary">
                    {(name[0] ?? "?").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h1 className="mt-3 text-lg font-bold text-default-900">{name}</h1>
                <p className="text-sm text-default-500">{user.email}</p>
                <div className="mt-2 flex gap-2">
                  <Badge
                    color={customer.type === "NORMAL" ? "secondary" : "default"}
                    variant="soft"
                  >
                    {CUSTOMER_TYPE_LABELS[customer.type]}
                  </Badge>
                  {user.isActive ? (
                    <Badge color="success" variant="soft">
                      Active
                    </Badge>
                  ) : (
                    <Badge color="destructive" variant="soft">
                      Inactive
                    </Badge>
                  )}
                </div>
              </div>

              <div className="mt-6 divide-y divide-border border-t border-border">
                <Row label="Phone">{user.phone || "—"}</Row>
                <Row label="Email verified">{user.isEmailVerified ? "Yes" : "No"}</Row>
                <Row label="Customer since">{formatDate({ date: customer.createdAt })}</Row>
                <Row label="Bookings">{user._count.bookings}</Row>
                <Row label="Support tickets">{customer._count.helpTickets}</Row>
                <Row label="Email updates">{customer.settings?.email === false ? "Off" : "On"}</Row>
                <Row label="Dashboard notifications">
                  {customer.settings?.notification === false ? "Off" : "On"}
                </Row>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-12 space-y-6 lg:col-span-8">
          <Card className="shadow-xs">
            <CardContent className="p-6">
              <h2 className="text-base font-semibold text-default-900">Recent bookings</h2>
              {user.bookings.length === 0 ? (
                <Empty text="No bookings yet." />
              ) : (
                <ul className="mt-3 divide-y divide-border">
                  {user.bookings.map((booking) => (
                    <li key={booking.id}>
                      <Link
                        href={`/bookings/${booking.id}`}
                        className="flex items-center justify-between gap-4 py-3 hover:text-primary"
                      >
                        <div>
                          <p className="text-sm font-semibold">{booking.bookingNumber}</p>
                          <p className="text-xs text-default-500">
                            {formatDate({ date: booking.createdAt })}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-default-900">
                            {formatPrice({ price: booking.totalPrice })}
                          </span>
                          <Badge color="secondary" variant="soft">
                            {booking.status}
                          </Badge>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-xs">
            <CardContent className="p-6">
              <h2 className="text-base font-semibold text-default-900">Support tickets</h2>
              {customer.helpTickets.length === 0 ? (
                <Empty text="No support tickets." />
              ) : (
                <ul className="mt-3 divide-y divide-border">
                  {customer.helpTickets.map((ticket) => (
                    <li key={ticket.id}>
                      <Link
                        href={`/help-center/${ticket.id}`}
                        className="flex items-center justify-between gap-4 py-3 hover:text-primary"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{ticket.subject}</p>
                          <p className="text-xs text-default-500">
                            {ticket.ticketNumber} · {formatDate({ date: ticket.createdAt })}
                          </p>
                        </div>
                        <Badge color={statusBadgeColor(ticket.status)} variant="soft">
                          {TICKET_STATUS_LABELS[ticket.status]}
                        </Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
