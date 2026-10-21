-- Help tickets now number from HelpTicketSequence; carry over the counter they used before.
INSERT INTO "HelpTicketSequence" ("id", "lastValue", "updatedAt")
SELECT 'global', "lastValue", CURRENT_TIMESTAMP FROM "DriverApplicationSequence" WHERE "id" = 'help-ticket'
ON CONFLICT ("id") DO UPDATE SET "lastValue" = GREATEST("HelpTicketSequence"."lastValue", EXCLUDED."lastValue");

-- Data cleanup: remove rows that use enum values dropped below.
DELETE FROM "User" WHERE "id" IN (
  SELECT ur."userId" FROM "UserRole" ur JOIN "Role" r ON r."id" = ur."roleId" WHERE r."key" = 'DRIVER'
) AND "id" NOT IN (
  SELECT ur."userId" FROM "UserRole" ur JOIN "Role" r ON r."id" = ur."roleId" WHERE r."key" <> 'DRIVER'
);
DELETE FROM "Role" WHERE "key" = 'DRIVER';
DELETE FROM "Notification"
  WHERE "recipientType" = 'DRIVER'
     OR "type" NOT IN ('TICKET_STATUS_UPDATED', 'TICKET_REPLY', 'TICKET_RESOLVED', 'TICKET_CREATED', 'BOOKING_CREATED');
DELETE FROM "HelpTicket" WHERE "ownerType" = 'DRIVER';
DELETE FROM "Activity" WHERE "ownerType" = 'DRIVER' OR "actorType" = 'DRIVER';
UPDATE "Booking" SET "status" = 'PENDING' WHERE "status" IN ('SEEKING_OFFERS', 'AWAITING_PAYMENT');

-- AlterEnum
BEGIN;
CREATE TYPE "ActivityOwnerType_new" AS ENUM ('CUSTOMER', 'USER');
ALTER TABLE "Activity" ALTER COLUMN "ownerType" TYPE "ActivityOwnerType_new" USING ("ownerType"::text::"ActivityOwnerType_new");
ALTER TABLE "Activity" ALTER COLUMN "actorType" TYPE "ActivityOwnerType_new" USING ("actorType"::text::"ActivityOwnerType_new");
ALTER TYPE "ActivityOwnerType" RENAME TO "ActivityOwnerType_old";
ALTER TYPE "ActivityOwnerType_new" RENAME TO "ActivityOwnerType";
DROP TYPE "public"."ActivityOwnerType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "BookingStatus_new" AS ENUM ('DRAFT', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');
ALTER TABLE "public"."Booking" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Booking" ALTER COLUMN "status" TYPE "BookingStatus_new" USING ("status"::text::"BookingStatus_new");
ALTER TYPE "BookingStatus" RENAME TO "BookingStatus_old";
ALTER TYPE "BookingStatus_new" RENAME TO "BookingStatus";
DROP TYPE "public"."BookingStatus_old";
ALTER TABLE "Booking" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "HelpTicketOwnerType_new" AS ENUM ('CUSTOMER');
ALTER TABLE "HelpTicket" ALTER COLUMN "ownerType" TYPE "HelpTicketOwnerType_new" USING ("ownerType"::text::"HelpTicketOwnerType_new");
ALTER TYPE "HelpTicketOwnerType" RENAME TO "HelpTicketOwnerType_old";
ALTER TYPE "HelpTicketOwnerType_new" RENAME TO "HelpTicketOwnerType";
DROP TYPE "public"."HelpTicketOwnerType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "NotificationRecipientType_new" AS ENUM ('USER');
ALTER TABLE "Notification" ALTER COLUMN "recipientType" TYPE "NotificationRecipientType_new" USING ("recipientType"::text::"NotificationRecipientType_new");
ALTER TYPE "NotificationRecipientType" RENAME TO "NotificationRecipientType_old";
ALTER TYPE "NotificationRecipientType_new" RENAME TO "NotificationRecipientType";
DROP TYPE "public"."NotificationRecipientType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('TICKET_STATUS_UPDATED', 'TICKET_REPLY', 'TICKET_RESOLVED', 'TICKET_CREATED', 'BOOKING_CREATED');
ALTER TABLE "Notification" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "public"."NotificationType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "RoleKey_new" AS ENUM ('SUPER_ADMIN', 'EMPLOYEE', 'AGENCY_OWNER', 'AGENCY_STAFF', 'CUSTOMER', 'BUSINESS_CUSTOMER', 'VIP_CUSTOMER');
ALTER TABLE "Role" ALTER COLUMN "key" TYPE "RoleKey_new" USING ("key"::text::"RoleKey_new");
ALTER TYPE "RoleKey" RENAME TO "RoleKey_old";
ALTER TYPE "RoleKey_new" RENAME TO "RoleKey";
DROP TYPE "public"."RoleKey_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_acceptedOfferId_fkey";

-- DropForeignKey
ALTER TABLE "BookingOffer" DROP CONSTRAINT "BookingOffer_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "BookingOffer" DROP CONSTRAINT "BookingOffer_driverId_fkey";

-- DropForeignKey
ALTER TABLE "BookingOffer" DROP CONSTRAINT "BookingOffer_vehicleId_fkey";

-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_replyToMessageId_fkey";

-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT "ChatMessage_senderUserId_fkey";

-- DropForeignKey
ALTER TABLE "ChatMessageReceipt" DROP CONSTRAINT "ChatMessageReceipt_messageId_fkey";

-- DropForeignKey
ALTER TABLE "ChatMessageReceipt" DROP CONSTRAINT "ChatMessageReceipt_userId_fkey";

-- DropForeignKey
ALTER TABLE "ConversationParticipant" DROP CONSTRAINT "ConversationParticipant_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "ConversationParticipant" DROP CONSTRAINT "ConversationParticipant_lastReadMessageId_fkey";

-- DropForeignKey
ALTER TABLE "ConversationParticipant" DROP CONSTRAINT "ConversationParticipant_userId_fkey";

-- DropForeignKey
ALTER TABLE "Driver" DROP CONSTRAINT "Driver_userId_fkey";

-- DropForeignKey
ALTER TABLE "DriverBankAccount" DROP CONSTRAINT "DriverBankAccount_driverId_fkey";

-- DropForeignKey
ALTER TABLE "DriverBookingDecline" DROP CONSTRAINT "DriverBookingDecline_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "DriverBookingDecline" DROP CONSTRAINT "DriverBookingDecline_driverId_fkey";

-- DropForeignKey
ALTER TABLE "DriverDeleteRequest" DROP CONSTRAINT "DriverDeleteRequest_driverId_fkey";

-- DropForeignKey
ALTER TABLE "DriverDocument" DROP CONSTRAINT "DriverDocument_driverId_fkey";

-- DropForeignKey
ALTER TABLE "DriverLanguage" DROP CONSTRAINT "DriverLanguage_driverId_fkey";

-- DropForeignKey
ALTER TABLE "DriverPushDevice" DROP CONSTRAINT "DriverPushDevice_driverId_fkey";

-- DropForeignKey
ALTER TABLE "DriverRequestEvent" DROP CONSTRAINT "DriverRequestEvent_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "DriverRequestEvent" DROP CONSTRAINT "DriverRequestEvent_driverId_fkey";

-- DropForeignKey
ALTER TABLE "DriverRequestEvent" DROP CONSTRAINT "DriverRequestEvent_tripId_fkey";

-- DropForeignKey
ALTER TABLE "DriverReview" DROP CONSTRAINT "DriverReview_customerId_fkey";

-- DropForeignKey
ALTER TABLE "DriverReview" DROP CONSTRAINT "DriverReview_driverId_fkey";

-- DropForeignKey
ALTER TABLE "DriverReview" DROP CONSTRAINT "DriverReview_tripId_fkey";

-- DropForeignKey
ALTER TABLE "DriverSettings" DROP CONSTRAINT "DriverSettings_driverId_fkey";

-- DropForeignKey
ALTER TABLE "DriverShiftSession" DROP CONSTRAINT "DriverShiftSession_driverId_fkey";

-- DropForeignKey
ALTER TABLE "DriverVehicle" DROP CONSTRAINT "DriverVehicle_driverId_fkey";

-- DropForeignKey
ALTER TABLE "DriverVehicle" DROP CONSTRAINT "DriverVehicle_vehicleCategoryId_fkey";

-- DropForeignKey
ALTER TABLE "DriverVehicleLuggageCapacity" DROP CONSTRAINT "DriverVehicleLuggageCapacity_luggageTypeId_fkey";

-- DropForeignKey
ALTER TABLE "DriverVehicleLuggageCapacity" DROP CONSTRAINT "DriverVehicleLuggageCapacity_vehicleId_fkey";

-- DropForeignKey
ALTER TABLE "Payout" DROP CONSTRAINT "Payout_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "PayoutEvent" DROP CONSTRAINT "PayoutEvent_payoutId_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_pendingPlanId_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_planId_fkey";

-- DropForeignKey
ALTER TABLE "SubscriptionEvent" DROP CONSTRAINT "SubscriptionEvent_subscriptionId_fkey";

-- DropForeignKey
ALTER TABLE "SubscriptionPeriod" DROP CONSTRAINT "SubscriptionPeriod_planId_fkey";

-- DropForeignKey
ALTER TABLE "SubscriptionPeriod" DROP CONSTRAINT "SubscriptionPeriod_subscriptionId_fkey";

-- DropForeignKey
ALTER TABLE "Trip" DROP CONSTRAINT "Trip_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "Trip" DROP CONSTRAINT "Trip_driverId_fkey";

-- DropForeignKey
ALTER TABLE "Trip" DROP CONSTRAINT "Trip_vehicleId_fkey";

-- DropForeignKey
ALTER TABLE "TripEvent" DROP CONSTRAINT "TripEvent_actorUserId_fkey";

-- DropForeignKey
ALTER TABLE "TripEvent" DROP CONSTRAINT "TripEvent_tripId_fkey";

-- DropForeignKey
ALTER TABLE "TripLocationPoint" DROP CONSTRAINT "TripLocationPoint_driverId_fkey";

-- DropForeignKey
ALTER TABLE "TripLocationPoint" DROP CONSTRAINT "TripLocationPoint_tripId_fkey";

-- DropForeignKey
ALTER TABLE "TripReview" DROP CONSTRAINT "TripReview_driverId_fkey";

-- DropForeignKey
ALTER TABLE "TripReview" DROP CONSTRAINT "TripReview_tripId_fkey";

-- DropForeignKey
ALTER TABLE "WalletTransaction" DROP CONSTRAINT "WalletTransaction_payoutId_fkey";

-- DropForeignKey
ALTER TABLE "WalletTransaction" DROP CONSTRAINT "WalletTransaction_walletId_fkey";

-- DropIndex
DROP INDEX "Booking_acceptedOfferId_key";

-- DropIndex
DROP INDEX "Booking_status_offerSessionExpiresAt_idx";

-- DropIndex
DROP INDEX "Customer_stripeCustomerId_key";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "acceptedOfferId",
DROP COLUMN "matchingRadius",
DROP COLUMN "offerSessionExpiresAt";

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "stripeCustomerId",
DROP COLUMN "stripePaymentMethodId";

-- DropTable
DROP TABLE "BookingOffer";

-- DropTable
DROP TABLE "CalendarEvent";

-- DropTable
DROP TABLE "ChatMessage";

-- DropTable
DROP TABLE "ChatMessageReceipt";

-- DropTable
DROP TABLE "Conversation";

-- DropTable
DROP TABLE "ConversationParticipant";

-- DropTable
DROP TABLE "Driver";

-- DropTable
DROP TABLE "DriverApplicationSequence";

-- DropTable
DROP TABLE "DriverBankAccount";

-- DropTable
DROP TABLE "DriverBookingDecline";

-- DropTable
DROP TABLE "DriverDeleteRequest";

-- DropTable
DROP TABLE "DriverDocument";

-- DropTable
DROP TABLE "DriverLanguage";

-- DropTable
DROP TABLE "DriverPushDevice";

-- DropTable
DROP TABLE "DriverRequestEvent";

-- DropTable
DROP TABLE "DriverReview";

-- DropTable
DROP TABLE "DriverSettings";

-- DropTable
DROP TABLE "DriverShiftSession";

-- DropTable
DROP TABLE "DriverVehicle";

-- DropTable
DROP TABLE "DriverVehicleLuggageCapacity";

-- DropTable
DROP TABLE "Payment";

-- DropTable
DROP TABLE "PaymentOutboxEvent";

-- DropTable
DROP TABLE "PaymentWebhookEvent";

-- DropTable
DROP TABLE "Payout";

-- DropTable
DROP TABLE "PayoutEvent";

-- DropTable
DROP TABLE "PayoutSequence";

-- DropTable
DROP TABLE "PlatformSettings";

-- DropTable
DROP TABLE "Subscription";

-- DropTable
DROP TABLE "SubscriptionEvent";

-- DropTable
DROP TABLE "SubscriptionPeriod";

-- DropTable
DROP TABLE "SubscriptionPlan";

-- DropTable
DROP TABLE "Trip";

-- DropTable
DROP TABLE "TripEvent";

-- DropTable
DROP TABLE "TripLocationPoint";

-- DropTable
DROP TABLE "TripReview";

-- DropTable
DROP TABLE "Wallet";

-- DropTable
DROP TABLE "WalletTransaction";

-- DropEnum
DROP TYPE "Audience";

-- DropEnum
DROP TYPE "BookingOfferStatus";

-- DropEnum
DROP TYPE "CalendarEventStatus";

-- DropEnum
DROP TYPE "CalendarEventType";

-- DropEnum
DROP TYPE "CalendarOwnerType";

-- DropEnum
DROP TYPE "ChatMessageType";

-- DropEnum
DROP TYPE "ConversationKind";

-- DropEnum
DROP TYPE "ConversationStatus";

-- DropEnum
DROP TYPE "ConversationSubjectType";

-- DropEnum
DROP TYPE "DriverApprovalStatus";

-- DropEnum
DROP TYPE "DriverDeleteStatus";

-- DropEnum
DROP TYPE "DriverDocumentType";

-- DropEnum
DROP TYPE "DriverDocumentVerificationStatus";

-- DropEnum
DROP TYPE "DriverLanguageFluency";

-- DropEnum
DROP TYPE "DriverOnboardingStatus";

-- DropEnum
DROP TYPE "DriverPresenceStatus";

-- DropEnum
DROP TYPE "DriverRequestOutcome";

-- DropEnum
DROP TYPE "DriverShift";

-- DropEnum
DROP TYPE "DriverShiftEndedReason";

-- DropEnum
DROP TYPE "DriverShiftSessionStatus";

-- DropEnum
DROP TYPE "DriverStatus";

-- DropEnum
DROP TYPE "PaymentMode";

-- DropEnum
DROP TYPE "PaymentPurpose";

-- DropEnum
DROP TYPE "PaymentStatus";

-- DropEnum
DROP TYPE "PayoutLifecycleEvent";

-- DropEnum
DROP TYPE "PayoutStatus";

-- DropEnum
DROP TYPE "SubscriptionInterval";

-- DropEnum
DROP TYPE "SubscriptionStatus";

-- DropEnum
DROP TYPE "TripEventType";

-- DropEnum
DROP TYPE "TripStatus";

-- DropEnum
DROP TYPE "WalletOwnerType";

-- DropEnum
DROP TYPE "WalletTransactionType";
