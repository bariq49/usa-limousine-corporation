/** Platform fees and booking rules from `GET /public/settings`. */
export interface BookingSettings {
    fuelSurchargeRate?: number;
    gratuityRate?: number;
    taxRate?: number;
    transactionFeeRate?: number;
    oneWayDiscountRate?: number;
    returnDiscountRate?: number;
    airportPickupFee?: number;
    stopFee?: number;
    meetAndGreetFee?: number;
    minBookingMinutes?: number;
    /** Notice before pickup, in minutes, that a cancellation still gets a refund. */
    cancellationMinutes?: number;
    cancellationRefundRate?: number;
}
