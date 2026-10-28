"use client";

import * as React from "react";
import { type ControllerRenderProps, type FieldValues, useFormContext } from "react-hook-form";
import { cva } from "class-variance-authority";
import { Check, ChevronDown, Eye, EyeOff } from "../svg";
import { cn } from "../utils/cn";
import { Badge } from "./badge";
import { Checkbox } from "./checkbox";
import { Counter } from "./counter";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import { DatePicker } from "./date-picker";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "./form";
import { LocationInput } from "./location-input";
import { PhoneInput } from "./phone-input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { RadioGroup, RadioGroupItem } from "./radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Switch } from "./switch";
import { TimePicker } from "./time-picker";
import { Upload, type UploadProps } from "./upload";

const fieldBaseClasses =
  "w-full rounded-md border border-default-300 bg-card px-3 text-sm text-default-500 transition duration-300 read-only:bg-background placeholder:text-accent-foreground/50 focus:outline-hidden focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 disabled:focus:border-default-300 disabled:focus:outline-none read-only:focus:border-default-300 read-only:focus:outline-none read-only:cursor-default";

const labelBaseClasses =
  "absolute top-2 z-10 origin-[0] -translate-y-5 scale-75 transform bg-card px-2 text-base text-default-600 duration-300 start-1 sm:text-sm group-focus-within:top-2 group-focus-within:-translate-y-5 group-focus-within:scale-75 group-focus-within:px-2 group-focus-within:bg-card 2xl:text-base group-has-[[placeholder]:placeholder-shown]:top-1/2 group-has-[[placeholder]:placeholder-shown]:-translate-y-1/2 group-has-[[placeholder]:placeholder-shown]:scale-100 group-has-[[placeholder]:placeholder-shown]:bg-transparent";

const labelTextareaClasses =
  "absolute top-2 z-10 origin-[0] -translate-y-5 scale-75 transform bg-card px-2 text-base text-default-600 duration-300 start-1 sm:text-sm group-focus-within:top-2 group-focus-within:-translate-y-5 group-focus-within:scale-75 group-focus-within:px-2 group-focus-within:bg-card 2xl:text-base group-has-[[placeholder]:placeholder-shown]:top-4 group-has-[[placeholder]:placeholder-shown]:translate-y-0 group-has-[[placeholder]:placeholder-shown]:scale-100 group-has-[[placeholder]:placeholder-shown]:bg-transparent";

export const inputVariants = cva("", {
  variants: {
    element: {
      input: cn(
        fieldBaseClasses,
        "h-12 read-only:leading-[48px] sm:h-10 sm:read-only:leading-10 2xl:h-12 2xl:text-base 2xl:read-only:leading-[48px]",
      ),
      textarea: cn(
        fieldBaseClasses,
        "min-h-[80px] resize-y pb-[10px] pt-7 2xl:min-h-[96px] 2xl:text-base",
      ),
      label: labelBaseClasses,
      labelTextarea: labelTextareaClasses,
    },
  },
  defaultVariants: {
    element: "input",
  },
});

import type {
  CheckboxSize,
  InputOption,
  InputProps,
  InputType,
  Option,
  Props,
  RadioSize,
  SwitchSize,
  Type,
} from "../types/input";

export type {
  CheckboxSize,
  InputOption,
  InputProps,
  InputType,
  Option,
  Props,
  RadioSize,
  SwitchSize,
  Type,
};

export function Input(props: InputProps) {
  const {
    name,
    type = "text",
    label,
    placeholder,
    disabled = false,
    className,
    inputClassName,
    checkboxSize = "sm",
    switchSize = "sm",
    radioSize = "md",
    options = [],
    rows = 4,
    onUpload,
    onUseCurrentLocation,
    maxSizeMB,
    hint,
    disablePast = false,
    minDate,
    icon,
    valueAsNumber = false,
    onChange: onChangeProp,
    ...inputProps
  } = props;
  const showIcon = Boolean(icon) && type !== "date" && type !== "time" && type !== "counter";
  const [showPassword, setShowPassword] = React.useState(false);
  const resolvedPlaceholder = placeholder ?? (label ? "\u00a0" : undefined);
  const isFloatingSelect =
    type === "select" || type === "multiselect" || type === "date" || type === "time";

  if (!name) {
    if (type === "upload") {
      return (
        <div className={cn("group relative", label && "pt-1.5", className)}>
          <Upload
            value={(props.value ?? "") as string}
            onChange={onChangeProp as unknown as UploadProps["onChange"]}
            onUpload={onUpload}
            accept={props.accept}
            maxSizeMB={maxSizeMB}
            hint={hint}
            disabled={disabled}
            placeholder={placeholder}
            className={inputClassName}
          />
          {label ? (
            <label
              className={cn(
                inputVariants({ element: "label" }),
                "top-2 -translate-y-5 scale-75 bg-card px-2 pointer-events-none",
              )}
            >
              {label}
            </label>
          ) : null}
        </div>
      );
    }

    if (type === "textarea") {
      return (
        <textarea
          rows={rows}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(inputVariants({ element: "textarea" }), inputClassName, className)}
          {...(inputProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      );
    }

    return (
      <input
        type={type}
        disabled={disabled}
        placeholder={placeholder}
        className={cn(inputVariants({ element: "input" }), inputClassName, className)}
        onChange={onChangeProp}
        {...inputProps}
      />
    );
  }

  const { control } = useFormContext();

  const renderInput = (field: ControllerRenderProps<FieldValues, string>, hasError: boolean) => {
    const fieldClassName = cn(
      inputVariants({ element: "input" }),
      showIcon && "ps-10",
      hasError && "border-destructive focus:border-destructive",
      inputClassName,
    );
    const selectFieldClassName = cn(
      fieldClassName,
      "cursor-pointer read-only:cursor-pointer !bg-white shadow-none focus:ring-0 [&>svg]:stroke-default-600",
    );

    switch (type) {
      case "checkbox":
        return (
          <Checkbox
            size={checkboxSize}
            className={cn(
              "mt-[1px] border-default-300",
              hasError && "border-destructive",
              inputClassName,
            )}
            disabled={disabled}
            checked={!!field.value}
            onCheckedChange={(checked) => field.onChange(checked === true)}
            id={field.name}
          >
            {label}
          </Checkbox>
        );
      case "switch":
        return (
          <div className="flex items-center gap-2">
            <Switch
              size={switchSize}
              disabled={disabled}
              checked={!!field.value}
              onCheckedChange={field.onChange}
              id={field.name}
            />
            {label ? (
              <FormLabel
                htmlFor={field.name}
                className="cursor-pointer font-normal text-default-600"
              >
                {label}
              </FormLabel>
            ) : null}
          </div>
        );
      case "radio":
        return (
          <RadioGroup
            value={field.value ?? ""}
            onValueChange={field.onChange}
            disabled={disabled}
            className={inputClassName}
          >
            {options.map((option) => (
              <RadioGroupItem
                key={option.value}
                value={option.value}
                id={`${field.name}-${option.value}`}
                size={radioSize}
              >
                {option.label}
              </RadioGroupItem>
            ))}
          </RadioGroup>
        );
      case "date":
        return (
          <FormControl>
            <DatePicker
              value={field.value ?? ""}
              onChange={field.onChange}
              placeholder={placeholder}
              disabled={disabled}
              error={hasError}
              className={cn(selectFieldClassName, hasError && "border-destructive")}
              disablePast={disablePast}
              minDate={minDate}
            />
          </FormControl>
        );
      case "time":
        return (
          <FormControl>
            <TimePicker
              value={field.value ?? ""}
              onChange={field.onChange}
              placeholder={placeholder}
              disabled={disabled}
              error={hasError}
              className={cn(selectFieldClassName, hasError && "border-destructive")}
            />
          </FormControl>
        );
      case "select":
        return (
          <Select
            value={field.value === undefined || field.value === null ? "" : String(field.value)}
            onValueChange={(value) => field.onChange(valueAsNumber ? Number(value) : value)}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger className={cn(selectFieldClassName, hasError && "border-destructive")}>
                <SelectValue placeholder={placeholder ?? "Select an option"} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "multiselect": {
        const selectedValues = new Set(Array.isArray(field.value) ? (field.value as string[]) : []);
        const toggleValue = (value: string) => {
          const next = new Set(selectedValues);
          if (next.has(value)) {
            next.delete(value);
          } else {
            next.add(value);
          }
          field.onChange(Array.from(next));
        };
        return (
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <button
                  type="button"
                  disabled={disabled}
                  className={cn(
                    selectFieldClassName,
                    "flex h-auto min-h-12 items-center justify-between gap-2 py-2 text-left sm:min-h-10 2xl:min-h-12",
                    !selectedValues.size && "text-default-400",
                  )}
                >
                  <div className="flex flex-1 flex-wrap gap-1">
                    {selectedValues.size ? (
                      options
                        .filter((option) => selectedValues.has(option.value))
                        .map((option) => (
                          <Badge key={option.value} color="secondary" className="font-normal">
                            {option.label}
                          </Badge>
                        ))
                    ) : (
                      <span>{placeholder ?? "Select options"}</span>
                    )}
                  </div>
                  <ChevronDown className="h-5 w-5 shrink-0" />
                </button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search..." />
                <CommandList>
                  <CommandEmpty>No options found.</CommandEmpty>
                  <CommandGroup>
                    {options.map((option) => {
                      const isSelected = selectedValues.has(option.value);
                      return (
                        <CommandItem
                          key={option.value}
                          value={String(option.label)}
                          onSelect={() => toggleValue(option.value)}
                        >
                          <Check
                            className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")}
                          />
                          {option.label}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        );
      }
      case "textarea":
        return (
          <textarea
            {...(inputProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            {...field}
            value={field.value ?? ""}
            rows={rows}
            placeholder={resolvedPlaceholder ?? ""}
            disabled={disabled}
            className={cn(
              inputVariants({ element: "textarea" }),
              "peer",
              hasError && "border-destructive",
              inputClassName,
            )}
          />
        );

      case "phone":
        return (
          <PhoneInput
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            name={field.name}
            disabled={disabled}
            hasError={hasError}
            className={inputClassName}
          />
        );
      case "location":
        return (
          <LocationInput
            value={field.value ?? ""}
            onChange={field.onChange}
            placeholder={resolvedPlaceholder}
            className={fieldClassName}
            onUseCurrentLocation={onUseCurrentLocation}
          />
        );
      case "counter":
        return (
          <Counter
            value={Number(field.value ?? 0)}
            onChange={field.onChange}
            min={Number(props.min ?? 0)}
            max={Number(props.max ?? 999)}
            step={Number(props.step ?? 1)}
            disabled={disabled}
            hasError={hasError}
            className={inputClassName}
          />
        );
      case "upload":
        return (
          <Upload
            value={field.value ?? ""}
            onChange={field.onChange}
            onUpload={onUpload}
            accept={props.accept}
            maxSizeMB={maxSizeMB}
            hint={hint}
            disabled={disabled}
            placeholder={placeholder}
            hasError={hasError}
            className={inputClassName}
          />
        );
      default:
        return (
          <input
            {...inputProps}
            {...field}
            value={field.value ?? ""}
            type={type === "password" && showPassword ? "text" : type}
            placeholder={resolvedPlaceholder ?? ""}
            disabled={disabled}
            className={cn(fieldClassName, "peer")}
            onChange={(event) => {
              field.onChange(event);
              onChangeProp?.(event);
            }}
          />
        );
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      rules={{ required: props.required ? "This field is required" : false }}
      render={({ field, fieldState }) => {
        const hasError = !!fieldState.error;
        const isEmptyValue = !field.value;

        if (type === "checkbox" || type === "switch") {
          return (
            <FormItem className={cn("flex items-center space-y-0", className)}>
              <FormControl>{renderInput(field, hasError)}</FormControl>
            </FormItem>
          );
        }

        if (type === "radio") {
          return (
            <FormItem className={cn("space-y-2", className)}>
              {label ? (
                <FormLabel className="text-sm font-medium text-default-600">{label}</FormLabel>
              ) : null}
              <FormControl>{renderInput(field, hasError)}</FormControl>
              <FormMessage />
            </FormItem>
          );
        }

        const isMultiselectEmpty =
          type === "multiselect" && (!Array.isArray(field.value) || field.value.length === 0);
        const treatAsEmpty = isEmptyValue || isMultiselectEmpty;
        // A label stays floated when a placeholder is shown under it.
        const isDateOrTime = type === "date" || type === "time";
        const alwaysFloated =
          type === "select" ||
          type === "multiselect" ||
          type === "upload" ||
          type === "phone" ||
          Boolean(label && placeholder && (!isFloatingSelect || isDateOrTime));
        const pickerLabelFloated =
          "group-has-[[data-picker-open]]:top-2 group-has-[[data-picker-open]]:-translate-y-5 group-has-[[data-picker-open]]:scale-75 group-has-[[data-picker-open]]:bg-card group-has-[[data-picker-open]]:px-2 group-has-[[data-picker-filled]]:top-2 group-has-[[data-picker-filled]]:-translate-y-5 group-has-[[data-picker-filled]]:scale-75 group-has-[[data-picker-filled]]:bg-card group-has-[[data-picker-filled]]:px-2 group-focus-within:top-2 group-focus-within:-translate-y-5 group-focus-within:scale-75 group-focus-within:bg-card group-focus-within:px-2";

        return (
          <FormItem
            className={cn(
              "space-y-0",
              (isFloatingSelect || type === "upload") && "cursor-pointer",
              type === "upload" && "pt-1.5",
              className,
            )}
          >
            <div
              className={cn(
                "group relative",
                (isFloatingSelect || type === "upload") && "cursor-pointer",
              )}
            >
              {showIcon ? (
                <span
                  className={cn(
                    "pointer-events-none absolute start-3 z-10 text-default-400",
                    type === "textarea" ? "top-3" : "top-1/2 -translate-y-1/2",
                  )}
                >
                  {icon}
                </span>
              ) : null}
              {isDateOrTime ? (
                renderInput(field, hasError)
              ) : (
                <FormControl>{renderInput(field, hasError)}</FormControl>
              )}
              {label ? (
                <FormLabel
                  className={cn(
                    inputVariants({ element: type === "textarea" ? "labelTextarea" : "label" }),
                    (!treatAsEmpty || alwaysFloated) &&
                      "top-2 -translate-y-5 scale-75 bg-card px-2",
                    alwaysFloated && "pointer-events-none bg-card",
                    label &&
                      placeholder &&
                      !isFloatingSelect &&
                      "group-has-[[placeholder]:placeholder-shown]:top-2 group-has-[[placeholder]:placeholder-shown]:-translate-y-5 group-has-[[placeholder]:placeholder-shown]:scale-75 group-has-[[placeholder]:placeholder-shown]:bg-card",
                    isDateOrTime &&
                      treatAsEmpty &&
                      !placeholder &&
                      cn(
                        "pointer-events-none top-1/2 -translate-y-1/2 scale-100 bg-transparent pe-10",
                        pickerLabelFloated,
                      ),
                    isDateOrTime && !treatAsEmpty && "pointer-events-none bg-card",
                  )}
                >
                  {label}
                </FormLabel>
              ) : null}
              {type === "password" ? (
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute top-1/2 -translate-y-1/2 cursor-pointer ltr:right-4 rtl:left-4"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-default-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-default-400" />
                  )}
                </button>
              ) : null}
            </div>
          </FormItem>
        );
      }}
    />
  );
}
