-- Remove legacy available-feed timeout (marketplace uses paymentTimeoutMin / offer TTLs).
ALTER TABLE "PlatformSettings" DROP COLUMN IF EXISTS "timeoutMin";
