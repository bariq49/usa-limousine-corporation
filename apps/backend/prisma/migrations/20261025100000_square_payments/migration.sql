-- Booking: Square checkout instead of Stripe
ALTER TABLE "Booking" RENAME COLUMN "stripeSessionId" TO "squareOrderId";
ALTER INDEX "Booking_stripeSessionId_key" RENAME TO "Booking_squareOrderId_key";
ALTER TABLE "Booking" ADD COLUMN "squarePaymentLinkId" TEXT,
ADD COLUMN "paymentMode" "PaymentMode";

-- Payment: Square order and payment ids
ALTER TABLE "Payment" RENAME COLUMN "stripeSessionId" TO "squareOrderId";
ALTER INDEX "Payment_stripeSessionId_key" RENAME TO "Payment_squareOrderId_key";
ALTER TABLE "Payment" RENAME COLUMN "stripePaymentIntentId" TO "squarePaymentId";
