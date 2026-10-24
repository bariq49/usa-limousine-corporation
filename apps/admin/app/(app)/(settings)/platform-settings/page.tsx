"use client";

import { useEffect, type ComponentType, type ReactNode, type SVGProps } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Breadcrumbs } from "@usa-limousine-corporation/ui/layout/breadcrumbs";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@usa-limousine-corporation/ui/components/card";
import { Form } from "@usa-limousine-corporation/ui/components/form";
import { Input, type InputOption } from "@usa-limousine-corporation/ui/components/input";
import { LayoutLoader } from "@usa-limousine-corporation/ui/layout/layout-loader";
import { APP_CURRENCY } from "@usa-limousine-corporation/ui/constants";
import { Clock, DollarSign, Percent, SlidersHorizontal } from "@usa-limousine-corporation/ui/svg";
import {
  usePlatformSettings,
  useUpdatePlatformSettings,
} from "@/hooks/queries/use-platform-settings";
import { platformSettingsSchema, type Schema as FormValues } from "@/lib/schemas/platform-settings";
import type { PlatformSettings } from "@/lib/types/platform-settings";

const crumbs = [
  { label: "Home", href: "/analytics" },
  { label: "Settings" },
  { label: "Platform Settings" },
];

const noticeUnitOptions: InputOption[] = [
  { label: "Hours", value: "HOUR" },
  { label: "Minutes", value: "MINUTE" },
];

const defaultValues: FormValues = {
  livePaymentMode: false,
  fuelSurchargeRate: 0,
  gratuityRate: 0,
  taxRate: 0,
  transactionFeeRate: 0,
  oneWayDiscountRate: 0,
  returnDiscountRate: 0,
  airportPickupFee: 0,
  stopFee: 0,
  meetAndGreetFee: 0,
  minBookingNotice: 0,
  minBookingNoticeUnit: "HOUR",
  cancellationNotice: 0,
  cancellationNoticeUnit: "HOUR",
  cancellationRefundRate: 0,
};

function toFormValues(settings: PlatformSettings): FormValues {
  return {
    livePaymentMode: settings.paymentMode === "LIVE",
    fuelSurchargeRate: settings.fuelSurchargeRate,
    gratuityRate: settings.gratuityRate,
    taxRate: settings.taxRate,
    transactionFeeRate: settings.transactionFeeRate,
    oneWayDiscountRate: settings.oneWayDiscountRate,
    returnDiscountRate: settings.returnDiscountRate,
    airportPickupFee: settings.airportPickupFee,
    stopFee: settings.stopFee,
    meetAndGreetFee: settings.meetAndGreetFee,
    minBookingNotice: settings.minBookingNotice,
    minBookingNoticeUnit: settings.minBookingNoticeUnit,
    cancellationNotice: settings.cancellationNotice,
    cancellationNoticeUnit: settings.cancellationNoticeUnit,
    cancellationRefundRate: settings.cancellationRefundRate,
  };
}

/** Section heading with an icon tile, followed by a bordered list of setting rows. */
function SettingsSection(props: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  children: ReactNode;
}) {
  const Icon = props.icon;
  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-default-50">
          <Icon className="h-4 w-4 text-default-600" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-default-900">{props.title}</h2>
          <p className="text-xs text-default-500">{props.description}</p>
        </div>
      </div>
      <div className="divide-y divide-border overflow-hidden rounded-md border border-border">
        {props.children}
      </div>
    </div>
  );
}

/** One setting: label and help text on the left, its control on the right. */
function SettingRow(props: { label: string; description: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div>
        <p className="text-sm font-medium text-default-900">{props.label}</p>
        <p className="mt-0.5 text-xs text-default-500">{props.description}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">{props.children}</div>
    </div>
  );
}

export default function PlatformSettingsPage() {
  const { data: settings, isLoading, isError } = usePlatformSettings();
  const updateMutation = useUpdatePlatformSettings();
  const isPending = updateMutation.isPending;
  const disabled = isError || isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(platformSettingsSchema),
    mode: "onChange",
    defaultValues,
  });

  useEffect(() => {
    if (settings) {
      form.reset(toFormValues(settings));
    }
  }, [settings, form]);

  const onSubmit = (values: FormValues) => {
    updateMutation.mutate({
      paymentMode: values.livePaymentMode ? "LIVE" : "TEST",
      fuelSurchargeRate: values.fuelSurchargeRate,
      gratuityRate: values.gratuityRate,
      taxRate: values.taxRate,
      transactionFeeRate: values.transactionFeeRate,
      oneWayDiscountRate: values.oneWayDiscountRate,
      returnDiscountRate: values.returnDiscountRate,
      airportPickupFee: values.airportPickupFee,
      stopFee: values.stopFee,
      meetAndGreetFee: values.meetAndGreetFee,
      minBookingNotice: values.minBookingNotice,
      minBookingNoticeUnit: values.minBookingNoticeUnit,
      cancellationNotice: values.cancellationNotice,
      cancellationNoticeUnit: values.cancellationNoticeUnit,
      cancellationRefundRate: values.cancellationRefundRate,
    });
  };

  const handleCancel = () => {
    form.reset(settings ? toFormValues(settings) : defaultValues);
  };

  if (isLoading) {
    return <LayoutLoader />;
  }

  const numberInput = (name: keyof FormValues) => (
    <div className="w-32">
      <Input name={name} type="number" step="0.01" placeholder="0" disabled={disabled} />
    </div>
  );

  return (
    <div className="space-y-4">
      <Breadcrumbs items={crumbs} />

      <Card className="overflow-hidden shadow-xs">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader className="mb-0 flex flex-col gap-4 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-default-900">
                  Platform Settings
                </CardTitle>
                <p className="mt-1 text-xs text-default-500">
                  Configure payments, trip pricing and booking rules for the whole platform.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isPending || !form.formState.isDirty}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  isLoading={isPending}
                  loadingText="Saving..."
                  disabled={isError || !form.formState.isDirty}
                >
                  Save changes
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 p-5">
              <SettingsSection
                icon={SlidersHorizontal}
                title="Payment Environment"
                description="Manage the active payment environment mode."
              >
                <SettingRow
                  label="Live Payment Mode"
                  description="Process real payments. Turn off to keep payments in test mode."
                >
                  <Input name="livePaymentMode" type="switch" switchSize="md" disabled={disabled} />
                </SettingRow>
              </SettingsSection>

              <SettingsSection
                icon={Percent}
                title="Fuel Surcharge, Gratuity, Tax, Discount & Transaction Fee"
                description="Percentage rates applied to the base fare of every booking."
              >
                <SettingRow
                  label="Fuel Surcharge (%)"
                  description="Fuel surcharge percentage applied to all bookings."
                >
                  {numberInput("fuelSurchargeRate")}
                </SettingRow>
                <SettingRow
                  label="Mandatory Gratuity (%)"
                  description="Mandatory gratuity percentage added to the service total."
                >
                  {numberInput("gratuityRate")}
                </SettingRow>
                <SettingRow
                  label="Tax (%)"
                  description="Sales tax percentage applied to all bookings."
                >
                  {numberInput("taxRate")}
                </SettingRow>
                <SettingRow
                  label="One Way Discount (%)"
                  description="Discount percentage applied to the one-way trip fare."
                >
                  {numberInput("oneWayDiscountRate")}
                </SettingRow>
                <SettingRow
                  label="Return Discount (%)"
                  description="Discount percentage applied to the return trip fare."
                >
                  {numberInput("returnDiscountRate")}
                </SettingRow>
                <SettingRow
                  label="Transaction Fee (%)"
                  description="Transaction fee percentage applied to all bookings."
                >
                  {numberInput("transactionFeeRate")}
                </SettingRow>
              </SettingsSection>

              <SettingsSection
                icon={DollarSign}
                title="Trip & Extra Fees"
                description={`Fixed amounts in ${APP_CURRENCY} for trip options.`}
              >
                <SettingRow
                  label="Extra Stop Fee"
                  description="Fixed fee charged per additional stop on a booking."
                >
                  {numberInput("stopFee")}
                </SettingRow>
                <SettingRow
                  label="Meet & Greet Fee"
                  description="Fixed fee charged per leg for airport meet and greet service."
                >
                  {numberInput("meetAndGreetFee")}
                </SettingRow>
                <SettingRow
                  label="Airport Pickup Fee"
                  description="Fixed fee charged per leg for trips to or from an airport."
                >
                  {numberInput("airportPickupFee")}
                </SettingRow>
              </SettingsSection>

              <SettingsSection
                icon={Clock}
                title="Advance Booking Notice"
                description="Set lead time rules for ride reservations."
              >
                <SettingRow
                  label="Minimum Advance Booking Notice"
                  description="Minimum lead time required before pickup time (0 for no restriction)."
                >
                  <div className="w-28">
                    <Input
                      name="minBookingNotice"
                      type="number"
                      placeholder="0"
                      disabled={disabled}
                    />
                  </div>
                  <div className="w-32">
                    <Input
                      name="minBookingNoticeUnit"
                      type="select"
                      options={noticeUnitOptions}
                      disabled={disabled}
                    />
                  </div>
                </SettingRow>
              </SettingsSection>

              <SettingsSection
                icon={Clock}
                title="Cancellation & Refunds"
                description="Rules for customers cancelling their own bookings."
              >
                <SettingRow
                  label="Cancellation Notice"
                  description="Customers cannot cancel within this time before pickup (0 for no restriction)."
                >
                  <div className="w-28">
                    <Input
                      name="cancellationNotice"
                      type="number"
                      placeholder="0"
                      disabled={disabled}
                    />
                  </div>
                  <div className="w-32">
                    <Input
                      name="cancellationNoticeUnit"
                      type="select"
                      options={noticeUnitOptions}
                      disabled={disabled}
                    />
                  </div>
                </SettingRow>
                <SettingRow
                  label="Cancellation Refund (%)"
                  description="Percentage of the paid amount refunded to the card when a customer cancels."
                >
                  {numberInput("cancellationRefundRate")}
                </SettingRow>
              </SettingsSection>

              {isError ? (
                <p className="text-sm text-destructive">
                  Failed to load settings. Please try again.
                </p>
              ) : null}
            </CardContent>
          </form>
        </Form>
      </Card>
    </div>
  );
}
