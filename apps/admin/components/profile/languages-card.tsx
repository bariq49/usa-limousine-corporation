"use client";

import { Web } from "@usa-limousine-corporation/ui/svg";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@usa-limousine-corporation/ui/components/card";
import React from "react";
import * as Flags from "country-flag-icons/react/3x2";
import type { Driver, Language } from "@/lib/types/drivers";

export interface LanguagesCardProps {
  driver?: Driver | null | undefined;
}

const langToCountry: Record<string, keyof typeof Flags> = {
  en: "GB",
  nl: "NL",
  tr: "TR",
  ar: "SA",
  de: "DE",
  fr: "FR",
  es: "ES",
  it: "IT",
  pt: "PT",
  pl: "PL",
  ro: "RO",
  bg: "BG",
  ru: "RU",
  uk: "UA",
  ur: "PK",
  hi: "IN",
  bn: "BD",
  zh: "CN",
  ja: "JP",
  ko: "KR",
  fa: "IR",
  ku: "IQ",
  so: "SO",
  ti: "ER",
  am: "ET",
  sw: "KE",
  sq: "AL",
  sr: "RS",
  hr: "HR",
  bs: "BA",
  el: "GR",
  hu: "HU",
  cs: "CZ",
  sk: "SK",
  sv: "SE",
  da: "DK",
  no: "NO",
  fi: "FI",
  he: "IL",
  id: "ID",
  th: "TH",
  vi: "VN",
  tl: "PH",
  pa: "IN",
  ps: "AF",
  ne: "NP",
  si: "LK",
  ta: "LK",
  te: "IN",
  ml: "IN",
  gu: "IN",
  mr: "IN",
  kn: "IN",
};

const getLanguageName = (code: string) => {
  try {
    return new Intl.DisplayNames(["en"], { type: "language" }).of(code);
  } catch {
    return code.toUpperCase();
  }
};

const LanguageFlag = ({ code }: { code: string }) => {
  const countryCode = langToCountry[code.toLowerCase()] || code.toUpperCase();
  const FlagIcon = Flags[countryCode as keyof typeof Flags];

  return (
    <div className="flex items-center justify-center shrink-0">
      {FlagIcon ? (
        <FlagIcon className="w-6 h-4 rounded-[2px] object-cover shadow-xs border border-black/10" />
      ) : (
        <Web className="h-5 w-5 text-default-500" />
      )}
    </div>
  );
};

export function LanguagesCard({ driver }: LanguagesCardProps) {
  const languages = driver?.languages || [];

  if (languages.length === 0) {
    return null;
  }

  return (
    <Card className="h-full w-full shadow-xs border border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 -ml-2">
          <Web className="h-6 w-6 text-primary" />
          <CardTitle className="text-lg font-semibold text-default-900">Languages</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <ul className="space-y-4">
          {languages.map((lang: Language) => (
            <li key={lang.id} className="flex items-center gap-3">
              <div className="flex w-[120px] shrink-0 items-center gap-2">
                <LanguageFlag code={lang.code} />
                <span className="text-sm font-semibold text-default-800">
                  {getLanguageName(lang.code) || lang.name || lang.code.toUpperCase()}:
                </span>
              </div>
              <span className="min-w-0 flex-1 break-words text-sm text-default-700 capitalize">
                {lang.fluency.toLowerCase()}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
