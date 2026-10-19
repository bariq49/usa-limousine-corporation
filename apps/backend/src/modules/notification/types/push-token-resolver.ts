import type { RecipientType } from "./notification";

export interface TokenResolver {
  readonly recipientType: RecipientType;
  resolveToken(recipientId: string): Promise<string[]>;
  resolveTokens(recipientIds: string[]): Promise<Map<string, string[]>>;
  invalidateTokens(tokens: string[]): Promise<number>;
}
