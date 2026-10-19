"use client";

import * as React from "react";
import { Check, PlusCircle } from "lucide-react";

import { cn } from "../utils/cn";
import { Badge } from "../components/badge";
import { Button } from "../components/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../components/command";
import { Popover, PopoverContent, PopoverTrigger } from "../components/popover";
import { Separator } from "../components/separator";
import type { Column } from "@tanstack/react-table";

export interface DataTableFacetedFilterOption {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface DataTableFacetedFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
  options: DataTableFacetedFilterOption[];
  multiple?: boolean | undefined;
  searchable?: boolean | undefined;
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
  multiple = true,
  searchable = false,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const facets = column.getFacetedUniqueValues();
  const currentFilter = column.getFilterValue();
  const selectedValues = React.useMemo(() => {
    if (!currentFilter) return new Set<string>();
    if (Array.isArray(currentFilter)) return new Set<string>(currentFilter as string[]);
    return new Set<string>([String(currentFilter)]);
  }, [currentFilter]);

  const handleSelect = (val: string) => {
    const newSelected = new Set(selectedValues);
    if (multiple) {
      if (newSelected.has(val)) {
        newSelected.delete(val);
      } else {
        newSelected.add(val);
      }
      const filterValues = Array.from(newSelected);
      column.setFilterValue(filterValues.length ? filterValues : undefined);
      return;
    }

    column.setFilterValue(newSelected.has(val) ? undefined : [val]);
  };

  return (
    <Popover modal={false}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <PlusCircle className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
          {title}
          {selectedValues.size > 0 && (
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
                  options
                    .filter((option) => selectedValues.has(option.value))
                    .map((option) => (
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
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[200px] p-0"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command shouldFilter={searchable}>
          {searchable && <CommandInput placeholder={title} />}
          <CommandList>
            {searchable && <CommandEmpty>No results found.</CommandEmpty>}
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value);
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
                      <Check className={cn("h-4 w-4")} />
                    </div>
                    {option.icon && (
                      <option.icon className="ltr:mr-2 rtl:ml-2 h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{option.label}</span>
                    {facets?.get(option.value) !== undefined && (
                      <span className="ltr:ml-auto rtl:mr-auto flex h-4 w-4 items-center justify-center text-xs text-muted-foreground font-mono">
                        {facets.get(option.value)}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
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
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
