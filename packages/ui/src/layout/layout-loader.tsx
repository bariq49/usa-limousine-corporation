"use client";

import { Logo } from "../components/logo";

export function LayoutLoader() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background">
      <style>{`
        @keyframes shimmer-sweep {
          0% { transform: translateX(-150%) skewX(-20deg); }
          100% { transform: translateX(250%) skewX(-20deg); }
        }
        .animate-shimmer-sweep {
          animation: shimmer-sweep 2s linear infinite;
        }
      `}</style>
      <div className="relative overflow-hidden inline-flex items-center justify-center p-2 rounded-lg bg-background">
        <Logo />
        <div className="pointer-events-none absolute inset-0 z-10 w-[75%] animate-shimmer-sweep bg-gradient-to-r from-transparent via-white to-transparent mix-blend-screen" />
      </div>
    </div>
  );
}
