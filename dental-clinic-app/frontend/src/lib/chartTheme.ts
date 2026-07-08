/**
 * Shared chart vocabulary for the Reports analytics cards, so all 18 charts
 * read as one system. Colors are validated (see dataviz validate_palette.js):
 * the categorical set is CVD-safe on a white surface and anchored on the brand
 * teal. Status colors map to the app's semantic tokens and are reserved for
 * state — never reused as a categorical "series N".
 */

/** Categorical identity — assigned in fixed order, never cycled. Brand teal leads. */
export const CHART_CATEGORICAL = [
  '#188467', // primary teal (brand)
  '#3b6fe0', // blue
  '#b8770a', // amber
  '#8b5cf6', // violet
  '#c43d8a', // magenta
  '#0e9bb5', // cyan
] as const;

/** Neutral bucket for the 7th+ category — fold overflow into "Other", never invent a hue. */
export const CHART_OTHER = '#94a3a0'; // surface-400

/**
 * Assign categorical colors positionally, folding any slot beyond the palette
 * onto the neutral "Other" color rather than cycling hues.
 */
export const categoricalColor = (index: number): string =>
  index < CHART_CATEGORICAL.length ? CHART_CATEGORICAL[index] : CHART_OTHER;

/** Reserved status colors (app semantic 600-step tokens). Pair with a label, never color-alone. */
export const CHART_STATUS = {
  positive: '#16a34a', // success-600 — money in, completed
  neutral: '#2563eb', // info-600 — scheduled, informational
  attention: '#d97706', // warning-600 — pending, no-show
  negative: '#dc2626', // danger-600 — cancelled, overdue, expense
} as const;

/** Single-hue brand sequential (magnitude of one series). */
export const CHART_BRAND = '#188467';

/** Recessive grid + axis styling shared by every cartesian chart. */
export const CHART_GRID_COLOR = '#e2e8e6'; // surface-200
export const CHART_AXIS_TICK = { fontSize: 12, fill: '#64756f' }; // surface-500

/** One tooltip look for every chart. */
export const chartTooltip = {
  contentStyle: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8e6', // surface-200
    borderRadius: '10px',
    boxShadow: '0 4px 8px -2px rgb(15 23 21 / 0.08)',
    fontSize: '12px',
  },
  labelStyle: { color: '#161e1a', fontWeight: 600 }, // surface-900
  itemStyle: { color: '#37423d' }, // surface-700
} as const;
