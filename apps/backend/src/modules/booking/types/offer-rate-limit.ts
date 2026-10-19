export type OfferRateBucket = "seek" | "quote" | "accept" | "list";

export type Consume = {
  bucket: OfferRateBucket;
  key: string;
  limit: number;
  windowSeconds?: number;
};
