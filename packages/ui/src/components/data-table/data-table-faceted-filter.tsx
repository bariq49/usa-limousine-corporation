"use client";

import * as React from "react";
import { Check, PlusCircle } from "lucide-react";
import type { Column } from "@tanstack/react-table";
import { cn } from "../../utils/cn";
import { Badge } from "../badge";
import { Button } from "../button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../command";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { Separator } from "../separator";

export type DataTableFacetedFilterOption = {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
};

type Props<TData, TValue> = {
  column: Column<TData, TValue>;
  title: string;
  options?: DataTableFacetedFilterOption[] | undefined;
  multiple?: boolean | undefined;
  searchable?: boolean | undefined;
};

function toSelectedValues(currentFilter: unknown): Set<string> {
  if (currentFilter == null || currentFilter === "") return new Set();
  if (Array.isArray(currentFilter)) {
    const values: string[] = [];
    for (const value of currentFilter) {
      if (value != null && value !== "") values.push(String(value));
    }
    return new Set(values);
  }
  return new Set([String(currentFilter)]);
}

export function DataTableFacetedFilter<TData, TValue>(props: Props<TData, TValue>) {
  const {
    column,
    title,
    options: optionsProp,
    multiple = true,
    searchable = false,
  } = props;
  const options = optionsProp ?? [];
  const currentFilter = column.getFilterValue();
  const selectedValues = React.useMemo(
    () => toSelectedValues(currentFilter),
    [currentFilter],
  );

  let facets: Map<unknown, number> | undefined;
  try {
    facets = column.getFacetedUniqueValues();
  } catch {
    facets = undefined;
  }

  const handleSelect = (val: string) => {
    const next = new Set(selectedValues);
    if (multiple) {
      if (next.has(val)) next.delete(val);
      else next.add(val);
      const filterValues = Array.from(next);
      column.setFilterValue(filterValues.length > 0 ? filterValues : undefined);
      return;
    }
    column.setFilterValue(next.has(val) ? undefined : [val]);
  };

  const selectedOptions = options.filter((option) => selectedValues.has(option.value));

  return (
    <Popover modal={false}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <PlusCircle className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
          {title}
          {selectedValues.size > 0 ? (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge color="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                {selectedValues.size}
              </Badge>
              <div className="hidden space-x-1 rtl:space-x-reverse lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge color="secondary" className="rounded-sm px-1 font-normal">
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  selectedOptions.map((option) => (
                    <Badge
                      color="secondary"
                      key={option.value}
                      className="rounded-sm px-1 font-normal"
                    >
                      {option.label}
                    </Badge>
                  ))
                )}
              </div>
            </>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[200px] p-0"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command shouldFilter={searchable}>
          {searchable ? <CommandInput placeholder={title} /> : null}
          <CommandList>
            {searchable ? <CommandEmpty>No results found.</CommandEmpty> : null}
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value);
                const count = facets?.get(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                    className="cursor-pointer"
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible",
                      )}
                    >
                      <Check className="h-4 w-4" />
                    </div>
                    {option.icon ? (
                      <option.icon className="ltr:mr-2 rtl:ml-2 h-4 w-4 text-muted-foreground" />
                    ) : null}
                    <span>{option.label}</span>
                    {count !== undefined ? (
                      <span className="ltr:ml-auto rtl:mr-auto flex h-4 w-4 items-center justify-center text-xs text-muted-foreground font-mono">
                        {count}
                      </span>
                    ) : null}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValues.size > 0 ? (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    value="clear-filters"
                    onSelect={() => column.setFilterValue(undefined)}
                    className="justify-center text-center cursor-pointer font-medium text-xs text-destructive hover:text-destructive"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
