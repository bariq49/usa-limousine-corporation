-- Rename the customer setting; keeps each customer's current choice.
ALTER TABLE "CustomerSettings" RENAME COLUMN "inbox" TO "notification";
