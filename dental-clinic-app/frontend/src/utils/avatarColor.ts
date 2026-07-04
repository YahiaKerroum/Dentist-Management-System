const PALETTE = [
  { bg: 'bg-primary-100', text: 'text-primary-700' },
  { bg: 'bg-info-100', text: 'text-info-700' },
  { bg: 'bg-warning-100', text: 'text-warning-700' },
  { bg: 'bg-danger-100', text: 'text-danger-700' },
  { bg: 'bg-violet-100', text: 'text-violet-700' },
  { bg: 'bg-pink-100', text: 'text-pink-700' },
  { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  { bg: 'bg-amber-100', text: 'text-amber-700' },
];

/** Deterministically assigns one of a small curated palette to a name, so lists of people don't render as a wall of identical circles. */
export function getAvatarColor(seed: string): { bg: string; text: string } {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}
