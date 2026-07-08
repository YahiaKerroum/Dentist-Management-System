import { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  /** Formats the in-flight value for display. Defaults to rounded locale string. */
  format?: (n: number) => string;
  className?: string;
}

const defaultFormat = (n: number) => Math.round(n).toLocaleString();

/** Counts up to `value` with a spring once it scrolls into view. */
export function AnimatedNumber({ value, format = defaultFormat, className }: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { stiffness: 90, damping: 26 });
  const inView = useInView(ref, { once: true, margin: '-32px' });

  useEffect(() => {
    if (inView) motionValue.set(value);
  }, [inView, value, motionValue]);

  useEffect(
    () =>
      springValue.on('change', (v) => {
        if (ref.current) ref.current.textContent = format(v);
      }),
    [springValue, format]
  );

  return (
    <span ref={ref} className={className}>
      {format(reduced ? value : 0)}
    </span>
  );
}
