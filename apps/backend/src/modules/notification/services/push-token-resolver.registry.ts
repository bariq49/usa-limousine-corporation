import { Injectable } from "@nestjs/common";
import type { RecipientType } from "../types/notification";
import type { TokenResolver } from "../types/push-token-resolver";

@Injectable()
export class TokenResolverRegistry {
  private readonly resolvers = new Map<RecipientType, TokenResolver>();

  register(resolver: TokenResolver): void {
    this.resolvers.set(resolver.recipientType, resolver);
  }

  get(recipientType: RecipientType): TokenResolver | undefined {
    return this.resolvers.get(recipientType);
  }

  all(): TokenResolver[] {
    return Array.from(this.resolvers.values());
  }

  async invalidateAll(tokens: string[]): Promise<number> {
    if (tokens.length === 0) {
      return 0;
    }
    let cleared = 0;
    for (const resolver of this.resolvers.values()) {
      cleared += await resolver.invalidateTokens(tokens);
    }
    return cleared;
  }
}
