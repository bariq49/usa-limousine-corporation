import type { Driver } from "@/lib/types/drivers";

export type CompletionItem = {
  key: string;
  label: string;
  done: boolean;
  /** Higher weight = more impact on the score. */
  weight: number;
};

function hasText(value?: string | null) {
  return Boolean(value?.trim());
}

function hasNumber(value?: number | null) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

/** Industrial profile completeness: required onboarding + professional enrichment. */
export function getProfileCompletion(driver?: Driver | null) {
  if (!driver) {
    return {
      percentage: 0,
      completedCount: 0,
      totalCount: 0,
      items: [] as CompletionItem[],
      missing: [] as CompletionItem[],
    };
  }

  const shift = driver.shift?.toUpperCase();
  // Flexible (or unset) needs no hours; Day/Night require both times.
  const shiftHoursOk =
    !shift || shift === "FLEXIBLE" || (hasText(driver.startTime) && hasText(driver.endTime));

  const items: CompletionItem[] = [
    // Required application foundation
    {
      key: "personal",
      label: "Personal info",
      done: Boolean(
        driver.onboardingPersonal ||
        (hasText(driver.firstName) && hasText(driver.lastName) && hasText(driver.email)),
      ),
      weight: 2,
    },
    {
      key: "emailVerified",
      label: "Email verified",
      done: Boolean(driver.onboardingEmailVerified),
      weight: 2,
    },
    {
      key: "phone",
      label: "Phone number",
      done: hasText(driver.phone) || hasText(driver.phoneNumber),
      weight: 1,
    },
    {
      key: "address",
      label: "Home address",
      done:
        hasText(driver.homeAddress) ||
        (hasText(driver.streetName) && hasText(driver.city) && hasText(driver.postalCode)),
      weight: 1,
    },
    {
      key: "workDetails",
      label: "Work & licensing",
      done: Boolean(
        driver.onboardingDetails ||
        (hasText(driver.kvkNo) && Boolean(driver.licenseExpiry) && Boolean(driver.shift)),
      ),
      weight: 2,
    },
    {
      key: "shiftHours",
      label: "Shift hours",
      done: shiftHoursOk,
      weight: 1,
    },
    {
      key: "vehicle",
      label: "Vehicle details",
      done: Boolean(driver.onboardingVehicle || driver.vehicle),
      weight: 2,
    },
    {
      key: "documents",
      label: "Documents uploaded",
      done: Boolean(
        driver.onboardingDocuments ||
        (Array.isArray(driver.documents) && driver.documents.length > 0),
      ),
      weight: 2,
    },
    // Professional enrichment (admin quality score)
    {
      key: "about",
      label: "About",
      done: hasText(driver.about),
      weight: 1,
    },
    {
      key: "experience",
      label: "Years of experience",
      done: hasNumber(driver.yearsExperience),
      weight: 1,
    },
    {
      key: "avatar",
      label: "Profile photo",
      done: hasText(driver.avatarUrl),
      weight: 1,
    },
    {
      key: "languages",
      label: "Languages",
      done: Array.isArray(driver.languages) && driver.languages.length > 0,
      weight: 1,
    },
    {
      key: "services",
      label: "Services",
      done: Array.isArray(driver.services) && driver.services.length > 0,
      weight: 1,
    },
  ];

  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  const earnedWeight = items
    .filter((item) => item.done)
    .reduce((sum, item) => sum + item.weight, 0);

  const percentage = totalWeight === 0 ? 0 : Math.round((earnedWeight / totalWeight) * 100);
  const missing = items.filter((item) => !item.done);

  return {
    percentage,
    completedCount: items.filter((item) => item.done).length,
    totalCount: items.length,
    items,
    missing,
  };
}
