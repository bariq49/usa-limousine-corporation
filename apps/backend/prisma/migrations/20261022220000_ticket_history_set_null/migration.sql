-- DropForeignKey
ALTER TABLE "HelpTicketEvent" DROP CONSTRAINT "HelpTicketEvent_actorUserId_fkey";

-- DropForeignKey
ALTER TABLE "HelpTicketMessage" DROP CONSTRAINT "HelpTicketMessage_authorUserId_fkey";

-- AlterTable
ALTER TABLE "HelpTicketEvent" ALTER COLUMN "actorUserId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "HelpTicketMessage" ALTER COLUMN "authorUserId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "HelpTicketMessage" ADD CONSTRAINT "HelpTicketMessage_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpTicketEvent" ADD CONSTRAINT "HelpTicketEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

