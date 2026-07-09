import type { Transition, Variants } from 'framer-motion';

/**
 * Shared motion vocabulary — one place for the app's timing/spring language so
 * every surface moves the same way. Use these instead of ad hoc transitions.
 */

/** Snappy spring for small UI (chips, toggles, active indicators). */
export const springSnappy: Transition = { type: 'spring', stiffness: 480, damping: 38 };

/** Soft spring for panels and larger surfaces. */
export const springSoft: Transition = { type: 'spring', stiffness: 260, damping: 30 };

/** The house easing curve — fast start, long graceful settle. */
export const easeOutExpo = [0.16, 1, 0.3, 1] as const;

/** Parent container that staggers its children's entrance. */
export const staggerContainer = (stagger = 0.06, delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren } },
});

/** Child entrance: rise + fade. Pair with `staggerContainer`. */
export const riseIn: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOutExpo } },
};

/** Page-level route transition. */
export const pageEnter = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: 0.28, ease: easeOutExpo },
} as const;
