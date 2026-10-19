import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Authentication",
};

export default function AuthGroupLayout({ children }: { children: ReactNode }) {
  return children;
}
