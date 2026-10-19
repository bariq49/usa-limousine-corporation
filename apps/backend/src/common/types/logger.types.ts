import type { LogLevel } from "@nestjs/common";

export type PrintMessagesParams = {
  messages: unknown[];
  context?: string | undefined;
  logLevel?: LogLevel | undefined;
  writeStreamType?: "stdout" | "stderr" | undefined;
};

export type ShouldSilenceLogParams = {
  context?: string | undefined;
  logLevel?: LogLevel | undefined;
};
