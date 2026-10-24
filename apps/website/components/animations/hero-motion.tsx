"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { heroItemVariants, heroStaggerVariants } from "./variants";

type HeroMotionProps = {
  className?: string;
  children: React.ReactNode;
};

/** Mount animation for hero copy — elegant staggered entrance */
export function HeroMotion({ className, children }: HeroMotionProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={cn(className)}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(className)}
      variants={heroStaggerVariants}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
}

export function HeroMotionItem({ className, children }: HeroMotionProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={cn(className)}>{children}</div>;
  }

  return (
    <motion.div className={cn(className)} variants={heroItemVariants}>
      {children}
    </motion.div>
  );
}
