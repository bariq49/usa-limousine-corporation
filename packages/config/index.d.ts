export type PlatformAddress = {
  readonly city: string;
  readonly region: string;
  readonly postalCode: string;
  readonly country: string;
  readonly display: string;
};

export type PlatformContact = {
  readonly email: string;
  readonly emailHref: string;
  readonly phone: string;
  readonly phoneE164: string;
  readonly phoneHref: string;
  readonly whatsappHref: string;
  readonly address: PlatformAddress;
  readonly operatingHours: string;
  readonly availability: string;
};

export type PlatformSocial = {
  readonly facebook: string;
  readonly instagram: string;
  readonly tiktok: string;
  readonly linkedin: string;
  readonly pinterest: string;
  readonly x: string;
  readonly youtube: string;
};

export type PlatformLocale = {
  readonly timezone: string;
  readonly locale: string;
  readonly currency: string;
  readonly currencySymbol: string;
  readonly distanceUnit: string;
  readonly distanceUnitShort: string;
};

export type Platform = {
  readonly name: string;
  readonly shortName: string;
  readonly description: string;
  readonly contact: PlatformContact;
  readonly social: PlatformSocial;
  readonly locale: PlatformLocale;
};

export declare const PLATFORM: Platform;
