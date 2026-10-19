export type Checkout = {
  successUrl: string;
  cancelUrl: string;
};

export type CheckoutOptions = {
  successPath?: string;
  cancelPath?: string;
  successUrl?: string;
  cancelUrl?: string;
};
