import type { Transition, Variants } from "framer-motion";

/** Soft luxury easing — decelerate into place (kept for smoothness) */
export const luxuryEase = [0.22, 1, 0.36, 1] as const;

export const luxuryTransition: Transition = {
  duration: 0.52,
  ease: luxuryEase,
};

export const luxuryStaggerTransition: Transition = {
  duration: 0.32,
  ease: luxuryEase,
};

export const viewportOnce = {
  once: true,
  amount: 0.15,
  margin: "0px 0px -6% 0px",
} as const;

/** Play once when scrolling into view — no reverse on scroll up */
export const viewportReplay = {
  once: true,
  amount: 0.2,
  margin: "0px 0px -4% 0px",
} as const;

/** `custom` = delay in seconds so siblings can cascade one-by-one */
export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { ...luxuryTransition, delay },
  }),
};

export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    transition: { ...luxuryTransition, duration: 0.65, delay },
  }),
};

export const fadeLeftVariants: Variants = {
  hidden: { opacity: 0, x: -18 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: { ...luxuryTransition, delay },
  }),
};

export const fadeRightVariants: Variants = {
  hidden: { opacity: 0, x: 18 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: { ...luxuryTransition, delay },
  }),
};

export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { ...luxuryTransition, delay },
  }),
};

/** Soft image zoom-in — used for media within cards/sections */
export const imageRevealVariants: Variants = {
  hidden: { opacity: 0, scale: 1.05 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.65, ease: luxuryEase, delay },
  }),
};

export const staggerContainerVariants: Variants = {
  hidden: {
    transition: {
      staggerChildren: 0.04,
      staggerDirection: -1,
    },
  },
  visible: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.04,
    },
  },
};

/** Card-by-card: snappy cascade between cards */
export const cardSequenceVariants: Variants = {
  hidden: {
    transition: {
      staggerChildren: 0.04,
      staggerDirection: -1,
    },
  },
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.02,
    },
  },
};

/**
 * Whole service card shell first, then image → text inside.
 */
export const cardShellVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.32,
      ease: luxuryEase,
      when: "beforeChildren",
      staggerChildren: 0.07,
      delayChildren: 0.03,
    },
  },
};

/** Inside one card: image first, then text (when shell is not used) */
export const cardInnerVariants: Variants = {
  hidden: {
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.01,
    },
  },
};

export const staggerTightContainerVariants: Variants = {
  hidden: {
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.03,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: luxuryStaggerTransition,
  },
};

export const staggerItemSoftVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: luxuryEase },
  },
};

export const staggerItemImageVariants: Variants = {
  hidden: { opacity: 0, scale: 1.03 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: luxuryEase },
  },
};

export const heroStaggerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.06,
    },
  },
};

export const heroItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.58, ease: luxuryEase },
  },
};
