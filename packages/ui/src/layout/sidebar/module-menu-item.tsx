"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type {
  ModuleMenuItemProps,
  NavLinkProps,
  NestedMenusProps,
} from "../../types/navigation";
import { cn, isLocationMatch } from "../../utils/cn";

function NavLink(props: NavLinkProps) {
  const { childItem, locationName, siblingHrefs } = props;
  const href = childItem.href ?? "/";
  const Icon = childItem.icon;
  const active = isLocationMatch(href, locationName, siblingHrefs);

  return (
    <Link
      href={href}
      className={cn(
        "flex cursor-pointer gap-3 rounded-md px-[10px] py-3 text-sm font-medium capitalize",
        {
          "bg-primary text-primary-foreground": active,
          "text-default-600": !active,
        },
      )}
    >
      {Icon ? (
        <span className="inline-flex grow-0 items-center">
          <Icon className="h-5 w-5" />
        </span>
      ) : null}
      <div className="grow truncate">{childItem.title}</div>
    </Link>
  );
}

export function ModuleMenuItem(props: ModuleMenuItemProps) {
  const { childItem, toggleNested, nestedIndex, index, locationName, siblingHrefs } = props;
  const Icon = childItem.icon;

  if (!childItem.nested) {
    return (
      <div className="flex-1">
        <NavLink
          childItem={childItem}
          locationName={locationName}
          siblingHrefs={siblingHrefs}
        />
      </div>
    );
  }

  return (
    <div
      className={cn("flex items-center gap-3 rounded-md px-[10px] py-3", {
        "bg-primary text-primary-foreground": nestedIndex === index,
        "text-default-600": nestedIndex !== index,
      })}
    >
      <button
        type="button"
        className="flex flex-1 cursor-pointer gap-3 text-sm font-medium capitalize"
        onClick={() => toggleNested(index)}
      >
        {Icon ? (
          <span className="inline-flex grow-0 items-center">
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
        <span className="grow truncate">{childItem.title}</span>
      </button>
      <div
        className={cn("flex-none text-default-500 transition-all duration-200", {
          "rotate-90 transform text-primary-foreground": nestedIndex === index,
        })}
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </div>
    </div>
  );
}

export function NestedMenus(props: NestedMenusProps) {
  const { nestedIndex, index, nestedMenus, locationName } = props;

  if (!nestedMenus?.length) {
    return null;
  }

  const siblingHrefs = nestedMenus.map((item) => item.href);

  return (
    <ul
      className={cn(
        "relative space-y-3 before:absolute before:top-0 before:left-4 before:h-[calc(100%-5px)] before:w-[2px] before:rounded before:bg-primary/20",
        nestedIndex === index ? "block" : "hidden",
      )}
    >
      {nestedMenus.map((item) => {
        const active = isLocationMatch(item.href, locationName, siblingHrefs);
        return (
          <li key={item.title} className="relative ml-[30px] block first:pt-4">
            <Link href={item.href ?? "/"}>
              <div
                className={cn("pl-3 text-sm font-normal capitalize", {
                  "text-primary": active,
                  "text-default-700 hover:text-primary": !active,
                })}
              >
                {item.title}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
