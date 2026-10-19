import { ConsoleLogger, Injectable, type LogLevel } from "@nestjs/common";
import type { PrintMessagesParams, ShouldSilenceLogParams } from "../types/logger.types";

const APP_LOGGER_CONTEXT = "USALimousineCorporation";
const SILENCED_LOG_CONTEXTS = new Set([
  "NestFactory",
  "InstanceLoader",
  "RoutesResolver",
  "RouterExplorer",
  "NestApplication",
]);

@Injectable()
export class AppLogger extends ConsoleLogger {
  constructor() {
    super(APP_LOGGER_CONTEXT);
  }

  protected override printMessages(
    messages: unknown[],
    context?: string,
    logLevel?: LogLevel,
    writeStreamType?: "stdout" | "stderr",
  ): void {
    this.print({ messages, context, logLevel, writeStreamType });
  }

  private print(params: PrintMessagesParams): void {
    const { messages, context, logLevel, writeStreamType } = params;

    if (this.shouldSilence({ context, logLevel })) {
      return;
    }

    super.printMessages(messages, context, logLevel, writeStreamType);
  }

  private shouldSilence(params: ShouldSilenceLogParams): boolean {
    const { context, logLevel } = params;

    if (logLevel !== undefined && logLevel !== "log") {
      return false;
    }

    return Boolean(context && SILENCED_LOG_CONTEXTS.has(context));
  }
}
