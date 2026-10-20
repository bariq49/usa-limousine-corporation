-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."ActivityOwnerType" AS ENUM ('DRIVER', 'CUSTOMER', 'USER');

-- CreateEnum
CREATE TYPE "public"."Audience" AS ENUM ('DRIVER', 'AGENCY');

-- CreateEnum
CREATE TYPE "public"."BookingOfferStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED_BY_CUSTOMER', 'WITHDRAWN', 'SUPERSEDED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."BookingStatus" AS ENUM ('DRAFT', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'SEEKING_OFFERS', 'AWAITING_PAYMENT');

-- CreateEnum
CREATE TYPE "public"."BookingType" AS ENUM ('ONE_WAY', 'RETURN', 'HOURLY', 'CREW_RIDE');

-- CreateEnum
CREATE TYPE "public"."CalendarEventStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."CalendarEventType" AS ENUM ('BOOKING', 'SHIFT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "public"."CalendarOwnerType" AS ENUM ('DRIVER', 'PASSENGER', 'AGENCY');

-- CreateEnum
CREATE TYPE "public"."ChatMessageType" AS ENUM ('TEXT');

-- CreateEnum
CREATE TYPE "public"."ConversationKind" AS ENUM ('DIRECT', 'CONTEXT');

-- CreateEnum
CREATE TYPE "public"."ConversationStatus" AS ENUM ('PENDING', 'ACTIVE', 'READ_ONLY');

-- CreateEnum
CREATE TYPE "public"."ConversationSubjectType" AS ENUM ('TRIP');

-- CreateEnum
CREATE TYPE "public"."CustomerType" AS ENUM ('NORMAL', 'VIP', 'CORPORATE');

-- CreateEnum
CREATE TYPE "public"."DriverApprovalStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."DriverDeleteStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."DriverDocumentType" AS ENUM ('CHAUFFEUR_FRONT', 'CHAUFFEUR_BACK', 'KIWA_PERMIT', 'LICENSE_FRONT', 'LICENSE_BACK', 'NATIONAL_ID_FRONT', 'NATIONAL_ID_BACK', 'AIRPORT_STA_PASS', 'CAR_REGISTRATION', 'CAR_FRONT', 'CAR_BACK', 'CAR_LEFT', 'CAR_RIGHT', 'CAR_INSIDE', 'LICENSE_PLATE', 'INSURANCE');

-- CreateEnum
CREATE TYPE "public"."DriverDocumentVerificationStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."DriverLanguageFluency" AS ENUM ('FLUENT', 'CONVERSATIONAL', 'NORMAL');

-- CreateEnum
CREATE TYPE "public"."DriverOnboardingStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'DOCUMENTS_PENDING', 'UNDER_REVIEW', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."DriverPresenceStatus" AS ENUM ('OFFLINE', 'ONLINE');

-- CreateEnum
CREATE TYPE "public"."DriverRequestOutcome" AS ENUM ('PENDING', 'FINISHED', 'NOT_ACCEPTED', 'DRIVER_CANCELLED', 'CLIENT_CANCELLED', 'CLIENT_NO_SHOW');

-- CreateEnum
CREATE TYPE "public"."DriverShift" AS ENUM ('DAY', 'NIGHT', 'FLEXIBLE');

-- CreateEnum
CREATE TYPE "public"."DriverShiftEndedReason" AS ENUM ('DRIVER', 'ADMIN', 'WINDOW_ENDED', 'HEARTBEAT_TIMEOUT', 'DEVICE_TAKEOVER');

-- CreateEnum
CREATE TYPE "public"."DriverShiftSessionStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "public"."DriverStatus" AS ENUM ('INVITED', 'PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."ExtraServiceType" AS ENUM ('CHILD_SEAT', 'MEET_AND_GREET', 'EXTRA');

-- CreateEnum
CREATE TYPE "public"."HelpTicketCategory" AS ENUM ('ACCOUNT', 'PAYMENTS', 'TRIPS', 'VEHICLE', 'DOCUMENTS', 'APP', 'PASSENGER_NO_SHOW', 'FLAT_TIRE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."HelpTicketEventType" AS ENUM ('CREATED', 'STATUS_CHANGED', 'PRIORITY_CHANGED', 'MESSAGE_ADDED');

-- CreateEnum
CREATE TYPE "public"."HelpTicketOwnerType" AS ENUM ('DRIVER', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "public"."HelpTicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "public"."HelpTicketStatus" AS ENUM ('PENDING', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "public"."NotificationRecipientType" AS ENUM ('DRIVER', 'USER');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('BOOKING_AVAILABLE', 'BOOKING_UNAVAILABLE', 'TRIP_ACCEPTED', 'TRIP_STATUS_UPDATED', 'TRIP_COMPLETED', 'TRIP_CANCELLED', 'TICKET_STATUS_UPDATED', 'TICKET_REPLY', 'TICKET_RESOLVED', 'WALLET_CREDITED', 'APPLICATION_UNDER_REVIEW', 'APPLICATION_APPROVED', 'SUBSCRIPTION_ACTIVATED', 'SUBSCRIPTION_TRIAL_ENDING', 'SUBSCRIPTION_PAYMENT_FAILED', 'SUBSCRIPTION_PAST_DUE', 'SUBSCRIPTION_EXPIRED', 'SUBSCRIPTION_PLAN_CHANGED', 'SUBSCRIPTION_CANCEL_SCHEDULED', 'SUBSCRIPTION_RESUMED', 'PAYOUT_SUBMITTED', 'PAYOUT_APPROVED', 'PAYOUT_PAID', 'PAYOUT_REJECTED', 'PAYOUT_CANCELLED', 'CHAT_MESSAGE', 'OFFER_RECEIVED', 'OFFER_ACCEPTED');

-- CreateEnum
CREATE TYPE "public"."PaymentMode" AS ENUM ('TEST', 'LIVE');

-- CreateEnum
CREATE TYPE "public"."PaymentPurpose" AS ENUM ('BOOKING', 'DRIVER_SUBSCRIPTION', 'AGENCY_SUBSCRIPTION');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'CANCELLED', 'PARTIALLY_REFUNDED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."PayoutLifecycleEvent" AS ENUM ('CREATED', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PROCESSING', 'PAID', 'CANCELLED', 'RECONCILED');

-- CreateEnum
CREATE TYPE "public"."PayoutStatus" AS ENUM ('PENDING', 'APPROVED', 'PROCESSING', 'PAID', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."PricingStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "public"."PricingType" AS ENUM ('FIXED', 'PER_UNIT', 'PERCENTAGE');

-- CreateEnum
CREATE TYPE "public"."RoleKey" AS ENUM ('SUPER_ADMIN', 'EMPLOYEE', 'AGENCY_OWNER', 'AGENCY_STAFF', 'DRIVER', 'CUSTOMER', 'BUSINESS_CUSTOMER', 'VIP_CUSTOMER');

-- CreateEnum
CREATE TYPE "public"."SubscriptionInterval" AS ENUM ('MONTH', 'YEAR');

-- CreateEnum
CREATE TYPE "public"."SubscriptionStatus" AS ENUM ('INCOMPLETE', 'TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."TripEventType" AS ENUM ('ACCEPTED', 'STARTED', 'ARRIVED_AT_PICKUP', 'PASSENGER_ON_BOARD', 'EN_ROUTE_TO_DROPOFF', 'ARRIVED_AT_DROPOFF', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."TripStatus" AS ENUM ('ACCEPTED', 'STARTED', 'ARRIVED_AT_PICKUP', 'PASSENGER_ON_BOARD', 'EN_ROUTE_TO_DROPOFF', 'ARRIVED_AT_DROPOFF', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."WalletOwnerType" AS ENUM ('DRIVER');

-- CreateEnum
CREATE TYPE "public"."WalletTransactionType" AS ENUM ('TRIP_CREDIT', 'PAYOUT_DEBIT');

-- CreateTable
CREATE TABLE "public"."Activity" (
    "id" TEXT NOT NULL,
    "ownerType" "public"."ActivityOwnerType" NOT NULL,
    "ownerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "actorType" "public"."ActivityOwnerType",
    "actorId" TEXT,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "event" TEXT NOT NULL,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Booking" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "vehicleCategoryId" TEXT NOT NULL,
    "bookingNumber" TEXT NOT NULL,
    "status" "public"."BookingStatus" NOT NULL DEFAULT 'DRAFT',
    "bookingType" "public"."BookingType" NOT NULL DEFAULT 'ONE_WAY',
    "pricing" JSONB NOT NULL,
    "address" JSONB NOT NULL,
    "passenger" JSONB NOT NULL,
    "bookingTime" JSONB NOT NULL,
    "flightDetails" JSONB,
    "meetAndGreet" JSONB,
    "extraServices" JSONB,
    "driverNotes" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "offerSessionExpiresAt" TIMESTAMP(3),
    "matchingRadius" DOUBLE PRECISION,
    "acceptedOfferId" TEXT,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BookingLuggage" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "luggageTypeId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "BookingLuggage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BookingOffer" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "quotedPrice" DOUBLE PRECISION NOT NULL,
    "etaMinutes" INTEGER,
    "distance" DOUBLE PRECISION,
    "fairPriceDelta" DOUBLE PRECISION,
    "status" "public"."BookingOfferStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "BookingOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BookingSequence" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "lastValue" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingSequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CalendarEvent" (
    "id" TEXT NOT NULL,
    "ownerType" "public"."CalendarOwnerType" NOT NULL,
    "ownerId" TEXT NOT NULL,
    "bookingId" TEXT,
    "bookingType" "public"."BookingType",
    "type" "public"."CalendarEventType" NOT NULL DEFAULT 'BOOKING',
    "status" "public"."CalendarEventStatus" NOT NULL DEFAULT 'SCHEDULED',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Amsterdam',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CalendarEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChatMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderUserId" TEXT NOT NULL,
    "type" "public"."ChatMessageType" NOT NULL DEFAULT 'TEXT',
    "body" TEXT NOT NULL,
    "clientMessageId" TEXT,
    "replyToMessageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChatMessageReceipt" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deliveredAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),

    CONSTRAINT "ChatMessageReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Conversation" (
    "id" TEXT NOT NULL,
    "kind" "public"."ConversationKind" NOT NULL DEFAULT 'CONTEXT',
    "subjectType" "public"."ConversationSubjectType",
    "subjectId" TEXT,
    "status" "public"."ConversationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "activatedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ConversationParticipant" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastReadMessageId" TEXT,
    "lastReadAt" TIMESTAMP(3),
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),

    CONSTRAINT "ConversationParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Customer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "public"."CustomerType" NOT NULL DEFAULT 'NORMAL',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "stripeCustomerId" TEXT,
    "stripePaymentMethodId" TEXT,
    "fcmToken" TEXT,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CustomerPushDevice" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "deviceId" TEXT,
    "platform" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerPushDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CustomerSettings" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "email" BOOLEAN NOT NULL DEFAULT true,
    "push" BOOLEAN NOT NULL DEFAULT true,
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Amsterdam',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Driver" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "applicationNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "operatingCountry" TEXT,
    "operatingCity" TEXT,
    "homeAddress" TEXT,
    "houseNo" TEXT,
    "streetName" TEXT,
    "postalCode" TEXT,
    "city" TEXT,
    "province" TEXT,
    "country" TEXT,
    "countryCode" TEXT,
    "kvkNo" TEXT,
    "licenseExpiry" TIMESTAMP(3),
    "yearsExperience" INTEGER,
    "shift" "public"."DriverShift" NOT NULL DEFAULT 'FLEXIBLE',
    "startTime" TEXT,
    "endTime" TEXT,
    "dressesInSuit" BOOLEAN NOT NULL DEFAULT false,
    "services" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "public"."DriverStatus" NOT NULL DEFAULT 'PENDING',
    "onboardingStatus" "public"."DriverOnboardingStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "approvalStatus" "public"."DriverApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "onboardingPersonal" BOOLEAN NOT NULL DEFAULT false,
    "onboardingEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "onboardingDetails" BOOLEAN NOT NULL DEFAULT false,
    "onboardingVehicle" BOOLEAN NOT NULL DEFAULT false,
    "onboardingDocuments" BOOLEAN NOT NULL DEFAULT false,
    "presenceStatus" "public"."DriverPresenceStatus" NOT NULL DEFAULT 'OFFLINE',
    "presenceUpdatedAt" TIMESTAMP(3),
    "lastHeartbeatAt" TIMESTAMP(3),
    "presenceDeviceId" TEXT,
    "lastLat" DOUBLE PRECISION,
    "lastLng" DOUBLE PRECISION,
    "locationUpdatedAt" TIMESTAMP(3),
    "fcmToken" TEXT,
    "stripeCustomerId" TEXT,
    "subscriptionFreeUsedAt" TIMESTAMP(3),
    "about" TEXT,
    "notes" TEXT,
    "avatarUrl" TEXT,
    "avatarPublicId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "ratingAvg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "completedTrips" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DriverApplicationSequence" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "lastValue" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverApplicationSequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DriverBankAccount" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "accountHolderName" TEXT NOT NULL,
    "iban" TEXT NOT NULL,
    "bic" TEXT,
    "bankName" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverBankAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DriverBookingDecline" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DriverBookingDecline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DriverDeleteRequest" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "reason" TEXT,
    "status" "public"."DriverDeleteStatus" NOT NULL DEFAULT 'PENDING',
    "processedAt" TIMESTAMP(3),
    "processedBy" TEXT,
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "previousStatus" "public"."DriverStatus",

    CONSTRAINT "DriverDeleteRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DriverDocument" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "documentType" "public"."DriverDocumentType" NOT NULL,
    "fileId" TEXT,
    "publicId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "originalName" TEXT,
    "mimeType" TEXT,
    "size" INTEGER,
    "expiryDate" TIMESTAMP(3),
    "verificationStatus" "public"."DriverDocumentVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "DriverDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DriverLanguage" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "fluency" "public"."DriverLanguageFluency" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverLanguage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DriverPushDevice" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "deviceId" TEXT,
    "platform" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverPushDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DriverRequestEvent" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "tripId" TEXT,
    "outcome" "public"."DriverRequestOutcome" NOT NULL DEFAULT 'PENDING',
    "outcomeAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverRequestEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DriverReview" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" TEXT NOT NULL,

    CONSTRAINT "DriverReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DriverSettings" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "email" BOOLEAN NOT NULL DEFAULT true,
    "push" BOOLEAN NOT NULL DEFAULT true,
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Amsterdam',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DriverShiftSession" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "status" "public"."DriverShiftSessionStatus" NOT NULL DEFAULT 'OPEN',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "durationSeconds" INTEGER,
    "extraSeconds" INTEGER,
    "shiftType" "public"."DriverShift" NOT NULL,
    "scheduledStartTime" TEXT,
    "scheduledEndTime" TEXT,
    "timezone" TEXT NOT NULL,
    "endedReason" "public"."DriverShiftEndedReason",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverShiftSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DriverVehicle" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "vehicleCategoryId" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "color" TEXT,
    "licensePlate" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "DriverVehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DriverVehicleLuggageCapacity" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "luggageTypeId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverVehicleLuggageCapacity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailVerificationToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailVerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ExtraService" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "type" "public"."ExtraServiceType" NOT NULL DEFAULT 'EXTRA',
    "maxQuantity" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ExtraService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HelpTicket" (
    "id" TEXT NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "attachment" TEXT,
    "category" "public"."HelpTicketCategory" NOT NULL DEFAULT 'OTHER',
    "status" "public"."HelpTicketStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "public"."HelpTicketPriority" NOT NULL DEFAULT 'MEDIUM',
    "resolvedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "ownerType" "public"."HelpTicketOwnerType" NOT NULL,
    "ownerId" TEXT NOT NULL,
    "ownerName" TEXT,
    "ownerEmail" TEXT,

    CONSTRAINT "HelpTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HelpTicketEvent" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "event" "public"."HelpTicketEventType" NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "previousStatus" "public"."HelpTicketStatus",
    "newStatus" "public"."HelpTicketStatus",
    "previousPriority" "public"."HelpTicketPriority",
    "newPriority" "public"."HelpTicketPriority",
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HelpTicketEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HelpTicketMessage" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HelpTicketMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HelpTicketSequence" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "lastValue" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HelpTicketSequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LuggageType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "dimensions" TEXT,
    "image" TEXT,
    "price" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LuggageType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "recipientType" "public"."NotificationRecipientType" NOT NULL,
    "recipientId" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idempotencyKey" TEXT,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" TEXT NOT NULL,
    "purpose" "public"."PaymentPurpose" NOT NULL DEFAULT 'BOOKING',
    "referenceId" TEXT NOT NULL,
    "transactionId" TEXT,
    "amount" DECIMAL(14,4) NOT NULL,
    "refundedAmount" DECIMAL(14,4) NOT NULL DEFAULT 0,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "method" JSONB,
    "checkout" JSONB,
    "failureCode" TEXT,
    "failureMessage" TEXT,
    "paidAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PaymentOutboxEvent" (
    "id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentOutboxEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PaymentWebhookEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Payout" (
    "id" TEXT NOT NULL,
    "payoutNumber" TEXT NOT NULL,
    "recipientType" "public"."WalletOwnerType" NOT NULL,
    "recipientId" TEXT NOT NULL,
    "bankAccountId" TEXT NOT NULL,
    "accountHolderName" TEXT NOT NULL,
    "iban" TEXT NOT NULL,
    "bic" TEXT,
    "bankName" TEXT,
    "amount" DECIMAL(14,4) NOT NULL,
    "status" "public"."PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "idempotencyKey" TEXT,
    "approvedAt" TIMESTAMP(3),
    "processingAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PayoutEvent" (
    "id" TEXT NOT NULL,
    "payoutId" TEXT NOT NULL,
    "event" "public"."PayoutLifecycleEvent" NOT NULL,
    "previousStatus" "public"."PayoutStatus",
    "newStatus" "public"."PayoutStatus",
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PayoutEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PayoutSequence" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "lastValue" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayoutSequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Permission" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlatformSettings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "paymentMode" "public"."PaymentMode" NOT NULL DEFAULT 'TEST',
    "payoutMin" DECIMAL(14,4) NOT NULL DEFAULT 10,
    "payoutIntervalDays" INTEGER NOT NULL DEFAULT 7,
    "requireSubscription" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "offerRadius" DOUBLE PRECISION NOT NULL DEFAULT 8,
    "offerExpandStep" DOUBLE PRECISION NOT NULL DEFAULT 4,
    "offerExpandMax" DOUBLE PRECISION NOT NULL DEFAULT 24,
    "offerGeoMatchCount" INTEGER NOT NULL DEFAULT 80,
    "offerMaxPerBooking" INTEGER NOT NULL DEFAULT 20,
    "offerMaxQuotesPerDriver" INTEGER NOT NULL DEFAULT 5,
    "offerTtlMin" INTEGER NOT NULL DEFAULT 5,
    "offerSessionTtlMin" INTEGER NOT NULL DEFAULT 15,
    "offerQuoteMinFactor" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "offerQuoteMaxFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "paymentTimeoutMin" INTEGER NOT NULL DEFAULT 15,
    "cancelRefundBeforeStartPercent" INTEGER NOT NULL DEFAULT 100,
    "cancelRefundAfterStartPercent" INTEGER NOT NULL DEFAULT 50,
    "driverCancelRefundPercent" INTEGER NOT NULL DEFAULT 100,
    "driverCancelReseek" BOOLEAN NOT NULL DEFAULT false,
    "pickupFreeWaitMin" INTEGER NOT NULL DEFAULT 10,
    "noShowRefundPercent" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PlatformSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Role" (
    "id" TEXT NOT NULL,
    "key" "public"."RoleKey" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RolePermission" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "public"."Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "refreshTokenHash" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Subscription" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "audience" "public"."Audience" NOT NULL,
    "referenceId" TEXT NOT NULL,
    "status" "public"."SubscriptionStatus" NOT NULL DEFAULT 'INCOMPLETE',
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "tripsUsed" INTEGER NOT NULL DEFAULT 0,
    "trialEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "pendingPlanId" TEXT,
    "pendingChargeAmount" DECIMAL(12,2),
    "stripeCustomerId" TEXT,
    "stripePaymentMethodId" TEXT,
    "dunningAttempts" INTEGER NOT NULL DEFAULT 0,
    "lastDunningAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SubscriptionEvent" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubscriptionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SubscriptionPeriod" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "tripsUsed" INTEGER NOT NULL DEFAULT 0,
    "tripsLimit" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubscriptionPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SubscriptionPlan" (
    "id" TEXT NOT NULL,
    "audience" "public"."Audience" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "interval" "public"."SubscriptionInterval" NOT NULL DEFAULT 'MONTH',
    "amount" DECIMAL(12,2) NOT NULL,
    "tripsPerMonth" INTEGER,
    "features" JSONB NOT NULL,
    "freeMonths" INTEGER NOT NULL DEFAULT 0,
    "freeDays" INTEGER NOT NULL DEFAULT 0,
    "graceDays" INTEGER NOT NULL DEFAULT 3,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Trip" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "status" "public"."TripStatus" NOT NULL DEFAULT 'ACCEPTED',
    "watchToken" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "arrivedAtPickupAt" TIMESTAMP(3),
    "pickedUpAt" TIMESTAMP(3),
    "droppedOffAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "driverNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TripEvent" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "event" "public"."TripEventType" NOT NULL,
    "actorUserId" TEXT,
    "previousStatus" "public"."TripStatus",
    "newStatus" "public"."TripStatus",
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TripEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TripLocationPoint" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "heading" DOUBLE PRECISION,
    "speed" DOUBLE PRECISION,
    "accuracy" DOUBLE PRECISION,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TripLocationPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TripReview" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "passenger" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "avatar" TEXT,
    "passwordHash" TEXT NOT NULL,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
    "lockoutUntil" TIMESTAMP(3),
    "defaultAdminEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserRole" (
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateTable
CREATE TABLE "public"."VehicleCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "passengerCount" INTEGER NOT NULL DEFAULT 4,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "VehicleCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VehicleCategoryLuggageCapacity" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "luggageTypeId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleCategoryLuggageCapacity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VehicleCategoryPricing" (
    "id" TEXT NOT NULL,
    "vehicleCategoryId" TEXT NOT NULL,
    "minimumDistance" DOUBLE PRECISION NOT NULL,
    "maximumDistance" DOUBLE PRECISION,
    "pricingType" "public"."PricingType" NOT NULL,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "perUnitRate" DOUBLE PRECISION,
    "percentageRate" DOUBLE PRECISION,
    "status" "public"."PricingStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleCategoryPricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Wallet" (
    "id" TEXT NOT NULL,
    "ownerType" "public"."WalletOwnerType" NOT NULL,
    "ownerId" TEXT NOT NULL,
    "balance" DECIMAL(14,4) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WalletTransaction" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "type" "public"."WalletTransactionType" NOT NULL,
    "amount" DECIMAL(14,4) NOT NULL,
    "balanceAfter" DECIMAL(14,4) NOT NULL,
    "bookingId" TEXT,
    "tripId" TEXT,
    "payoutId" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Activity_createdAt_idx" ON "public"."Activity"("createdAt" ASC);

-- CreateIndex
CREATE INDEX "Activity_ownerType_ownerId_createdAt_idx" ON "public"."Activity"("ownerType" ASC, "ownerId" ASC, "createdAt" ASC);

-- CreateIndex
CREATE INDEX "Activity_type_idx" ON "public"."Activity"("type" ASC);

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "public"."AuditLog"("createdAt" ASC);

-- CreateIndex
CREATE INDEX "AuditLog_event_idx" ON "public"."AuditLog"("event" ASC);

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "public"."AuditLog"("userId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Booking_acceptedOfferId_key" ON "public"."Booking"("acceptedOfferId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Booking_bookingNumber_key" ON "public"."Booking"("bookingNumber" ASC);

-- CreateIndex
CREATE INDEX "Booking_bookingType_idx" ON "public"."Booking"("bookingType" ASC);

-- CreateIndex
CREATE INDEX "Booking_deletedAt_idx" ON "public"."Booking"("deletedAt" ASC);

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "public"."Booking"("status" ASC);

-- CreateIndex
CREATE INDEX "Booking_status_offerSessionExpiresAt_idx" ON "public"."Booking"("status" ASC, "offerSessionExpiresAt" ASC);

-- CreateIndex
CREATE INDEX "Booking_userId_idx" ON "public"."Booking"("userId" ASC);

-- CreateIndex
CREATE INDEX "Booking_vehicleCategoryId_idx" ON "public"."Booking"("vehicleCategoryId" ASC);

-- CreateIndex
CREATE INDEX "BookingLuggage_bookingId_idx" ON "public"."BookingLuggage"("bookingId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "BookingLuggage_bookingId_luggageTypeId_key" ON "public"."BookingLuggage"("bookingId" ASC, "luggageTypeId" ASC);

-- CreateIndex
CREATE INDEX "BookingLuggage_luggageTypeId_idx" ON "public"."BookingLuggage"("luggageTypeId" ASC);

-- CreateIndex
CREATE INDEX "BookingOffer_bookingId_status_idx" ON "public"."BookingOffer"("bookingId" ASC, "status" ASC);

-- CreateIndex
CREATE INDEX "BookingOffer_deletedAt_idx" ON "public"."BookingOffer"("deletedAt" ASC);

-- CreateIndex
CREATE INDEX "BookingOffer_driverId_status_idx" ON "public"."BookingOffer"("driverId" ASC, "status" ASC);

-- CreateIndex
CREATE INDEX "BookingOffer_expiresAt_idx" ON "public"."BookingOffer"("expiresAt" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "CalendarEvent_bookingId_bookingType_key" ON "public"."CalendarEvent"("bookingId" ASC, "bookingType" ASC);

-- CreateIndex
CREATE INDEX "CalendarEvent_bookingId_idx" ON "public"."CalendarEvent"("bookingId" ASC);

-- CreateIndex
CREATE INDEX "CalendarEvent_deletedAt_idx" ON "public"."CalendarEvent"("deletedAt" ASC);

-- CreateIndex
CREATE INDEX "CalendarEvent_ownerType_ownerId_idx" ON "public"."CalendarEvent"("ownerType" ASC, "ownerId" ASC);

-- CreateIndex
CREATE INDEX "CalendarEvent_ownerType_ownerId_startAt_idx" ON "public"."CalendarEvent"("ownerType" ASC, "ownerId" ASC, "startAt" ASC);

-- CreateIndex
CREATE INDEX "CalendarEvent_status_idx" ON "public"."CalendarEvent"("status" ASC);

-- CreateIndex
CREATE INDEX "CalendarEvent_type_idx" ON "public"."CalendarEvent"("type" ASC);

-- CreateIndex
CREATE INDEX "ChatMessage_conversationId_createdAt_idx" ON "public"."ChatMessage"("conversationId" ASC, "createdAt" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "ChatMessage_conversationId_senderUserId_clientMessageId_key" ON "public"."ChatMessage"("conversationId" ASC, "senderUserId" ASC, "clientMessageId" ASC);

-- CreateIndex
CREATE INDEX "ChatMessage_deletedAt_idx" ON "public"."ChatMessage"("deletedAt" ASC);

-- CreateIndex
CREATE INDEX "ChatMessage_senderUserId_idx" ON "public"."ChatMessage"("senderUserId" ASC);

-- CreateIndex
CREATE INDEX "ChatMessageReceipt_messageId_idx" ON "public"."ChatMessageReceipt"("messageId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "ChatMessageReceipt_messageId_userId_key" ON "public"."ChatMessageReceipt"("messageId" ASC, "userId" ASC);

-- CreateIndex
CREATE INDEX "ChatMessageReceipt_userId_idx" ON "public"."ChatMessageReceipt"("userId" ASC);

-- CreateIndex
CREATE INDEX "Conversation_status_idx" ON "public"."Conversation"("status" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_subjectType_subjectId_key" ON "public"."Conversation"("subjectType" ASC, "subjectId" ASC);

-- CreateIndex
CREATE INDEX "Conversation_updatedAt_idx" ON "public"."Conversation"("updatedAt" ASC);

-- CreateIndex
CREATE INDEX "ConversationParticipant_conversationId_idx" ON "public"."ConversationParticipant"("conversationId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "ConversationParticipant_conversationId_userId_key" ON "public"."ConversationParticipant"("conversationId" ASC, "userId" ASC);

-- CreateIndex
CREATE INDEX "ConversationParticipant_lastReadMessageId_idx" ON "public"."ConversationParticipant"("lastReadMessageId" ASC);

-- CreateIndex
CREATE INDEX "ConversationParticipant_userId_idx" ON "public"."ConversationParticipant"("userId" ASC);

-- CreateIndex
CREATE INDEX "Customer_deletedAt_idx" ON "public"."Customer"("deletedAt" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_stripeCustomerId_key" ON "public"."Customer"("stripeCustomerId" ASC);

-- CreateIndex
CREATE INDEX "Customer_type_idx" ON "public"."Customer"("type" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_userId_key" ON "public"."Customer"("userId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "CustomerPushDevice_customerId_deviceId_key" ON "public"."CustomerPushDevice"("customerId" ASC, "deviceId" ASC);

-- CreateIndex
CREATE INDEX "CustomerPushDevice_customerId_idx" ON "public"."CustomerPushDevice"("customerId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "CustomerPushDevice_token_key" ON "public"."CustomerPushDevice"("token" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "CustomerSettings_customerId_key" ON "public"."CustomerSettings"("customerId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Driver_applicationNumber_key" ON "public"."Driver"("applicationNumber" ASC);

-- CreateIndex
CREATE INDEX "Driver_approvalStatus_idx" ON "public"."Driver"("approvalStatus" ASC);

-- CreateIndex
CREATE INDEX "Driver_completedTrips_idx" ON "public"."Driver"("completedTrips" ASC);

-- CreateIndex
CREATE INDEX "Driver_deletedAt_idx" ON "public"."Driver"("deletedAt" ASC);

-- CreateIndex
CREATE INDEX "Driver_email_idx" ON "public"."Driver"("email" ASC);

-- CreateIndex
CREATE INDEX "Driver_onboardingStatus_idx" ON "public"."Driver"("onboardingStatus" ASC);

-- CreateIndex
CREATE INDEX "Driver_operatingCity_idx" ON "public"."Driver"("operatingCity" ASC);

-- CreateIndex
CREATE INDEX "Driver_phone_idx" ON "public"."Driver"("phone" ASC);

-- CreateIndex
CREATE INDEX "Driver_presenceStatus_idx" ON "public"."Driver"("presenceStatus" ASC);

-- CreateIndex
CREATE INDEX "Driver_ratingAvg_idx" ON "public"."Driver"("ratingAvg" ASC);

-- CreateIndex
CREATE INDEX "Driver_status_idx" ON "public"."Driver"("status" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Driver_stripeCustomerId_key" ON "public"."Driver"("stripeCustomerId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Driver_userId_key" ON "public"."Driver"("userId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "DriverBankAccount_driverId_iban_key" ON "public"."DriverBankAccount"("driverId" ASC, "iban" ASC);

-- CreateIndex
CREATE INDEX "DriverBankAccount_driverId_idx" ON "public"."DriverBankAccount"("driverId" ASC);

-- CreateIndex
CREATE INDEX "DriverBankAccount_driverId_isDefault_idx" ON "public"."DriverBankAccount"("driverId" ASC, "isDefault" ASC);

-- CreateIndex
CREATE INDEX "DriverBankAccount_iban_idx" ON "public"."DriverBankAccount"("iban" ASC);

-- CreateIndex
CREATE INDEX "DriverBookingDecline_bookingId_idx" ON "public"."DriverBookingDecline"("bookingId" ASC);

-- CreateIndex
CREATE INDEX "DriverBookingDecline_createdAt_idx" ON "public"."DriverBookingDecline"("createdAt" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "DriverBookingDecline_driverId_bookingId_key" ON "public"."DriverBookingDecline"("driverId" ASC, "bookingId" ASC);

-- CreateIndex
CREATE INDEX "DriverBookingDecline_driverId_idx" ON "public"."DriverBookingDecline"("driverId" ASC);

-- CreateIndex
CREATE INDEX "DriverDeleteRequest_createdAt_idx" ON "public"."DriverDeleteRequest"("createdAt" ASC);

-- CreateIndex
CREATE INDEX "DriverDeleteRequest_driverId_idx" ON "public"."DriverDeleteRequest"("driverId" ASC);

-- CreateIndex
CREATE INDEX "DriverDeleteRequest_driverId_status_idx" ON "public"."DriverDeleteRequest"("driverId" ASC, "status" ASC);

-- CreateIndex
CREATE INDEX "DriverDeleteRequest_status_idx" ON "public"."DriverDeleteRequest"("status" ASC);

-- CreateIndex
CREATE INDEX "DriverDocument_deletedAt_idx" ON "public"."DriverDocument"("deletedAt" ASC);

-- CreateIndex
CREATE INDEX "DriverDocument_documentType_idx" ON "public"."DriverDocument"("documentType" ASC);

-- CreateIndex
CREATE INDEX "DriverDocument_driverId_idx" ON "public"."DriverDocument"("driverId" ASC);

-- CreateIndex
CREATE INDEX "DriverDocument_verificationStatus_idx" ON "public"."DriverDocument"("verificationStatus" ASC);

-- CreateIndex
CREATE INDEX "DriverLanguage_code_idx" ON "public"."DriverLanguage"("code" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "DriverLanguage_driverId_code_key" ON "public"."DriverLanguage"("driverId" ASC, "code" ASC);

-- CreateIndex
CREATE INDEX "DriverLanguage_driverId_idx" ON "public"."DriverLanguage"("driverId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "DriverPushDevice_driverId_deviceId_key" ON "public"."DriverPushDevice"("driverId" ASC, "deviceId" ASC);

-- CreateIndex
CREATE INDEX "DriverPushDevice_driverId_idx" ON "public"."DriverPushDevice"("driverId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "DriverPushDevice_token_key" ON "public"."DriverPushDevice"("token" ASC);

-- CreateIndex
CREATE INDEX "DriverRequestEvent_bookingId_idx" ON "public"."DriverRequestEvent"("bookingId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "DriverRequestEvent_driverId_bookingId_key" ON "public"."DriverRequestEvent"("driverId" ASC, "bookingId" ASC);

-- CreateIndex
CREATE INDEX "DriverRequestEvent_driverId_createdAt_idx" ON "public"."DriverRequestEvent"("driverId" ASC, "createdAt" ASC);

-- CreateIndex
CREATE INDEX "DriverRequestEvent_driverId_outcome_outcomeAt_idx" ON "public"."DriverRequestEvent"("driverId" ASC, "outcome" ASC, "outcomeAt" ASC);

-- CreateIndex
CREATE INDEX "DriverRequestEvent_outcome_idx" ON "public"."DriverRequestEvent"("outcome" ASC);

-- CreateIndex
CREATE INDEX "DriverRequestEvent_tripId_idx" ON "public"."DriverRequestEvent"("tripId" ASC);

-- CreateIndex
CREATE INDEX "DriverReview_bookingId_idx" ON "public"."DriverReview"("bookingId" ASC);

-- CreateIndex
CREATE INDEX "DriverReview_createdAt_idx" ON "public"."DriverReview"("createdAt" ASC);

-- CreateIndex
CREATE INDEX "DriverReview_customerId_idx" ON "public"."DriverReview"("customerId" ASC);

-- CreateIndex
CREATE INDEX "DriverReview_driverId_idx" ON "public"."DriverReview"("driverId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "DriverReview_tripId_key" ON "public"."DriverReview"("tripId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "DriverSettings_driverId_key" ON "public"."DriverSettings"("driverId" ASC);

-- CreateIndex
CREATE INDEX "DriverShiftSession_driverId_status_idx" ON "public"."DriverShiftSession"("driverId" ASC, "status" ASC);

-- CreateIndex
CREATE INDEX "DriverShiftSession_status_startedAt_idx" ON "public"."DriverShiftSession"("status" ASC, "startedAt" ASC);

-- CreateIndex
CREATE INDEX "DriverVehicle_deletedAt_idx" ON "public"."DriverVehicle"("deletedAt" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "DriverVehicle_driverId_key" ON "public"."DriverVehicle"("driverId" ASC);

-- CreateIndex
CREATE INDEX "DriverVehicle_licensePlate_idx" ON "public"."DriverVehicle"("licensePlate" ASC);

-- CreateIndex
CREATE INDEX "DriverVehicle_vehicleCategoryId_idx" ON "public"."DriverVehicle"("vehicleCategoryId" ASC);

-- CreateIndex
CREATE INDEX "DriverVehicleLuggageCapacity_luggageTypeId_idx" ON "public"."DriverVehicleLuggageCapacity"("luggageTypeId" ASC);

-- CreateIndex
CREATE INDEX "DriverVehicleLuggageCapacity_vehicleId_idx" ON "public"."DriverVehicleLuggageCapacity"("vehicleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "DriverVehicleLuggageCapacity_vehicleId_luggageTypeId_key" ON "public"."DriverVehicleLuggageCapacity"("vehicleId" ASC, "luggageTypeId" ASC);

-- CreateIndex
CREATE INDEX "EmailVerificationToken_userId_idx" ON "public"."EmailVerificationToken"("userId" ASC);

-- CreateIndex
CREATE INDEX "ExtraService_deletedAt_idx" ON "public"."ExtraService"("deletedAt" ASC);

-- CreateIndex
CREATE INDEX "ExtraService_isActive_idx" ON "public"."ExtraService"("isActive" ASC);

-- CreateIndex
CREATE INDEX "ExtraService_sortOrder_idx" ON "public"."ExtraService"("sortOrder" ASC);

-- CreateIndex
CREATE INDEX "ExtraService_type_idx" ON "public"."ExtraService"("type" ASC);

-- CreateIndex
CREATE INDEX "HelpTicket_category_idx" ON "public"."HelpTicket"("category" ASC);

-- CreateIndex
CREATE INDEX "HelpTicket_createdAt_idx" ON "public"."HelpTicket"("createdAt" ASC);

-- CreateIndex
CREATE INDEX "HelpTicket_deletedAt_idx" ON "public"."HelpTicket"("deletedAt" ASC);

-- CreateIndex
CREATE INDEX "HelpTicket_ownerType_ownerId_idx" ON "public"."HelpTicket"("ownerType" ASC, "ownerId" ASC);

-- CreateIndex
CREATE INDEX "HelpTicket_priority_idx" ON "public"."HelpTicket"("priority" ASC);

-- CreateIndex
CREATE INDEX "HelpTicket_status_idx" ON "public"."HelpTicket"("status" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "HelpTicket_ticketNumber_key" ON "public"."HelpTicket"("ticketNumber" ASC);

-- CreateIndex
CREATE INDEX "HelpTicketEvent_createdAt_idx" ON "public"."HelpTicketEvent"("createdAt" ASC);

-- CreateIndex
CREATE INDEX "HelpTicketEvent_ticketId_idx" ON "public"."HelpTicketEvent"("ticketId" ASC);

-- CreateIndex
CREATE INDEX "HelpTicketMessage_createdAt_idx" ON "public"."HelpTicketMessage"("createdAt" ASC);

-- CreateIndex
CREATE INDEX "HelpTicketMessage_ticketId_idx" ON "public"."HelpTicketMessage"("ticketId" ASC);

-- CreateIndex
CREATE INDEX "LuggageType_isActive_idx" ON "public"."LuggageType"("isActive" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Notification_idempotencyKey_key" ON "public"."Notification"("idempotencyKey" ASC);

-- CreateIndex
CREATE INDEX "Notification_recipientType_recipientId_createdAt_idx" ON "public"."Notification"("recipientType" ASC, "recipientId" ASC, "createdAt" ASC);

-- CreateIndex
CREATE INDEX "Notification_recipientType_recipientId_readAt_idx" ON "public"."Notification"("recipientType" ASC, "recipientId" ASC, "readAt" ASC);

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "public"."PasswordResetToken"("userId" ASC);

-- CreateIndex
CREATE INDEX "Payment_createdAt_idx" ON "public"."Payment"("createdAt" ASC);

-- CreateIndex
CREATE INDEX "Payment_purpose_idx" ON "public"."Payment"("purpose" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_purpose_referenceId_key" ON "public"."Payment"("purpose" ASC, "referenceId" ASC);

-- CreateIndex
CREATE INDEX "Payment_referenceId_idx" ON "public"."Payment"("referenceId" ASC);

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "public"."Payment"("status" ASC);

-- CreateIndex
CREATE INDEX "Payment_transactionId_idx" ON "public"."Payment"("transactionId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_transactionId_key" ON "public"."Payment"("transactionId" ASC);

-- CreateIndex
CREATE INDEX "PaymentOutboxEvent_createdAt_idx" ON "public"."PaymentOutboxEvent"("createdAt" ASC);

-- CreateIndex
CREATE INDEX "PaymentOutboxEvent_publishedAt_idx" ON "public"."PaymentOutboxEvent"("publishedAt" ASC);

-- CreateIndex
CREATE INDEX "PaymentWebhookEvent_processedAt_idx" ON "public"."PaymentWebhookEvent"("processedAt" ASC);

-- CreateIndex
CREATE INDEX "Payout_createdAt_idx" ON "public"."Payout"("createdAt" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Payout_idempotencyKey_key" ON "public"."Payout"("idempotencyKey" ASC);

-- CreateIndex
CREATE INDEX "Payout_payoutNumber_idx" ON "public"."Payout"("payoutNumber" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Payout_payoutNumber_key" ON "public"."Payout"("payoutNumber" ASC);

-- CreateIndex
CREATE INDEX "Payout_recipientType_recipientId_createdAt_idx" ON "public"."Payout"("recipientType" ASC, "recipientId" ASC, "createdAt" ASC);

-- CreateIndex
CREATE INDEX "Payout_recipientType_recipientId_status_idx" ON "public"."Payout"("recipientType" ASC, "recipientId" ASC, "status" ASC);

-- CreateIndex
CREATE INDEX "Payout_status_idx" ON "public"."Payout"("status" ASC);

-- CreateIndex
CREATE INDEX "PayoutEvent_createdAt_idx" ON "public"."PayoutEvent"("createdAt" ASC);

-- CreateIndex
CREATE INDEX "PayoutEvent_event_idx" ON "public"."PayoutEvent"("event" ASC);

-- CreateIndex
CREATE INDEX "PayoutEvent_payoutId_idx" ON "public"."PayoutEvent"("payoutId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Permission_key_key" ON "public"."Permission"("key" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Role_key_key" ON "public"."Role"("key" ASC);

-- CreateIndex
CREATE INDEX "Session_deviceId_idx" ON "public"."Session"("deviceId" ASC);

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "public"."Session"("userId" ASC);

-- CreateIndex
CREATE INDEX "Subscription_audience_referenceId_status_idx" ON "public"."Subscription"("audience" ASC, "referenceId" ASC, "status" ASC);

-- CreateIndex
CREATE INDEX "Subscription_createdAt_idx" ON "public"."Subscription"("createdAt" ASC);

-- CreateIndex
CREATE INDEX "Subscription_currentPeriodEnd_idx" ON "public"."Subscription"("currentPeriodEnd" ASC);

-- CreateIndex
CREATE INDEX "Subscription_pendingPlanId_idx" ON "public"."Subscription"("pendingPlanId" ASC);

-- CreateIndex
CREATE INDEX "Subscription_planId_idx" ON "public"."Subscription"("planId" ASC);

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "public"."Subscription"("status" ASC);

-- CreateIndex
CREATE INDEX "SubscriptionEvent_subscriptionId_createdAt_idx" ON "public"."SubscriptionEvent"("subscriptionId" ASC, "createdAt" ASC);

-- CreateIndex
CREATE INDEX "SubscriptionEvent_type_idx" ON "public"."SubscriptionEvent"("type" ASC);

-- CreateIndex
CREATE INDEX "SubscriptionPeriod_planId_idx" ON "public"."SubscriptionPeriod"("planId" ASC);

-- CreateIndex
CREATE INDEX "SubscriptionPeriod_subscriptionId_periodStart_idx" ON "public"."SubscriptionPeriod"("subscriptionId" ASC, "periodStart" ASC);

-- CreateIndex
CREATE INDEX "SubscriptionPlan_audience_idx" ON "public"."SubscriptionPlan"("audience" ASC);

-- CreateIndex
CREATE INDEX "SubscriptionPlan_createdAt_idx" ON "public"."SubscriptionPlan"("createdAt" ASC);

-- CreateIndex
CREATE INDEX "SubscriptionPlan_isActive_idx" ON "public"."SubscriptionPlan"("isActive" ASC);

-- CreateIndex
CREATE INDEX "SubscriptionPlan_sortOrder_idx" ON "public"."SubscriptionPlan"("sortOrder" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Trip_bookingId_key" ON "public"."Trip"("bookingId" ASC);

-- CreateIndex
CREATE INDEX "Trip_completedAt_idx" ON "public"."Trip"("completedAt" ASC);

-- CreateIndex
CREATE INDEX "Trip_createdAt_idx" ON "public"."Trip"("createdAt" ASC);

-- CreateIndex
CREATE INDEX "Trip_deletedAt_idx" ON "public"."Trip"("deletedAt" ASC);

-- CreateIndex
CREATE INDEX "Trip_driverId_idx" ON "public"."Trip"("driverId" ASC);

-- CreateIndex
CREATE INDEX "Trip_startedAt_idx" ON "public"."Trip"("startedAt" ASC);

-- CreateIndex
CREATE INDEX "Trip_status_idx" ON "public"."Trip"("status" ASC);

-- CreateIndex
CREATE INDEX "Trip_vehicleId_idx" ON "public"."Trip"("vehicleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Trip_watchToken_key" ON "public"."Trip"("watchToken" ASC);

-- CreateIndex
CREATE INDEX "TripEvent_actorUserId_idx" ON "public"."TripEvent"("actorUserId" ASC);

-- CreateIndex
CREATE INDEX "TripEvent_createdAt_idx" ON "public"."TripEvent"("createdAt" ASC);

-- CreateIndex
CREATE INDEX "TripEvent_event_idx" ON "public"."TripEvent"("event" ASC);

-- CreateIndex
CREATE INDEX "TripEvent_tripId_idx" ON "public"."TripEvent"("tripId" ASC);

-- CreateIndex
CREATE INDEX "TripLocationPoint_driverId_recordedAt_idx" ON "public"."TripLocationPoint"("driverId" ASC, "recordedAt" ASC);

-- CreateIndex
CREATE INDEX "TripLocationPoint_tripId_recordedAt_idx" ON "public"."TripLocationPoint"("tripId" ASC, "recordedAt" ASC);

-- CreateIndex
CREATE INDEX "TripReview_bookingId_idx" ON "public"."TripReview"("bookingId" ASC);

-- CreateIndex
CREATE INDEX "TripReview_createdAt_idx" ON "public"."TripReview"("createdAt" ASC);

-- CreateIndex
CREATE INDEX "TripReview_driverId_idx" ON "public"."TripReview"("driverId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "TripReview_tripId_key" ON "public"."TripReview"("tripId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email" ASC);

-- CreateIndex
CREATE INDEX "VehicleCategory_deletedAt_idx" ON "public"."VehicleCategory"("deletedAt" ASC);

-- CreateIndex
CREATE INDEX "VehicleCategory_isActive_idx" ON "public"."VehicleCategory"("isActive" ASC);

-- CreateIndex
CREATE INDEX "VehicleCategoryLuggageCapacity_categoryId_idx" ON "public"."VehicleCategoryLuggageCapacity"("categoryId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "VehicleCategoryLuggageCapacity_categoryId_luggageTypeId_key" ON "public"."VehicleCategoryLuggageCapacity"("categoryId" ASC, "luggageTypeId" ASC);

-- CreateIndex
CREATE INDEX "VehicleCategoryLuggageCapacity_luggageTypeId_idx" ON "public"."VehicleCategoryLuggageCapacity"("luggageTypeId" ASC);

-- CreateIndex
CREATE INDEX "VehicleCategoryPricing_vehicleCategoryId_minimumDistance_ma_idx" ON "public"."VehicleCategoryPricing"("vehicleCategoryId" ASC, "minimumDistance" ASC, "maximumDistance" ASC);

-- CreateIndex
CREATE INDEX "VehicleCategoryPricing_vehicleCategoryId_status_minimumDist_idx" ON "public"."VehicleCategoryPricing"("vehicleCategoryId" ASC, "status" ASC, "minimumDistance" ASC);

-- CreateIndex
CREATE INDEX "Wallet_ownerId_idx" ON "public"."Wallet"("ownerId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_ownerType_ownerId_key" ON "public"."Wallet"("ownerType" ASC, "ownerId" ASC);

-- CreateIndex
CREATE INDEX "WalletTransaction_bookingId_idx" ON "public"."WalletTransaction"("bookingId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "WalletTransaction_payoutId_key" ON "public"."WalletTransaction"("payoutId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "WalletTransaction_tripId_key" ON "public"."WalletTransaction"("tripId" ASC);

-- CreateIndex
CREATE INDEX "WalletTransaction_type_idx" ON "public"."WalletTransaction"("type" ASC);

-- CreateIndex
CREATE INDEX "WalletTransaction_walletId_createdAt_idx" ON "public"."WalletTransaction"("walletId" ASC, "createdAt" ASC);

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_acceptedOfferId_fkey" FOREIGN KEY ("acceptedOfferId") REFERENCES "public"."BookingOffer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_vehicleCategoryId_fkey" FOREIGN KEY ("vehicleCategoryId") REFERENCES "public"."VehicleCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BookingLuggage" ADD CONSTRAINT "BookingLuggage_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BookingLuggage" ADD CONSTRAINT "BookingLuggage_luggageTypeId_fkey" FOREIGN KEY ("luggageTypeId") REFERENCES "public"."LuggageType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BookingOffer" ADD CONSTRAINT "BookingOffer_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BookingOffer" ADD CONSTRAINT "BookingOffer_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BookingOffer" ADD CONSTRAINT "BookingOffer_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "public"."DriverVehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatMessage" ADD CONSTRAINT "ChatMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "public"."Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatMessage" ADD CONSTRAINT "ChatMessage_replyToMessageId_fkey" FOREIGN KEY ("replyToMessageId") REFERENCES "public"."ChatMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatMessage" ADD CONSTRAINT "ChatMessage_senderUserId_fkey" FOREIGN KEY ("senderUserId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatMessageReceipt" ADD CONSTRAINT "ChatMessageReceipt_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "public"."ChatMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatMessageReceipt" ADD CONSTRAINT "ChatMessageReceipt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConversationParticipant" ADD CONSTRAINT "ConversationParticipant_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "public"."Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConversationParticipant" ADD CONSTRAINT "ConversationParticipant_lastReadMessageId_fkey" FOREIGN KEY ("lastReadMessageId") REFERENCES "public"."ChatMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ConversationParticipant" ADD CONSTRAINT "ConversationParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Customer" ADD CONSTRAINT "Customer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CustomerPushDevice" ADD CONSTRAINT "CustomerPushDevice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CustomerSettings" ADD CONSTRAINT "CustomerSettings_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Driver" ADD CONSTRAINT "Driver_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriverBankAccount" ADD CONSTRAINT "DriverBankAccount_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriverBookingDecline" ADD CONSTRAINT "DriverBookingDecline_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriverBookingDecline" ADD CONSTRAINT "DriverBookingDecline_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriverDeleteRequest" ADD CONSTRAINT "DriverDeleteRequest_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriverDocument" ADD CONSTRAINT "DriverDocument_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriverLanguage" ADD CONSTRAINT "DriverLanguage_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriverPushDevice" ADD CONSTRAINT "DriverPushDevice_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriverRequestEvent" ADD CONSTRAINT "DriverRequestEvent_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriverRequestEvent" ADD CONSTRAINT "DriverRequestEvent_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriverRequestEvent" ADD CONSTRAINT "DriverRequestEvent_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "public"."Trip"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriverReview" ADD CONSTRAINT "DriverReview_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "public"."Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriverReview" ADD CONSTRAINT "DriverReview_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriverReview" ADD CONSTRAINT "DriverReview_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "public"."Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriverSettings" ADD CONSTRAINT "DriverSettings_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriverShiftSession" ADD CONSTRAINT "DriverShiftSession_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriverVehicle" ADD CONSTRAINT "DriverVehicle_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriverVehicle" ADD CONSTRAINT "DriverVehicle_vehicleCategoryId_fkey" FOREIGN KEY ("vehicleCategoryId") REFERENCES "public"."VehicleCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriverVehicleLuggageCapacity" ADD CONSTRAINT "DriverVehicleLuggageCapacity_luggageTypeId_fkey" FOREIGN KEY ("luggageTypeId") REFERENCES "public"."LuggageType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriverVehicleLuggageCapacity" ADD CONSTRAINT "DriverVehicleLuggageCapacity_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "public"."DriverVehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailVerificationToken" ADD CONSTRAINT "EmailVerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HelpTicketEvent" ADD CONSTRAINT "HelpTicketEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HelpTicketEvent" ADD CONSTRAINT "HelpTicketEvent_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "public"."HelpTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HelpTicketMessage" ADD CONSTRAINT "HelpTicketMessage_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HelpTicketMessage" ADD CONSTRAINT "HelpTicketMessage_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "public"."HelpTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payout" ADD CONSTRAINT "Payout_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PayoutEvent" ADD CONSTRAINT "PayoutEvent_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "public"."Payout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "public"."Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Subscription" ADD CONSTRAINT "Subscription_pendingPlanId_fkey" FOREIGN KEY ("pendingPlanId") REFERENCES "public"."SubscriptionPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."SubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SubscriptionEvent" ADD CONSTRAINT "SubscriptionEvent_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "public"."Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SubscriptionPeriod" ADD CONSTRAINT "SubscriptionPeriod_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."SubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SubscriptionPeriod" ADD CONSTRAINT "SubscriptionPeriod_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "public"."Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Trip" ADD CONSTRAINT "Trip_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Trip" ADD CONSTRAINT "Trip_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Trip" ADD CONSTRAINT "Trip_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "public"."DriverVehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TripEvent" ADD CONSTRAINT "TripEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TripEvent" ADD CONSTRAINT "TripEvent_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "public"."Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TripLocationPoint" ADD CONSTRAINT "TripLocationPoint_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TripLocationPoint" ADD CONSTRAINT "TripLocationPoint_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "public"."Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TripReview" ADD CONSTRAINT "TripReview_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TripReview" ADD CONSTRAINT "TripReview_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "public"."Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VehicleCategoryLuggageCapacity" ADD CONSTRAINT "VehicleCategoryLuggageCapacity_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."VehicleCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VehicleCategoryLuggageCapacity" ADD CONSTRAINT "VehicleCategoryLuggageCapacity_luggageTypeId_fkey" FOREIGN KEY ("luggageTypeId") REFERENCES "public"."LuggageType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VehicleCategoryPricing" ADD CONSTRAINT "VehicleCategoryPricing_vehicleCategoryId_fkey" FOREIGN KEY ("vehicleCategoryId") REFERENCES "public"."VehicleCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WalletTransaction" ADD CONSTRAINT "WalletTransaction_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "public"."Payout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WalletTransaction" ADD CONSTRAINT "WalletTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "public"."Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
