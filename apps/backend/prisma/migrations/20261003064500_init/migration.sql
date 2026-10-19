-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('DRAFT', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BookingType" AS ENUM ('ONE_WAY', 'RETURN', 'HOURLY', 'CREW_RIDE');

-- CreateEnum
CREATE TYPE "CalendarEventType" AS ENUM ('BOOKING', 'SHIFT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "CalendarEventStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CalendarOwnerType" AS ENUM ('DRIVER', 'PASSENGER', 'AGENCY');

-- CreateEnum
CREATE TYPE "DriverStatus" AS ENUM ('INVITED', 'PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DriverShift" AS ENUM ('DAY', 'NIGHT', 'FLEXIBLE');

-- CreateEnum
CREATE TYPE "DriverPresenceStatus" AS ENUM ('OFFLINE', 'ONLINE');

-- CreateEnum
CREATE TYPE "DriverShiftSessionStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "DriverShiftEndedReason" AS ENUM ('DRIVER', 'ADMIN', 'WINDOW_ENDED', 'HEARTBEAT_TIMEOUT', 'DEVICE_TAKEOVER');

-- CreateEnum
CREATE TYPE "DriverOnboardingStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'DOCUMENTS_PENDING', 'UNDER_REVIEW', 'COMPLETED');

-- CreateEnum
CREATE TYPE "DriverApprovalStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "DriverDocumentType" AS ENUM ('CHAUFFEUR_FRONT', 'CHAUFFEUR_BACK', 'KIWA_PERMIT', 'LICENSE_FRONT', 'LICENSE_BACK', 'NATIONAL_ID_FRONT', 'NATIONAL_ID_BACK', 'AIRPORT_STA_PASS', 'CAR_REGISTRATION', 'CAR_FRONT', 'CAR_BACK', 'CAR_LEFT', 'CAR_RIGHT', 'CAR_INSIDE', 'LICENSE_PLATE', 'INSURANCE');

-- CreateEnum
CREATE TYPE "DriverDocumentVerificationStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "DriverLanguageFluency" AS ENUM ('FLUENT', 'CONVERSATIONAL', 'NORMAL');

-- CreateEnum
CREATE TYPE "DriverDeleteStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "HelpTicketStatus" AS ENUM ('PENDING', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "HelpTicketCategory" AS ENUM ('ACCOUNT', 'PAYMENTS', 'TRIPS', 'VEHICLE', 'DOCUMENTS', 'APP', 'PASSENGER_NO_SHOW', 'FLAT_TIRE', 'OTHER');

-- CreateEnum
CREATE TYPE "HelpTicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "HelpTicketEventType" AS ENUM ('CREATED', 'STATUS_CHANGED', 'PRIORITY_CHANGED', 'MESSAGE_ADDED');

-- CreateEnum
CREATE TYPE "NotificationRecipientType" AS ENUM ('DRIVER', 'USER');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('BOOKING_AVAILABLE', 'BOOKING_UNAVAILABLE', 'TRIP_ACCEPTED', 'TRIP_STATUS_UPDATED', 'TRIP_COMPLETED', 'TRIP_CANCELLED', 'TICKET_STATUS_UPDATED', 'TICKET_REPLY', 'TICKET_RESOLVED', 'WALLET_CREDITED', 'APPLICATION_UNDER_REVIEW', 'APPLICATION_APPROVED', 'SUBSCRIPTION_ACTIVATED', 'SUBSCRIPTION_TRIAL_ENDING', 'SUBSCRIPTION_PAYMENT_FAILED', 'SUBSCRIPTION_PAST_DUE', 'SUBSCRIPTION_EXPIRED', 'SUBSCRIPTION_PLAN_CHANGED', 'SUBSCRIPTION_CANCEL_SCHEDULED', 'SUBSCRIPTION_RESUMED', 'PAYOUT_SUBMITTED', 'PAYOUT_APPROVED', 'PAYOUT_PAID', 'PAYOUT_REJECTED', 'PAYOUT_CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'CANCELLED', 'PARTIALLY_REFUNDED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentPurpose" AS ENUM ('BOOKING', 'DRIVER_SUBSCRIPTION', 'AGENCY_SUBSCRIPTION');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'APPROVED', 'PROCESSING', 'PAID', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PayoutLifecycleEvent" AS ENUM ('CREATED', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PROCESSING', 'PAID', 'CANCELLED', 'RECONCILED');

-- CreateEnum
CREATE TYPE "RoleKey" AS ENUM ('SUPER_ADMIN', 'EMPLOYEE', 'AGENCY_OWNER', 'AGENCY_STAFF', 'DRIVER', 'CUSTOMER', 'BUSINESS_CUSTOMER', 'VIP_CUSTOMER');

-- CreateEnum
CREATE TYPE "ExtraServiceType" AS ENUM ('CHILD_SEAT', 'MEET_AND_GREET', 'EXTRA');

-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('TEST', 'LIVE');

-- CreateEnum
CREATE TYPE "Audience" AS ENUM ('DRIVER', 'AGENCY');

-- CreateEnum
CREATE TYPE "SubscriptionInterval" AS ENUM ('MONTH', 'YEAR');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('INCOMPLETE', 'TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('ACCEPTED', 'STARTED', 'ARRIVED_AT_PICKUP', 'PASSENGER_ON_BOARD', 'EN_ROUTE_TO_DROPOFF', 'ARRIVED_AT_DROPOFF', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TripEventType" AS ENUM ('ACCEPTED', 'STARTED', 'ARRIVED_AT_PICKUP', 'PASSENGER_ON_BOARD', 'EN_ROUTE_TO_DROPOFF', 'ARRIVED_AT_DROPOFF', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PricingType" AS ENUM ('FIXED', 'PER_UNIT', 'PERCENTAGE');

-- CreateEnum
CREATE TYPE "PricingStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "WalletOwnerType" AS ENUM ('DRIVER');

-- CreateEnum
CREATE TYPE "WalletTransactionType" AS ENUM ('TRIP_CREDIT', 'PAYOUT_DEBIT');

-- CreateTable
CREATE TABLE "AuditLog" (
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
CREATE TABLE "Session" (
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
CREATE TABLE "EmailVerificationToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailVerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingSequence" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "lastValue" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingSequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "vehicleCategoryId" TEXT NOT NULL,
    "bookingNumber" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'DRAFT',
    "bookingType" "BookingType" NOT NULL DEFAULT 'ONE_WAY',
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

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingLuggage" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "luggageTypeId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "BookingLuggage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarEvent" (
    "id" TEXT NOT NULL,
    "ownerType" "CalendarOwnerType" NOT NULL,
    "ownerId" TEXT NOT NULL,
    "bookingId" TEXT,
    "bookingType" "BookingType",
    "type" "CalendarEventType" NOT NULL DEFAULT 'BOOKING',
    "status" "CalendarEventStatus" NOT NULL DEFAULT 'SCHEDULED',
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
CREATE TABLE "Driver" (
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
    "shift" "DriverShift" NOT NULL DEFAULT 'FLEXIBLE',
    "startTime" TEXT,
    "endTime" TEXT,
    "dressesInSuit" BOOLEAN NOT NULL DEFAULT false,
    "services" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "DriverStatus" NOT NULL DEFAULT 'PENDING',
    "onboardingStatus" "DriverOnboardingStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "approvalStatus" "DriverApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "onboardingPersonal" BOOLEAN NOT NULL DEFAULT false,
    "onboardingEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "onboardingDetails" BOOLEAN NOT NULL DEFAULT false,
    "onboardingVehicle" BOOLEAN NOT NULL DEFAULT false,
    "onboardingDocuments" BOOLEAN NOT NULL DEFAULT false,
    "presenceStatus" "DriverPresenceStatus" NOT NULL DEFAULT 'OFFLINE',
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

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriverDeleteRequest" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "reason" TEXT,
    "status" "DriverDeleteStatus" NOT NULL DEFAULT 'PENDING',
    "processedAt" TIMESTAMP(3),
    "processedBy" TEXT,
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverDeleteRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriverBookingDecline" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DriverBookingDecline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriverLanguage" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "fluency" "DriverLanguageFluency" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverLanguage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriverShiftSession" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "status" "DriverShiftSessionStatus" NOT NULL DEFAULT 'OPEN',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "durationSeconds" INTEGER,
    "extraSeconds" INTEGER,
    "shiftType" "DriverShift" NOT NULL,
    "scheduledStartTime" TEXT,
    "scheduledEndTime" TEXT,
    "timezone" TEXT NOT NULL,
    "endedReason" "DriverShiftEndedReason",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverShiftSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriverSettings" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "emailNotification" BOOLEAN NOT NULL DEFAULT true,
    "pushNotification" BOOLEAN NOT NULL DEFAULT true,
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Amsterdam',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriverBankAccount" (
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
CREATE TABLE "DriverApplicationSequence" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "lastValue" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverApplicationSequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriverVehicle" (
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
CREATE TABLE "DriverVehicleLuggageCapacity" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "luggageTypeId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverVehicleLuggageCapacity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriverDocument" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "documentType" "DriverDocumentType" NOT NULL,
    "fileId" TEXT,
    "publicId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "originalName" TEXT,
    "mimeType" TEXT,
    "size" INTEGER,
    "expiryDate" TIMESTAMP(3),
    "verificationStatus" "DriverDocumentVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "DriverDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HelpTicketSequence" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "lastValue" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HelpTicketSequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HelpTicket" (
    "id" TEXT NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "attachment" TEXT,
    "category" "HelpTicketCategory" NOT NULL DEFAULT 'OTHER',
    "status" "HelpTicketStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "HelpTicketPriority" NOT NULL DEFAULT 'MEDIUM',
    "resolvedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "HelpTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HelpTicketMessage" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HelpTicketMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HelpTicketEvent" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "event" "HelpTicketEventType" NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "previousStatus" "HelpTicketStatus",
    "newStatus" "HelpTicketStatus",
    "previousPriority" "HelpTicketPriority",
    "newPriority" "HelpTicketPriority",
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HelpTicketEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "recipientType" "NotificationRecipientType" NOT NULL,
    "recipientId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "purpose" "PaymentPurpose" NOT NULL DEFAULT 'BOOKING',
    "referenceId" TEXT NOT NULL,
    "transactionId" TEXT,
    "amount" DECIMAL(14,4) NOT NULL,
    "refundedAmount" DECIMAL(14,4) NOT NULL DEFAULT 0,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
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
CREATE TABLE "PaymentWebhookEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentOutboxEvent" (
    "id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentOutboxEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayoutSequence" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "lastValue" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayoutSequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payout" (
    "id" TEXT NOT NULL,
    "payoutNumber" TEXT NOT NULL,
    "recipientType" "WalletOwnerType" NOT NULL,
    "recipientId" TEXT NOT NULL,
    "bankAccountId" TEXT NOT NULL,
    "accountHolderName" TEXT NOT NULL,
    "iban" TEXT NOT NULL,
    "bic" TEXT,
    "bankName" TEXT,
    "amount" DECIMAL(14,4) NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
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
CREATE TABLE "PayoutEvent" (
    "id" TEXT NOT NULL,
    "payoutId" TEXT NOT NULL,
    "event" "PayoutLifecycleEvent" NOT NULL,
    "previousStatus" "PayoutStatus",
    "newStatus" "PayoutStatus",
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PayoutEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "key" "RoleKey" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "ExtraService" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "description" TEXT,
    "price" DECIMAL(12,2) NOT NULL,
    "type" "ExtraServiceType" NOT NULL DEFAULT 'EXTRA',
    "maxQuantity" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ExtraService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformSettings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "paymentMode" "PaymentMode" NOT NULL DEFAULT 'TEST',
    "payoutMin" DECIMAL(14,4) NOT NULL DEFAULT 10,
    "payoutIntervalDays" INTEGER NOT NULL DEFAULT 7,
    "requireSubscription" BOOLEAN NOT NULL DEFAULT false,
    "timeoutMin" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_schema_probe" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "_schema_probe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" TEXT NOT NULL,
    "audience" "Audience" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "interval" "SubscriptionInterval" NOT NULL DEFAULT 'MONTH',
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
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "audience" "Audience" NOT NULL,
    "referenceId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'INCOMPLETE',
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
CREATE TABLE "SubscriptionPeriod" (
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
CREATE TABLE "SubscriptionEvent" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubscriptionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "status" "TripStatus" NOT NULL DEFAULT 'ACCEPTED',
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
CREATE TABLE "TripReview" (
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
CREATE TABLE "TripLocationPoint" (
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
CREATE TABLE "TripEvent" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "event" "TripEventType" NOT NULL,
    "actorUserId" TEXT,
    "previousStatus" "TripStatus",
    "newStatus" "TripStatus",
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TripEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
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
CREATE TABLE "VehicleCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "passengerCount" INTEGER NOT NULL DEFAULT 4,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "VehicleCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LuggageType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "dimensions" TEXT,
    "image" TEXT,
    "price" DECIMAL(12,2),
    "isSpecial" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LuggageType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleCategoryLuggageCapacity" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "luggageTypeId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleCategoryLuggageCapacity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleCategoryPricing" (
    "id" TEXT NOT NULL,
    "vehicleCategoryId" TEXT NOT NULL,
    "minimumDistance" DECIMAL(12,2) NOT NULL,
    "maximumDistance" DECIMAL(12,2),
    "pricingType" "PricingType" NOT NULL,
    "basePrice" DECIMAL(12,2) NOT NULL,
    "perUnitRate" DECIMAL(12,2),
    "percentageRate" DECIMAL(5,2),
    "status" "PricingStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleCategoryPricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "ownerType" "WalletOwnerType" NOT NULL,
    "ownerId" TEXT NOT NULL,
    "balance" DECIMAL(14,4) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletTransaction" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "type" "WalletTransactionType" NOT NULL,
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
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_event_idx" ON "AuditLog"("event");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_deviceId_idx" ON "Session"("deviceId");

-- CreateIndex
CREATE INDEX "EmailVerificationToken_userId_idx" ON "EmailVerificationToken"("userId");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_bookingNumber_key" ON "Booking"("bookingNumber");

-- CreateIndex
CREATE INDEX "Booking_userId_idx" ON "Booking"("userId");

-- CreateIndex
CREATE INDEX "Booking_vehicleCategoryId_idx" ON "Booking"("vehicleCategoryId");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- CreateIndex
CREATE INDEX "Booking_bookingType_idx" ON "Booking"("bookingType");

-- CreateIndex
CREATE INDEX "Booking_deletedAt_idx" ON "Booking"("deletedAt");

-- CreateIndex
CREATE INDEX "BookingLuggage_bookingId_idx" ON "BookingLuggage"("bookingId");

-- CreateIndex
CREATE INDEX "BookingLuggage_luggageTypeId_idx" ON "BookingLuggage"("luggageTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "BookingLuggage_bookingId_luggageTypeId_key" ON "BookingLuggage"("bookingId", "luggageTypeId");

-- CreateIndex
CREATE INDEX "CalendarEvent_ownerType_ownerId_idx" ON "CalendarEvent"("ownerType", "ownerId");

-- CreateIndex
CREATE INDEX "CalendarEvent_ownerType_ownerId_startAt_idx" ON "CalendarEvent"("ownerType", "ownerId", "startAt");

-- CreateIndex
CREATE INDEX "CalendarEvent_bookingId_idx" ON "CalendarEvent"("bookingId");

-- CreateIndex
CREATE INDEX "CalendarEvent_type_idx" ON "CalendarEvent"("type");

-- CreateIndex
CREATE INDEX "CalendarEvent_status_idx" ON "CalendarEvent"("status");

-- CreateIndex
CREATE INDEX "CalendarEvent_deletedAt_idx" ON "CalendarEvent"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarEvent_bookingId_bookingType_key" ON "CalendarEvent"("bookingId", "bookingType");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_userId_key" ON "Driver"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_applicationNumber_key" ON "Driver"("applicationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_stripeCustomerId_key" ON "Driver"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "Driver_status_idx" ON "Driver"("status");

-- CreateIndex
CREATE INDEX "Driver_approvalStatus_idx" ON "Driver"("approvalStatus");

-- CreateIndex
CREATE INDEX "Driver_onboardingStatus_idx" ON "Driver"("onboardingStatus");

-- CreateIndex
CREATE INDEX "Driver_presenceStatus_idx" ON "Driver"("presenceStatus");

-- CreateIndex
CREATE INDEX "Driver_operatingCity_idx" ON "Driver"("operatingCity");

-- CreateIndex
CREATE INDEX "Driver_email_idx" ON "Driver"("email");

-- CreateIndex
CREATE INDEX "Driver_phone_idx" ON "Driver"("phone");

-- CreateIndex
CREATE INDEX "Driver_deletedAt_idx" ON "Driver"("deletedAt");

-- CreateIndex
CREATE INDEX "DriverDeleteRequest_driverId_idx" ON "DriverDeleteRequest"("driverId");

-- CreateIndex
CREATE INDEX "DriverDeleteRequest_status_idx" ON "DriverDeleteRequest"("status");

-- CreateIndex
CREATE INDEX "DriverDeleteRequest_driverId_status_idx" ON "DriverDeleteRequest"("driverId", "status");

-- CreateIndex
CREATE INDEX "DriverDeleteRequest_createdAt_idx" ON "DriverDeleteRequest"("createdAt");

-- CreateIndex
CREATE INDEX "DriverBookingDecline_driverId_idx" ON "DriverBookingDecline"("driverId");

-- CreateIndex
CREATE INDEX "DriverBookingDecline_bookingId_idx" ON "DriverBookingDecline"("bookingId");

-- CreateIndex
CREATE INDEX "DriverBookingDecline_createdAt_idx" ON "DriverBookingDecline"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DriverBookingDecline_driverId_bookingId_key" ON "DriverBookingDecline"("driverId", "bookingId");

-- CreateIndex
CREATE INDEX "DriverLanguage_driverId_idx" ON "DriverLanguage"("driverId");

-- CreateIndex
CREATE INDEX "DriverLanguage_code_idx" ON "DriverLanguage"("code");

-- CreateIndex
CREATE UNIQUE INDEX "DriverLanguage_driverId_code_key" ON "DriverLanguage"("driverId", "code");

-- CreateIndex
CREATE INDEX "DriverShiftSession_driverId_status_idx" ON "DriverShiftSession"("driverId", "status");

-- CreateIndex
CREATE INDEX "DriverShiftSession_status_startedAt_idx" ON "DriverShiftSession"("status", "startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "DriverSettings_driverId_key" ON "DriverSettings"("driverId");

-- CreateIndex
CREATE INDEX "DriverBankAccount_driverId_idx" ON "DriverBankAccount"("driverId");

-- CreateIndex
CREATE INDEX "DriverBankAccount_iban_idx" ON "DriverBankAccount"("iban");

-- CreateIndex
CREATE INDEX "DriverBankAccount_driverId_isDefault_idx" ON "DriverBankAccount"("driverId", "isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "DriverBankAccount_driverId_iban_key" ON "DriverBankAccount"("driverId", "iban");

-- CreateIndex
CREATE UNIQUE INDEX "DriverVehicle_driverId_key" ON "DriverVehicle"("driverId");

-- CreateIndex
CREATE INDEX "DriverVehicle_licensePlate_idx" ON "DriverVehicle"("licensePlate");

-- CreateIndex
CREATE INDEX "DriverVehicle_vehicleCategoryId_idx" ON "DriverVehicle"("vehicleCategoryId");

-- CreateIndex
CREATE INDEX "DriverVehicle_deletedAt_idx" ON "DriverVehicle"("deletedAt");

-- CreateIndex
CREATE INDEX "DriverVehicleLuggageCapacity_vehicleId_idx" ON "DriverVehicleLuggageCapacity"("vehicleId");

-- CreateIndex
CREATE INDEX "DriverVehicleLuggageCapacity_luggageTypeId_idx" ON "DriverVehicleLuggageCapacity"("luggageTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "DriverVehicleLuggageCapacity_vehicleId_luggageTypeId_key" ON "DriverVehicleLuggageCapacity"("vehicleId", "luggageTypeId");

-- CreateIndex
CREATE INDEX "DriverDocument_driverId_idx" ON "DriverDocument"("driverId");

-- CreateIndex
CREATE INDEX "DriverDocument_documentType_idx" ON "DriverDocument"("documentType");

-- CreateIndex
CREATE INDEX "DriverDocument_verificationStatus_idx" ON "DriverDocument"("verificationStatus");

-- CreateIndex
CREATE INDEX "DriverDocument_deletedAt_idx" ON "DriverDocument"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "HelpTicket_ticketNumber_key" ON "HelpTicket"("ticketNumber");

-- CreateIndex
CREATE INDEX "HelpTicket_driverId_idx" ON "HelpTicket"("driverId");

-- CreateIndex
CREATE INDEX "HelpTicket_status_idx" ON "HelpTicket"("status");

-- CreateIndex
CREATE INDEX "HelpTicket_category_idx" ON "HelpTicket"("category");

-- CreateIndex
CREATE INDEX "HelpTicket_priority_idx" ON "HelpTicket"("priority");

-- CreateIndex
CREATE INDEX "HelpTicket_createdAt_idx" ON "HelpTicket"("createdAt");

-- CreateIndex
CREATE INDEX "HelpTicket_deletedAt_idx" ON "HelpTicket"("deletedAt");

-- CreateIndex
CREATE INDEX "HelpTicketMessage_ticketId_idx" ON "HelpTicketMessage"("ticketId");

-- CreateIndex
CREATE INDEX "HelpTicketMessage_createdAt_idx" ON "HelpTicketMessage"("createdAt");

-- CreateIndex
CREATE INDEX "HelpTicketEvent_ticketId_idx" ON "HelpTicketEvent"("ticketId");

-- CreateIndex
CREATE INDEX "HelpTicketEvent_createdAt_idx" ON "HelpTicketEvent"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_recipientType_recipientId_createdAt_idx" ON "Notification"("recipientType", "recipientId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_recipientType_recipientId_readAt_idx" ON "Notification"("recipientType", "recipientId", "readAt");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_transactionId_key" ON "Payment"("transactionId");

-- CreateIndex
CREATE INDEX "Payment_purpose_idx" ON "Payment"("purpose");

-- CreateIndex
CREATE INDEX "Payment_referenceId_idx" ON "Payment"("referenceId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_transactionId_idx" ON "Payment"("transactionId");

-- CreateIndex
CREATE INDEX "Payment_createdAt_idx" ON "Payment"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_purpose_referenceId_key" ON "Payment"("purpose", "referenceId");

-- CreateIndex
CREATE INDEX "PaymentWebhookEvent_processedAt_idx" ON "PaymentWebhookEvent"("processedAt");

-- CreateIndex
CREATE INDEX "PaymentOutboxEvent_publishedAt_idx" ON "PaymentOutboxEvent"("publishedAt");

-- CreateIndex
CREATE INDEX "PaymentOutboxEvent_createdAt_idx" ON "PaymentOutboxEvent"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Payout_payoutNumber_key" ON "Payout"("payoutNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Payout_idempotencyKey_key" ON "Payout"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Payout_recipientType_recipientId_status_idx" ON "Payout"("recipientType", "recipientId", "status");

-- CreateIndex
CREATE INDEX "Payout_recipientType_recipientId_createdAt_idx" ON "Payout"("recipientType", "recipientId", "createdAt");

-- CreateIndex
CREATE INDEX "Payout_status_idx" ON "Payout"("status");

-- CreateIndex
CREATE INDEX "Payout_createdAt_idx" ON "Payout"("createdAt");

-- CreateIndex
CREATE INDEX "Payout_payoutNumber_idx" ON "Payout"("payoutNumber");

-- CreateIndex
CREATE INDEX "PayoutEvent_payoutId_idx" ON "PayoutEvent"("payoutId");

-- CreateIndex
CREATE INDEX "PayoutEvent_event_idx" ON "PayoutEvent"("event");

-- CreateIndex
CREATE INDEX "PayoutEvent_createdAt_idx" ON "PayoutEvent"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Role_key_key" ON "Role"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_key_key" ON "Permission"("key");

-- CreateIndex
CREATE INDEX "ExtraService_isActive_idx" ON "ExtraService"("isActive");

-- CreateIndex
CREATE INDEX "ExtraService_type_idx" ON "ExtraService"("type");

-- CreateIndex
CREATE INDEX "ExtraService_sortOrder_idx" ON "ExtraService"("sortOrder");

-- CreateIndex
CREATE INDEX "ExtraService_deletedAt_idx" ON "ExtraService"("deletedAt");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_audience_idx" ON "SubscriptionPlan"("audience");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_isActive_idx" ON "SubscriptionPlan"("isActive");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_sortOrder_idx" ON "SubscriptionPlan"("sortOrder");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_createdAt_idx" ON "SubscriptionPlan"("createdAt");

-- CreateIndex
CREATE INDEX "Subscription_audience_referenceId_status_idx" ON "Subscription"("audience", "referenceId", "status");

-- CreateIndex
CREATE INDEX "Subscription_planId_idx" ON "Subscription"("planId");

-- CreateIndex
CREATE INDEX "Subscription_pendingPlanId_idx" ON "Subscription"("pendingPlanId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX "Subscription_currentPeriodEnd_idx" ON "Subscription"("currentPeriodEnd");

-- CreateIndex
CREATE INDEX "Subscription_createdAt_idx" ON "Subscription"("createdAt");

-- CreateIndex
CREATE INDEX "SubscriptionPeriod_subscriptionId_periodStart_idx" ON "SubscriptionPeriod"("subscriptionId", "periodStart");

-- CreateIndex
CREATE INDEX "SubscriptionPeriod_planId_idx" ON "SubscriptionPeriod"("planId");

-- CreateIndex
CREATE INDEX "SubscriptionEvent_subscriptionId_createdAt_idx" ON "SubscriptionEvent"("subscriptionId", "createdAt");

-- CreateIndex
CREATE INDEX "SubscriptionEvent_type_idx" ON "SubscriptionEvent"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Trip_bookingId_key" ON "Trip"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "Trip_watchToken_key" ON "Trip"("watchToken");

-- CreateIndex
CREATE INDEX "Trip_driverId_idx" ON "Trip"("driverId");

-- CreateIndex
CREATE INDEX "Trip_vehicleId_idx" ON "Trip"("vehicleId");

-- CreateIndex
CREATE INDEX "Trip_status_idx" ON "Trip"("status");

-- CreateIndex
CREATE INDEX "Trip_createdAt_idx" ON "Trip"("createdAt");

-- CreateIndex
CREATE INDEX "Trip_startedAt_idx" ON "Trip"("startedAt");

-- CreateIndex
CREATE INDEX "Trip_completedAt_idx" ON "Trip"("completedAt");

-- CreateIndex
CREATE INDEX "Trip_deletedAt_idx" ON "Trip"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "TripReview_tripId_key" ON "TripReview"("tripId");

-- CreateIndex
CREATE INDEX "TripReview_driverId_idx" ON "TripReview"("driverId");

-- CreateIndex
CREATE INDEX "TripReview_bookingId_idx" ON "TripReview"("bookingId");

-- CreateIndex
CREATE INDEX "TripReview_createdAt_idx" ON "TripReview"("createdAt");

-- CreateIndex
CREATE INDEX "TripLocationPoint_tripId_recordedAt_idx" ON "TripLocationPoint"("tripId", "recordedAt");

-- CreateIndex
CREATE INDEX "TripLocationPoint_driverId_recordedAt_idx" ON "TripLocationPoint"("driverId", "recordedAt");

-- CreateIndex
CREATE INDEX "TripEvent_tripId_idx" ON "TripEvent"("tripId");

-- CreateIndex
CREATE INDEX "TripEvent_event_idx" ON "TripEvent"("event");

-- CreateIndex
CREATE INDEX "TripEvent_createdAt_idx" ON "TripEvent"("createdAt");

-- CreateIndex
CREATE INDEX "TripEvent_actorUserId_idx" ON "TripEvent"("actorUserId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleCategory_slug_key" ON "VehicleCategory"("slug");

-- CreateIndex
CREATE INDEX "VehicleCategory_isActive_idx" ON "VehicleCategory"("isActive");

-- CreateIndex
CREATE INDEX "VehicleCategory_sortOrder_idx" ON "VehicleCategory"("sortOrder");

-- CreateIndex
CREATE INDEX "VehicleCategory_deletedAt_idx" ON "VehicleCategory"("deletedAt");

-- CreateIndex
CREATE INDEX "LuggageType_isActive_idx" ON "LuggageType"("isActive");

-- CreateIndex
CREATE INDEX "LuggageType_isSpecial_idx" ON "LuggageType"("isSpecial");

-- CreateIndex
CREATE INDEX "VehicleCategoryLuggageCapacity_categoryId_idx" ON "VehicleCategoryLuggageCapacity"("categoryId");

-- CreateIndex
CREATE INDEX "VehicleCategoryLuggageCapacity_luggageTypeId_idx" ON "VehicleCategoryLuggageCapacity"("luggageTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleCategoryLuggageCapacity_categoryId_luggageTypeId_key" ON "VehicleCategoryLuggageCapacity"("categoryId", "luggageTypeId");

-- CreateIndex
CREATE INDEX "VehicleCategoryPricing_vehicleCategoryId_status_minimumDist_idx" ON "VehicleCategoryPricing"("vehicleCategoryId", "status", "minimumDistance");

-- CreateIndex
CREATE INDEX "VehicleCategoryPricing_vehicleCategoryId_minimumDistance_ma_idx" ON "VehicleCategoryPricing"("vehicleCategoryId", "minimumDistance", "maximumDistance");

-- CreateIndex
CREATE INDEX "Wallet_ownerId_idx" ON "Wallet"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_ownerType_ownerId_key" ON "Wallet"("ownerType", "ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "WalletTransaction_tripId_key" ON "WalletTransaction"("tripId");

-- CreateIndex
CREATE UNIQUE INDEX "WalletTransaction_payoutId_key" ON "WalletTransaction"("payoutId");

-- CreateIndex
CREATE INDEX "WalletTransaction_walletId_createdAt_idx" ON "WalletTransaction"("walletId", "createdAt");

-- CreateIndex
CREATE INDEX "WalletTransaction_bookingId_idx" ON "WalletTransaction"("bookingId");

-- CreateIndex
CREATE INDEX "WalletTransaction_type_idx" ON "WalletTransaction"("type");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailVerificationToken" ADD CONSTRAINT "EmailVerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_vehicleCategoryId_fkey" FOREIGN KEY ("vehicleCategoryId") REFERENCES "VehicleCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingLuggage" ADD CONSTRAINT "BookingLuggage_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingLuggage" ADD CONSTRAINT "BookingLuggage_luggageTypeId_fkey" FOREIGN KEY ("luggageTypeId") REFERENCES "LuggageType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverDeleteRequest" ADD CONSTRAINT "DriverDeleteRequest_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverBookingDecline" ADD CONSTRAINT "DriverBookingDecline_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverBookingDecline" ADD CONSTRAINT "DriverBookingDecline_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverLanguage" ADD CONSTRAINT "DriverLanguage_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverShiftSession" ADD CONSTRAINT "DriverShiftSession_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverSettings" ADD CONSTRAINT "DriverSettings_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverBankAccount" ADD CONSTRAINT "DriverBankAccount_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverVehicle" ADD CONSTRAINT "DriverVehicle_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverVehicle" ADD CONSTRAINT "DriverVehicle_vehicleCategoryId_fkey" FOREIGN KEY ("vehicleCategoryId") REFERENCES "VehicleCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverVehicleLuggageCapacity" ADD CONSTRAINT "DriverVehicleLuggageCapacity_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "DriverVehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverVehicleLuggageCapacity" ADD CONSTRAINT "DriverVehicleLuggageCapacity_luggageTypeId_fkey" FOREIGN KEY ("luggageTypeId") REFERENCES "LuggageType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverDocument" ADD CONSTRAINT "DriverDocument_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpTicket" ADD CONSTRAINT "HelpTicket_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpTicketMessage" ADD CONSTRAINT "HelpTicketMessage_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "HelpTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpTicketMessage" ADD CONSTRAINT "HelpTicketMessage_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpTicketEvent" ADD CONSTRAINT "HelpTicketEvent_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "HelpTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpTicketEvent" ADD CONSTRAINT "HelpTicketEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutEvent" ADD CONSTRAINT "PayoutEvent_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "Payout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_pendingPlanId_fkey" FOREIGN KEY ("pendingPlanId") REFERENCES "SubscriptionPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionPeriod" ADD CONSTRAINT "SubscriptionPeriod_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionPeriod" ADD CONSTRAINT "SubscriptionPeriod_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionEvent" ADD CONSTRAINT "SubscriptionEvent_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "DriverVehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripReview" ADD CONSTRAINT "TripReview_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripReview" ADD CONSTRAINT "TripReview_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripLocationPoint" ADD CONSTRAINT "TripLocationPoint_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripLocationPoint" ADD CONSTRAINT "TripLocationPoint_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripEvent" ADD CONSTRAINT "TripEvent_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripEvent" ADD CONSTRAINT "TripEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleCategoryLuggageCapacity" ADD CONSTRAINT "VehicleCategoryLuggageCapacity_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "VehicleCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleCategoryLuggageCapacity" ADD CONSTRAINT "VehicleCategoryLuggageCapacity_luggageTypeId_fkey" FOREIGN KEY ("luggageTypeId") REFERENCES "LuggageType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleCategoryPricing" ADD CONSTRAINT "VehicleCategoryPricing_vehicleCategoryId_fkey" FOREIGN KEY ("vehicleCategoryId") REFERENCES "VehicleCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "Payout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

