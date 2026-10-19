"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@usa-limousine-corporation/ui/components/card";
import { Dashboard } from "@usa-limousine-corporation/ui/svg";
import React from "react";
import type { Driver } from "@/lib/types/drivers";

export interface ServicesCardProps {
  driver?: Driver | null | undefined;
}

export function ServicesCard({ driver }: ServicesCardProps) {
  const services = driver?.services || [];

  if (services.length === 0) {
    return null;
  }

  return (
    <Card className="h-fit w-full shadow-xs border border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 -ml-2">
          <Dashboard className="h-6 w-6 text-primary" />
          <CardTitle className="text-lg font-semibold text-default-900">Services</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-4">
        <div className="flex flex-wrap gap-3">
          {services.map((service: string, index: number) => (
            <span
              key={index}
              className="inline-flex items-center rounded-full bg-default-100 px-4 py-1.5 text-[15px] font-medium text-default-700 capitalize"
            >
              {service}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
