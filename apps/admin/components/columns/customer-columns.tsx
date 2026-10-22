"use client";

import type {
  ColumnDef,
  DataTableFilterColumn,
} from "@usa-limousine-corporation/ui/data-table/data-table";
import { DataTableColumnHeader } from "@usa-limousine-corporation/ui/data-table/data-table-column-header";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@usa-limousine-corporation/ui/components/avatar";
import { Badge } from "@usa-limousine-corporation/ui/components/badge";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { formatDate } from "@usa-limousine-corporation/ui/utils/date";
import { Eye } from "lucide-react";
import Link from "next/link";
import type { Customer, CustomerType } from "@/lib/types/customers";

export const CUSTOMER_TYPE_LABELS: Record<CustomerType, string> = {
  NORMAL: "Normal",
  VIP: "VIP",
  CORPORATE: "Corporate",
};

export function customerName(customer: Pick<Customer, "user">) {
  const name = [customer.user.firstName, customer.user.lastName].filter(Boolean).join(" ").trim();
  return name || customer.user.email;
}

export const getColumns = (options?: {
  onView?: (item: Customer) => void;
}): ColumnDef<Customer>[] => [
  {
    id: "Customer",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
    cell: ({ row }) => {
      const item = row.original;
      const name = customerName(item);
      return (
        <Link href={`/customers/${item.id}`} className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            {item.user.avatar ? <AvatarImage src={item.user.avatar} alt={name} /> : null}
            <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
              {(name[0] ?? "?").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium text-default-900 hover:text-primary">
              {name}
            </span>
            <span className="truncate text-xs text-default-500">{item.user.email}</span>
          </div>
        </Link>
      );
    },
    enableSorting: false,
  },
  {
    id: "Phone",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Phone" />,
    cell: ({ row }) => (
      <span className="text-sm text-default-700">{row.original.user.phone || "—"}</span>
    ),
    enableSorting: false,
  },
  {
    id: "Type",
    accessorKey: "type",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
    cell: ({ row }) => (
      <Badge color={row.original.type === "NORMAL" ? "secondary" : "default"} variant="soft">
        {CUSTOMER_TYPE_LABELS[row.original.type]}
      </Badge>
    ),
  },
  {
    id: "Bookings",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Bookings" />,
    cell: ({ row }) => (
      <span className="text-sm text-default-900">{row.original.user._count.bookings}</span>
    ),
    enableSorting: false,
  },
  {
    id: "Tickets",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tickets" />,
    cell: ({ row }) => (
      <span className="text-sm text-default-900">{row.original._count.helpTickets}</span>
    ),
    enableSorting: false,
  },
  {
    id: "Status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const user = row.original.user;
      if (!user.isActive) {
        return (
          <Badge color="destructive" variant="soft">
            Inactive
          </Badge>
        );
      }
      return user.isEmailVerified ? (
        <Badge color="success" variant="soft">
          Active
        </Badge>
      ) : (
        <Badge color="warning" variant="soft">
          Unverified
        </Badge>
      );
    },
    enableSorting: false,
  },
  {
    id: "Joined",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Joined" />,
    cell: ({ row }) => (
      <span className="text-sm text-default-700">
        {formatDate({ date: row.original.createdAt })}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-default-500 hover:bg-muted hover:text-default-900"
          onClick={() => options?.onView?.(row.original)}
          title="View customer"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];

export const filter: DataTableFilterColumn[] = [
  {
    column: "Type",
    title: "Type",
    multiple: false,
    options: (Object.keys(CUSTOMER_TYPE_LABELS) as CustomerType[]).map((value) => ({
      value,
      label: CUSTOMER_TYPE_LABELS[value],
    })),
  },
];
