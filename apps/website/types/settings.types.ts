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
}
