-- Add FK from ConversationParticipant.lastReadMessageId → ChatMessage.id
CREATE INDEX IF NOT EXISTS "ConversationParticipant_lastReadMessageId_idx"
  ON "ConversationParticipant"("lastReadMessageId");

ALTER TABLE "ConversationParticipant"
  ADD CONSTRAINT "ConversationParticipant_lastReadMessageId_fkey"
  FOREIGN KEY ("lastReadMessageId") REFERENCES "ChatMessage"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
