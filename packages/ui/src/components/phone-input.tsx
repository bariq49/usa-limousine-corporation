"use client";

import ReactPhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { cn } from "../utils/cn";

export const DEFAULT_PHONE_COUNTRY = "us";

export interface PhoneInputProps {
  value?: string | undefined;
  onChange: (value: string) => void;
  onBlur?: (() => void) | undefined;
  name?: string | undefined;
  disabled?: boolean | undefined;
  hasError?: boolean | undefined;
  country?: string | undefined;
  className?: string | undefined;
}

export function PhoneInput({
  value,
  onChange,
  onBlur,
  name,
  disabled,
  hasError,
  country = DEFAULT_PHONE_COUNTRY,
  className,
}: PhoneInputProps) {
  return (
    <ReactPhoneInput
      country={country}
      value={value || ""}
      // Emit E.164 ("+17324706452"); a bare dial code means the field is empty.
      onChange={(phone, data) => {
        const dialCode = "dialCode" in data ? data.dialCode : "";
        onChange(phone && phone !== dialCode ? `+${phone}` : "");
      }}
      onBlur={() => onBlur?.()}
      disabled={Boolean(disabled)}
      isValid={!hasError}
      countryCodeEditable={false}
      inputProps={{ name }}
      containerClass={cn("!w-full", className)}
      inputClass={cn(
        "!w-full !h-12 sm:!h-10 !pl-12 !pr-3 !text-sm !bg-card !text-default-500 !rounded-md !border",
        "2xl:!h-12 2xl:!text-base",
        hasError ? "!border-destructive" : "!border-default-300",
        "focus:!border-primary focus:!outline-none focus:!shadow-none",
        "disabled:!cursor-not-allowed disabled:!opacity-50",
      )}
      buttonClass={cn(
        "!border !bg-card !rounded-l-md [&_.selected-flag]:!bg-transparent [&_.selected-flag]:!rounded-l-md",
        hasError ? "!border-destructive" : "!border-default-300",
      )}
      dropdownClass="!z-[99999] !text-sm"
    />
  );
}
