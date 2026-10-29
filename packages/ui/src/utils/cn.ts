import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function isLocationMatch(
  targetLocation: string | undefined,
  locationName: string,
  candidates?: readonly (string | undefined)[],
): boolean {
  if (!targetLocation) {
    return false;
  }
  if (targetLocation === "/") {
    return locationName === "/";
  }

  const matches = (href: string) =>
    locationName === href || locationName.startsWith(`${href}/`);

  if (!matches(targetLocation)) {
    return false;
  }
  if (candidates?.length) {
    const hasMoreSpecific = candidates.some(
      (href) =>
        Boolean(href) &&
        href !== targetLocation &&
        (href?.length ?? 0) > targetLocation.length &&
        matches(href as string),
    );
    if (hasMoreSpecific) {
      return false;
    }
  }

  return true;
}

export function getDynamicPath(pathname: string): string {
  return pathname;
}

type DefinedPartial<T> = {
  [K in keyof T]?: Exclude<T[K], undefined>;
};

export function omitUndefined<T extends Record<string, unknown>>(obj: T): DefinedPartial<T> {
  const next: DefinedPartial<T> = {};
  for (const key of Object.keys(obj) as (keyof T)[]) {
    const value = obj[key];
    if (value !== undefined) {
      next[key] = value as Exclude<T[keyof T], undefined>;
    }
  }
  return next;
}
