"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  cardSequenceVariants,
  cardShellVariants,
  staggerContainerVariants,
  staggerItemImageVariants,
  staggerItemSoftVariants,
  staggerItemVariants,
  staggerTightContainerVariants,
  viewportReplay,
} from "./variants";

type StaggerProps = Omit<
  HTMLMotionProps<"div">,
  "initial" | "animate" | "variants"
> & {
  className?: string;
  children: React.ReactNode;
  /** Tighter stagger for small lists */
  tight?: boolean;
  /** Card-by-card: each child waits for the previous card cycle */
  sequence?: boolean;
  /** Extra delay before children start */
  delay?: number;
  /**
   * When true, only inherits parent stagger — no own whileInView.
   * Use for nested groups (e.g. image → text inside a sequenced card).
   */
  nested?: boolean;
};

function withDelay(
  base: typeof staggerContainerVariants,
  delay: number,
  staggerChildren: number,
  delayChildren: number
) {
  if (delay <= 0) return base;
  return {
    hidden: base.hidden,
    visible: {
      transition: {
        staggerChildren,
        delayChildren: delayChildren + delay,
      },
    },
  };
}

function resolveVariants(
  tight: boolean,
  sequence: boolean,
  delay: number
) {
  if (sequence) {
    return withDelay(cardSequenceVariants, delay, 0.12, 0.02);
  }

  if (tight) {
    return withDelay(staggerTightContainerVariants, delay, 0.07, 0.03);
  }

  return withDelay(staggerContainerVariants, delay, 0.09, 0.04);
}

export function Stagger({
  className,
  children,
  tight = false,
  sequence = false,
  delay = 0,
  nested = false,
  ...props
}: StaggerProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <div className={cn(className)} style={props.style as React.CSSProperties}>
        {children}
      </div>
    );
  }

  const variants = resolveVariants(tight, sequence, delay);

  if (nested) {
    return (
      <motion.div className={cn(className)} variants={variants} {...props}>
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cn(className)}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={viewportReplay}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Whole card shell — fades/slides in as a box, then image → text children.
 * Must be a direct child of a sequenced `Stagger`.
 */
export function StaggerGroup({
  className,
  children,
  ...props
}: Omit<StaggerProps, "tight" | "sequence" | "delay" | "nested">) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={cn(className)}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(className)}
      variants={cardShellVariants}
      {...props}
    >
      {children}
    </motion.div>
  );
}

type StaggerItemProps = Omit<
  StaggerProps,
  "tight" | "delay" | "nested" | "sequence"
> & {
  soft?: boolean;
  /** Image zoom-in variant for media inside a card */
  image?: boolean;
};

export function StaggerItem({
  className,
  children,
  soft = false,
  image = false,
  ...props
}: StaggerItemProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={cn(className)}>{children}</div>;
  }

  const variants = image
    ? staggerItemImageVariants
    : soft
      ? staggerItemSoftVariants
      : staggerItemVariants;

  return (
    <motion.div className={cn(className)} variants={variants} {...props}>
      {children}
    </motion.div>
  );
}
