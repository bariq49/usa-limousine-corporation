import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function isLocationMatch(targetLocation: string | undefined, locationName: string): boolean {
  if (!targetLocation) {
    return false;
  }
  if (targetLocation === "/") {
    return locationName === "/";
  }
  return locationName === targetLocation || locationName.startsWith(`${targetLocation}/`);
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
