"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Form } from "@usa-limousine-corporation/ui/components/form";
import { Input } from "@usa-limousine-corporation/ui/components/input";
import { ANALYTICS_RANGE_OPTIONS } from "@/lib/analytics-range";
import type { AnalyticsRange } from "@/lib/types/dashboard";

type Values = { range: string };

export function AnalyticsRangeSelect(props: {
  value: AnalyticsRange;
  onChange: (range: AnalyticsRange) => void;
  className?: string;
}) {
  const form = useForm<Values>({ defaultValues: { range: props.value } });
  const watched = useWatch({ control: form.control, name: "range" });

  useEffect(() => {
    form.setValue("range", props.value);
  }, [form, props.value]);

  useEffect(() => {
    if (!watched || watched === props.value) return;
    props.onChange(watched as AnalyticsRange);
  }, [props, watched]);

  return (
    <Form {...form}>
      <Input
        name="range"
        type="select"
        options={ANALYTICS_RANGE_OPTIONS}
        className={props.className ?? "w-40"}
        inputClassName="h-9 bg-card"
      />
    </Form>
  );
}
