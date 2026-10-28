"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type HourCycle = "12h" | "24h";

interface TimeFormatState {
  hourCycle: HourCycle;
  setHourCycle: (hourCycle: HourCycle) => void;
}

export const useTimeFormat = create<TimeFormatState>()(
  persist(
    (set) => ({
      hourCycle: "12h",
      setHourCycle: (hourCycle) => set({ hourCycle }),
    }),
    {
      name: "usa-limousine-corporation-time-format",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ hourCycle: state.hourCycle }),
    },
  ),
);
