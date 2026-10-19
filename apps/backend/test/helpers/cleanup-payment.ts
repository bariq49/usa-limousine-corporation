import type { PrismaService } from "../../src/infrastructure/database/prisma.service";

function isMissingTableError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2021"
  );
}

async function deleteManySafe(run: () => Promise<unknown>): Promise<void> {
  try {
    await run();
  } catch (error) {
    if (isMissingTableError(error)) {
      return;
    }
    throw error;
  }
}

export async function cleanupPaymentTables(prisma: PrismaService): Promise<void> {
  await deleteManySafe(() => prisma.paymentOutboxEvent.deleteMany());
  await deleteManySafe(() => prisma.paymentWebhookEvent.deleteMany());
  await deleteManySafe(() => prisma.payment.deleteMany());
}

export async function cleanupWalletTables(prisma: PrismaService): Promise<void> {
  await deleteManySafe(() => prisma.walletTransaction.deleteMany());
  await deleteManySafe(() => prisma.wallet.deleteMany());
}

export async function cleanupBookingAndTripTables(prisma: PrismaService): Promise<void> {
  await deleteManySafe(() => prisma.notification.deleteMany());
  await deleteManySafe(() => prisma.tripEvent.deleteMany());
  await deleteManySafe(() => prisma.trip.deleteMany());
  await deleteManySafe(() => prisma.booking.updateMany({ data: { acceptedOfferId: null } }));
  await deleteManySafe(() => prisma.bookingOffer.deleteMany());
  await deleteManySafe(() => prisma.bookingLuggage.deleteMany());
  await deleteManySafe(() => prisma.booking.deleteMany());
  await deleteManySafe(() => prisma.bookingSequence.deleteMany());
}
