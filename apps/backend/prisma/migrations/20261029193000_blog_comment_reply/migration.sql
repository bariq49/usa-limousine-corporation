-- AlterTable
ALTER TABLE "BlogComment" ADD COLUMN "replyContent" TEXT;
ALTER TABLE "BlogComment" ADD COLUMN "repliedAt" TIMESTAMP(3);
