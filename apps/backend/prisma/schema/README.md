# Prisma Schema Organization

This folder splits the Prisma data model by domain so the schema can scale without turning into one oversized file. The database structure does not change when models are moved between files inside the same Prisma schema directory.

## Responsibilities

- `schema.prisma`
  Contains only the `generator` and `datasource` blocks.
- `schema/users.prisma`
  Owns the `User` model.
- `schema/roles.prisma`
  Owns role and permission access-control definitions: `RoleKey`, `Role`, `Permission`, `UserRole`, and `RolePermission`.
- `schema/auth.prisma`
  Owns authentication and session persistence: `Session`, `EmailVerificationToken`, and `PasswordResetToken`.
- `schema/audit.prisma`
  Owns security and authentication audit history: `AuditLog`.
- `schema/shared.prisma`
  Reserved for shared enums, reusable Prisma types, and cross-domain infrastructure models when they do not belong cleanly to a single business domain.
- `schema/driver.prisma`
  Owns driver profiles, vehicles, compliance documents, and verification enums.
- `schema/vehicle.prisma`
  Owns vehicle category lookup records, passenger/bag counts, and typed luggage capacity.
- `schema/booking.prisma`
  Owns standalone Booking / BookingSequence Prisma models (linked to Trip execution; Nest booking module at `modules/booking/`).
- `schema/trip.prisma`
  Owns driver trip execution lifecycle (`Trip`, `TripEvent`) linked to Booking, Driver, and DriverVehicle; Nest module at `modules/trip/`.
- `schema/payment.prisma`
  Owns the `Payment` record: one per booking, with the Square order and payment ids, card details and status.
- `schema/notification.prisma`
  Owns in-app notification inbox rows for drivers and users (`Notification`, recipient/type enums); Nest module at `modules/notification/`.
- `schema/wallets.prisma`
  Owns wallet balance and trip-credit transaction history (`Wallet`, `WalletTransaction`, `WalletOwnerType`); Nest module at `modules/wallet/`.
- `schema/payouts.prisma`
  Owns polymorphic payout requests and lifecycle events (`Payout`, `PayoutEvent`, `PayoutSequence`) keyed by `WalletOwnerType` + `recipientId` (same pattern as wallet); Nest module at `modules/payout/`. See `apps/backend/docs/websocket-events.md` and `apps/backend/docs/firebase-notifications.md`.

## Naming Conventions

- One `.prisma` file per domain.
- Keep domain-owned models together and avoid mixing unrelated concepts.
- Put shared enums or reusable types in `shared.prisma` only when more than one domain depends on them.
- Keep table mappings, indexes, constraints, and relations with the model that owns them.

## Organization Rule

Every new business domain should receive its own Prisma file as soon as it owns multiple models or a distinct bounded context. This keeps schema reviews focused, reduces merge conflicts, and makes long-term ownership clearer as the platform grows.
- `schema/settings.prisma`
  Owns platform-wide pricing rules: `PlatformSettings` (single `global` row) and `NoticeUnit`.
