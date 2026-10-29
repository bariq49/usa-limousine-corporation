"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { cn, getDynamicPath, isLocationMatch } from "../../utils/cn";
import { useSidebar } from "../../store/sidebar";
import { useMediaQuery } from "../../hooks/use-media-query";
import { ScrollArea } from "../../components/scroll-area";
import { Button } from "../../components/button";
import { Logo } from "../../components/logo";
import { useShell } from "../../providers/shell-context";
import type { ShellNavChild } from "../../types/navigation";
import { toShellNav } from "../../utils/nav-model";
import { SingleIconMenu } from "./single-icon-menu";
import { ModuleMenuItem, NestedMenus } from "./module-menu-item";
import { MenuOverlayPortal } from "./menu-overlay";


export function Sidebar() {
  const { navigation, roles } = useShell();
  const menus = useMemo(() => toShellNav(navigation, roles), [navigation, roles]);
  const { subMenu, setSubmenu, collapsed, setCollapsed } = useSidebar();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [currentSubMenu, setCurrentSubMenu] = useState<ShellNavChild[]>([]);
  const [nestedIndex, setNestedIndex] = useState<number | null>(null);
  const [menuOverlay, setMenuOverlay] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1280px)");
  const pathname = usePathname();
  const locationName = getDynamicPath(pathname);

  const toggleSubMenu = (index: number) => {
    const item = menus[index];
    if (!item) {
      return;
    }
    setActiveIndex(index);
    if (item.child) {
      setCurrentSubMenu(item.child);
      setSubmenu(false);
      setCollapsed(false);
      if (!isDesktop) {
        setMenuOverlay(true);
      }
      return;
    }
    setSubmenu(true);
    setCollapsed(true);
    if (!isDesktop && isLocationMatch(item.href, locationName)) {
      setSubmenu(false);
    }
  };

  useEffect(() => {
    let matched = false;
    menus.forEach((item, i) => {
      if (item.href && isLocationMatch(item.href, locationName)) {
        matched = true;
        setSubmenu(true);
        setCollapsed(true);
        setMenuOverlay(false);
      }
      item.child?.forEach((childItem) => {
        if (isLocationMatch(childItem.href, locationName)) {
          setActiveIndex(i);
          setCurrentSubMenu(item.child ?? []);
          setSubmenu(false);
          setCollapsed(false);
          setMenuOverlay(false);
          matched = true;
        }
        childItem.nested?.forEach((nestedItem) => {
          if (isLocationMatch(nestedItem.href, locationName)) {
            setActiveIndex(i);
            setCurrentSubMenu(item.child ?? []);
            setSubmenu(false);
            setCollapsed(false);
            setMenuOverlay(false);
            matched = true;
          }
        });
      });
    });
    if (!matched) {
      setSubmenu(false);
    }
    if (!isDesktop) {
      setSubmenu(true);
    }
  }, [locationName, isDesktop, menus, setCollapsed, setSubmenu]);

  const menuTitle = activeIndex !== null ? (menus[activeIndex]?.title ?? "") : "";

  return (
    <>
      <div
        className={cn(
          "main-sidebar pointer-events-none fixed start-0 top-0 z-60 flex h-full overflow-hidden print:hidden xl:z-10",
          {
            "max-xl:w-0": !isDesktop && !collapsed && subMenu,
            "max-xl:w-[72px]": !isDesktop && collapsed && subMenu,
            "max-xl:w-[300px]": !isDesktop && !collapsed && !subMenu,
          },
        )}
      >
        <div
          className={cn(
            "pointer-events-auto relative z-20 flex h-full w-[72px] shrink-0 flex-col border-r border-dashed border-border bg-card transition-all duration-300 dark:border-default-300",
            {
              "max-xl:hidden": !isDesktop && !collapsed && subMenu,
              "-translate-x-full xl:translate-x-0": isDesktop && !collapsed && subMenu,
            },
          )}
        >
          <div className="flex items-center justify-center border-b border-dashed border-border pt-4 pb-4">
            <Link href="/analytics">
              <Logo variant="short" className="h-16 w-16 text-primary" />
            </Link>
          </div>
          <ScrollArea className="grow pt-6 pb-6">
            {menus.map((item, i) => (
              <div key={item.title} onClick={() => toggleSubMenu(i)} className="mb-3 last:mb-0">
                <SingleIconMenu
                  index={i}
                  activeIndex={activeIndex}
                  item={item}
                  locationName={locationName}
                />
              </div>
            ))}
          </ScrollArea>
        </div>
        <div
          className={cn(
            "pointer-events-auto relative z-10 flex h-full w-[228px] shrink-0 flex-col border-r border-border bg-card transition-all duration-300",
            {
              "max-xl:hidden": !isDesktop && (collapsed || subMenu),
              "translate-x-[calc(-100%_-_72px)]": isDesktop && (collapsed || subMenu),
            },
          )}
        >
          <h2 className="sticky top-0 z-50 flex items-center gap-4 bg-transparent px-4 py-4 text-lg font-semibold text-default-700 capitalize">
            <span className="block">{menuTitle}</span>
            {!isDesktop && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  setCollapsed(true);
                  setSubmenu(true);
                  setMenuOverlay(false);
                }}
                className="h-8 w-8 rounded-full"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
          </h2>
          <ScrollArea className="h-[calc(100%-40px)] grow">
            <div className="px-4">
              <ul>
                {currentSubMenu.map((childItem, j) => (
                  <li key={childItem.title} className="mb-1.5 last:mb-0">
                    <ModuleMenuItem
                      childItem={childItem}
                      toggleNested={(subIndex) =>
                        setNestedIndex((current) => (current === subIndex ? null : subIndex))
                      }
                      index={j}
                      nestedIndex={nestedIndex}
                      locationName={locationName}
                      siblingHrefs={currentSubMenu.map((item) => item.href)}
                    />
                    <NestedMenus
                      index={j}
                      nestedIndex={nestedIndex}
                      nestedMenus={childItem.nested}
                      locationName={locationName}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </ScrollArea>
        </div>


      </div>
      {!isDesktop ? (
        <MenuOverlayPortal
          isOpen={menuOverlay || collapsed}
          onClose={() => {
            setMenuOverlay(false);
            setSubmenu(true);
            setCollapsed(false);
          }}
        />
      ) : null}
    </>
  );
}
