import { useId } from 'react';

// Hand-drawn tooth silhouette with an ECG pulse line carved through the crown.
// The pulse stroke uses the same gradient as the tile, so it only reads where
// it crosses the white tooth — keep tile, tooth, and pulse together.
const TOOTH =
  'M256 150 C236 128 204 116 180 116 C128 116 92 152 92 208 C92 252 108 286 118 330 C124 358 132 400 156 400 C180 400 176 322 256 322 C336 322 332 400 356 400 C380 400 388 358 394 330 C404 286 420 252 420 208 C420 152 384 116 332 116 C308 116 276 128 256 150 Z';
const PULSE = 'M60 232 H172 L206 168 L258 300 L298 210 L318 232 H452';

interface BrandMarkProps {
  className?: string;
}

/** The Clinic Pulse logomark — an app-icon style rounded tile. */
export function BrandMark({ className }: BrandMarkProps) {
  const id = useId();
  return (
    <svg viewBox="0 0 512 512" className={className} role="img" aria-label="Clinic Pulse">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2fb389" />
          <stop offset="1" stopColor="#156a55" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="120" fill={`url(#${id})`} />
      <path d={TOOTH} fill="white" />
      <path
        d={PULSE}
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="30"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
