-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'REFUNDED';
ALTER TYPE "NotificationType" ADD VALUE 'BOOKING_CANCELLED';

-- AlterTable
ALTER TABLE "PlatformSettings" ADD COLUMN "cancellationNotice" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN "cancellationNoticeUnit" "NoticeUnit" NOT NULL DEFAULT 'HOUR',
ADD COLUMN "cancellationRefundRate" DECIMAL(5,2) NOT NULL DEFAULT 100;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN "refundedAmount" DECIMAL(12,2),
ADD COLUMN "refundedAt" TIMESTAMP(3),
ADD COLUMN "squareRefundId" TEXT;
