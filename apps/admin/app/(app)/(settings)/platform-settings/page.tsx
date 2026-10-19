"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Globe, Graph, Map, ShieldCheck } from "@usa-limousine-corporation/ui/svg";
import toast from "react-hot-toast";
import { Breadcrumbs } from "@usa-limousine-corporation/ui/layout/breadcrumbs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@usa-limousine-corporation/ui/components/card";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Form } from "@usa-limousine-corporation/ui/components/form";
import { Switch } from "@usa-limousine-corporation/ui/components/switch";
import { APP_CURRENCY } from "@usa-limousine-corporation/ui/constants";
import { formatDateTime, formatRelativeTime } from "@usa-limousine-corporation/ui/utils/date";
import { SettingsNumberRow } from "@/components/settings/settings-number-row";
import { SettingsSkeleton } from "@/components/skeletons/settings-skeleton";
import { usePlatformSettings, useUpdatePlatformSettings } from "@/hooks/queries/use-settings";
import { settingsSchema, type Schema } from "@/lib/schemas/settings";

const defaultValues: Schema = {
  paymentMode: "TEST",
  payoutMin: 0,
  payoutIntervalDays: 0,
  requireSubscription: false,
  offerRadius: 0,
  offerExpandStep: 0,
  offerExpandMax: 0,
  offerGeoMatchCount: 0,
  offerMaxPerBooking: 0,
  offerMaxQuotesPerDriver: 0,
  offerTtlMin: 0,
  offerSessionTtlMin: 0,
  offerQuoteMinFactor: 0,
  offerQuoteMaxFactor: 0,
  paymentTimeoutMin: 15,
  cancelRefundBeforeStartPercent: 100,
  cancelRefundAfterStartPercent: 50,
  driverCancelRefundPercent: 100,
  driverCancelReseek: false,
  pickupFreeWaitMin: 10,
  noShowRefundPercent: 0,
};

export default function PlatformSettingsPage() {
  const { data: settings, isLoading, isError, refetch } = usePlatformSettings();
  const updateSettings = useUpdatePlatformSettings();

  const form = useForm<Schema>({
    resolver: zodResolver(settingsSchema),
    mode: "onChange",
    defaultValues,
  });

  useEffect(() => {
    if (!settings) return;
    const { updatedAt: _updatedAt, ...values } = settings;
    form.reset(values);
  }, [form, settings]);

  const handleCancel = () => {
    if (!settings) {
      form.reset(defaultValues);
      return;
    }
    const { updatedAt: _updatedAt, ...values } = settings;
    form.reset(values);
    toast.success("Settings reset to current values");
  };

  const onSubmit = async (values: Schema) => {
    await updateSettings.mutateAsync(values);
  };

  if (isLoading) {
    return <SettingsSkeleton />;
  }

  const paymentMode = form.watch("paymentMode");
  const isLive = paymentMode === "LIVE";
  const requireSubscription = form.watch("requireSubscription");
  const disabled = isError || updateSettings.isPending;

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/analytics" },
          { label: "Settings" },
          { label: "Platform Settings" },
        ]}
      />

      <Card className="rounded-md border border-border shadow-xs bg-card">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader className="mb-0 flex flex-row items-center justify-between gap-4 border-b border-border px-5 py-4">
              <div>
                <CardTitle className="text-lg font-semibold text-default-900">
                  Platform Settings
                </CardTitle>
                <p className="mt-1 text-xs text-default-500">
                  Global controls for payments, payouts, dispatch, and the offer marketplace.
                  Changes apply platform-wide after you save.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={updateSettings.isPending || !form.formState.isDirty}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isError || updateSettings.isPending || !form.formState.isDirty}
                >
                  {updateSettings.isPending ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 p-5">
              <div>
                <div className="mb-3 flex items-center gap-3">
                  <Globe className="h-7 w-7 text-default-600 shrink-0" />
                  <div>
                    <h2 className="text-sm font-semibold text-default-900">Payment Environment</h2>
                    <p className="text-xs text-default-500">
                      Choose whether Stripe charges real cards (live) or uses test keys for staging.
                    </p>
                  </div>
                </div>

                <div className="overflow-hidden rounded-md border border-border">
                  <div className="flex items-center justify-between gap-4 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-default-900">Live Payment Mode</p>
                      <p className="mt-0.5 text-xs text-default-500">
                        When on, checkout uses Stripe live keys and real money moves. When off, the
                        platform stays in TEST mode — use only for QA and demos.
                      </p>
                    </div>
                    <Switch
                      checked={isLive}
                      onCheckedChange={(checked) =>
                        form.setValue("paymentMode", checked ? "LIVE" : "TEST", {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      size="md"
                      disabled={disabled}
                      className="shrink-0"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center gap-3">
                  <Graph className="h-7 w-7 text-default-600 shrink-0" />
                  <div>
                    <h2 className="text-sm font-semibold text-default-900">Payout Configuration</h2>
                    <p className="text-xs text-default-500">
                      Control when drivers and agencies can cash out wallet balances, and how often.
                    </p>
                  </div>
                </div>

                <div className="overflow-hidden rounded-md border border-border divide-y divide-border">
                  <SettingsNumberRow
                    name="payoutMin"
                    label={`Minimum Payout Amount (${APP_CURRENCY})`}
                    hint="Wallet balance must reach at least this amount before a payout request is allowed. Lower values make cash-out easier; higher values reduce tiny transfers."
                    step="0.01"
                    min="0"
                    placeholder="0"
                    disabled={disabled}
                  />
                  <SettingsNumberRow
                    name="payoutIntervalDays"
                    label="Payout Interval (Days)"
                    hint="Minimum days between payout requests for the same recipient. Prevents rapid back-to-back withdrawals after a successful payout."
                    min="0"
                    placeholder="0"
                    disabled={disabled}
                  />
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center gap-3">
                  <ShieldCheck className="h-7 w-7 text-default-600 shrink-0" />
                  <div>
                    <h2 className="text-sm font-semibold text-default-900">
                      Dispatch &amp; Subscription Policies
                    </h2>
                    <p className="text-xs text-default-500">
                      Rules for who can take paid bookings on the classic available-feed, and how
                      long those bookings stay open.
                    </p>
                  </div>
                </div>

                <div className="overflow-hidden rounded-md border border-border divide-y divide-border">
                  <div className="flex items-center justify-between gap-4 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-default-900">
                        Require Driver Subscription
                      </p>
                      <p className="mt-0.5 text-xs text-default-500">
                        When enabled, drivers need an active subscription in good standing before
                        they can accept trips. Turn off to allow any approved online driver to take
                        bookings without a plan.
                      </p>
                    </div>
                    <Switch
                      checked={Boolean(requireSubscription)}
                      onCheckedChange={(checked) =>
                        form.setValue("requireSubscription", checked, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      size="md"
                      disabled={disabled}
                      className="shrink-0"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center gap-3">
                  <Map className="h-7 w-7 text-default-600 shrink-0" />
                  <div>
                    <h2 className="text-sm font-semibold text-default-900">Offer Marketplace</h2>
                    <p className="text-xs text-default-500">
                      Controls the seek → quote → accept flow: how far we search for drivers, how
                      many quotes are allowed, how long offers stay valid, and how far quotes may
                      deviate from the fair price.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="overflow-hidden rounded-md border border-border divide-y divide-border">
                    <SettingsNumberRow
                      name="offerRadius"
                      label="Default Matching Radius (km)"
                      hint="First search ring around the pickup when a booking enters seeking-offers. Nearby online drivers in this radius are notified to submit a quote."
                      step="0.5"
                      min="0"
                      max="100"
                      placeholder="0"
                      disabled={disabled}
                    />
                    <SettingsNumberRow
                      name="offerExpandStep"
                      label="Radius Expand Step (km)"
                      hint="If no drivers match (or none quote), the search widens by this many kilometers on each expand cycle until the max radius is reached."
                      step="0.5"
                      min="0"
                      max="50"
                      placeholder="0"
                      disabled={disabled}
                    />
                    <SettingsNumberRow
                      name="offerExpandMax"
                      label="Max Matching Radius (km)"
                      hint="Hard ceiling for radius expansion. The matcher will not search farther than this, even if still no drivers are found."
                      step="0.5"
                      min="0"
                      max="200"
                      placeholder="0"
                      disabled={disabled}
                    />
                    <SettingsNumberRow
                      name="offerGeoMatchCount"
                      label="Geo Match Cap"
                      hint="Maximum drivers returned from one geo search. Higher values reach more drivers but cost more Redis/CPU on busy bookings."
                      min="0"
                      max="500"
                      placeholder="0"
                      disabled={disabled}
                    />
                  </div>

                  <div className="overflow-hidden rounded-md border border-border divide-y divide-border">
                    <SettingsNumberRow
                      name="offerMaxPerBooking"
                      label="Max Offers per Booking"
                      hint="How many pending driver quotes a single booking can hold at once. Extra quote attempts are rejected once this cap is hit."
                      min="0"
                      max="100"
                      placeholder="0"
                      disabled={disabled}
                    />
                    <SettingsNumberRow
                      name="offerMaxQuotesPerDriver"
                      label="Max Active Quotes per Driver"
                      hint="How many pending quotes one driver may keep open across all bookings. Stops a driver from flooding the marketplace with too many concurrent offers."
                      min="0"
                      max="50"
                      placeholder="0"
                      disabled={disabled}
                    />
                    <SettingsNumberRow
                      name="offerTtlMin"
                      label="Offer Quote TTL (Minutes)"
                      hint="Lifetime a driver submits a quote, it stays pending for this many minutes. After that it expires and is removed from the customer’s offer list."
                      min="0"
                      max="60"
                      placeholder="0"
                      disabled={disabled}
                    />
                    <SettingsNumberRow
                      name="offerSessionTtlMin"
                      label="Seeking Session TTL (Minutes)"
                      hint="Total time a booking remains in seeking-offers. When the session ends, matching stops, pending offers expire, and the customer must start a new seek."
                      min="0"
                      max="180"
                      placeholder="0"
                      disabled={disabled}
                    />
                  </div>

                  <div className="overflow-hidden rounded-md border border-border divide-y divide-border">
                    <SettingsNumberRow
                      name="offerQuoteMinFactor"
                      label="Min Quote Factor"
                      hint="Lowest allowed quote as a fraction of the fair price. Example: 0.5 means drivers cannot bid below 50% of fair. Protects customers from unrealistically low (and often abandoned) quotes."
                      step="0.05"
                      min="0"
                      max="1"
                      placeholder="0"
                      disabled={disabled}
                    />
                    <SettingsNumberRow
                      name="offerQuoteMaxFactor"
                      label="Max Quote Factor"
                      hint="Highest allowed quote as a multiple of the fair price. Example: 2.5 means drivers cannot bid above 250% of fair. Caps price gouging during peak demand."
                      step="0.05"
                      min="0"
                      max="5"
                      placeholder="0"
                      disabled={disabled}
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center gap-3">
                  <ShieldCheck className="h-7 w-7 text-default-600 shrink-0" />
                  <div>
                    <h2 className="text-sm font-semibold text-default-900">
                      Cancel, Payment &amp; No-show
                    </h2>
                    <p className="text-xs text-default-500">
                      Refund percentages, payment window after offer accept, free wait at pickup,
                      and no-show rules.
                    </p>
                  </div>
                </div>

                <div className="overflow-hidden rounded-md border border-border divide-y divide-border">
                  <SettingsNumberRow
                    name="paymentTimeoutMin"
                    label="Payment Timeout (Minutes)"
                    hint="After a customer accepts an offer, they must pay within this window or the booking returns to seeking offers."
                    min="1"
                    max="180"
                    placeholder="15"
                    disabled={disabled}
                  />
                  <SettingsNumberRow
                    name="cancelRefundBeforeStartPercent"
                    label="Customer Cancel Refund Before Start (%)"
                    hint="Refund % when the customer cancels while the trip is still ACCEPTED (not started)."
                    min="0"
                    max="100"
                    placeholder="100"
                    disabled={disabled}
                  />
                  <SettingsNumberRow
                    name="cancelRefundAfterStartPercent"
                    label="Customer Cancel Refund After Start (%)"
                    hint="Refund % when the customer cancels after the trip has started."
                    min="0"
                    max="100"
                    placeholder="50"
                    disabled={disabled}
                  />
                  <SettingsNumberRow
                    name="driverCancelRefundPercent"
                    label="Driver Cancel Refund (%)"
                    hint="Refund % to the customer when the driver cancels a paid trip."
                    min="0"
                    max="100"
                    placeholder="100"
                    disabled={disabled}
                  />
                  <div className="flex items-center justify-between gap-4 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-default-900">
                        Driver Cancel → Re-seek
                      </p>
                      <p className="mt-0.5 text-xs text-default-500">
                        After driver cancel + refund, put the booking back into seeking offers
                        instead of cancelling it.
                      </p>
                    </div>
                    <Switch
                      checked={Boolean(form.watch("driverCancelReseek"))}
                      onCheckedChange={(checked) =>
                        form.setValue("driverCancelReseek", checked, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      size="md"
                      disabled={disabled}
                      className="shrink-0"
                    />
                  </div>
                  <SettingsNumberRow
                    name="pickupFreeWaitMin"
                    label="Pickup Free Wait (Minutes)"
                    hint="Minutes the driver must wait at ARRIVED_AT_PICKUP before they can mark passenger no-show."
                    min="0"
                    max="120"
                    placeholder="10"
                    disabled={disabled}
                  />
                  <SettingsNumberRow
                    name="noShowRefundPercent"
                    label="No-show Refund (%)"
                    hint="Refund % if the driver marks passenger no-show after free wait."
                    min="0"
                    max="100"
                    placeholder="0"
                    disabled={disabled}
                  />
                </div>
              </div>

              {isError && (
                <div className="flex items-center justify-between rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  <span>Failed to load settings. Please try again.</span>
                  <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
                    Retry
                  </Button>
                </div>
              )}
            </CardContent>

            {settings?.updatedAt && (
              <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs text-default-500">
                <span>Last updated: {formatDateTime({ date: settings.updatedAt })}</span>
                <span>({formatRelativeTime({ date: settings.updatedAt })})</span>
              </div>
            )}
          </form>
        </Form>
      </Card>
    </div>
  );
}
