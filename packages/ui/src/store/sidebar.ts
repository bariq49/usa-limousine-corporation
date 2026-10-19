"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface SidebarState {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  subMenu: boolean;
  setSubmenu: (value: boolean) => void;
}

export const useSidebar = create<SidebarState>()(
  persist(
    (set) => ({
      collapsed: false,
      setCollapsed: (value) => set({ collapsed: value }),
      subMenu: false,
      setSubmenu: (value) => set({ subMenu: value }),
    }),
    {
      name: "usa-limousine-corporation-sidebar-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        collapsed: state.collapsed,
        subMenu: state.subMenu,
      }),
    },
  ),
);
