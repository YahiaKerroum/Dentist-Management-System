// Note: warning/info/danger only define shades 50/100/500/600/700 in tailwind.config.js
// (unlike primary/violet/pink/cyan/amber, which have the full range) — stripe must use a
// defined shade or Tailwind silently emits no CSS for it.
const PALETTE = [
  { bg: 'bg-primary-100', text: 'text-primary-700', stripe: 'bg-primary-400' },
  { bg: 'bg-info-100', text: 'text-info-700', stripe: 'bg-info-500' },
  { bg: 'bg-warning-100', text: 'text-warning-700', stripe: 'bg-warning-500' },
  { bg: 'bg-danger-100', text: 'text-danger-700', stripe: 'bg-danger-500' },
  { bg: 'bg-violet-100', text: 'text-violet-700', stripe: 'bg-violet-400' },
  { bg: 'bg-pink-100', text: 'text-pink-700', stripe: 'bg-pink-400' },
  { bg: 'bg-cyan-100', text: 'text-cyan-700', stripe: 'bg-cyan-400' },
  { bg: 'bg-amber-100', text: 'text-amber-700', stripe: 'bg-amber-400' },
];

/** Deterministically assigns one of a small curated palette to a name, so lists of people don't render as a wall of identical circles. */
export function getAvatarColor(seed: string): { bg: string; text: string; stripe: string } {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}
