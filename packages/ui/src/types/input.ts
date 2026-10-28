import type { InputHTMLAttributes, ReactNode } from "react";

export type InputType =
  | "text"
  | "email"
  | "number"
  | "tel"
  | "phone"
  | "password"
  | "date"
  | "time"
  | "checkbox"
  | "switch"
  | "radio"
  | "select"
  | "multiselect"
  | "textarea"
  | "upload"
  | "location"
  | "counter";

export type InputOption = {
  label: ReactNode;
  value: string;
};

export type CheckboxSize = "xs" | "sm" | "md" | "lg" | "xl";
export type SwitchSize = "sm" | "md" | "lg";
export type RadioSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  name?: string;
  label?: ReactNode;
  type?: InputType;
  inputClassName?: string;
  checkboxSize?: CheckboxSize;
  switchSize?: SwitchSize;
  radioSize?: RadioSize;
  options?: InputOption[];
  rows?: number;
  onUpload?: ((file: File) => Promise<string>) | undefined;
  /** Location inputs only: offers "Use my location" in the suggestions panel. */
  onUseCurrentLocation?: (() => Promise<void> | void) | undefined;
  maxSizeMB?: number | undefined;
  hint?: string | undefined;
  disablePast?: boolean;
  /** Earliest selectable day (YYYY-MM-DD) for `date` fields. */
  minDate?: string | undefined;
  /** Icon shown inside the field on the left. */
  icon?: ReactNode;
  /** Store `select` values as numbers instead of strings. */
  valueAsNumber?: boolean;
}

// Short aliases
export type Type = InputType;
export type Option = InputOption;
export type Props = InputProps;
