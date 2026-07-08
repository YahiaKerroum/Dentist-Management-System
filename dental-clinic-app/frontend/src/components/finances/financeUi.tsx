import React from 'react';
import { CreditCard, Banknote, Landmark, ShieldCheck, HelpCircle, type LucideIcon } from 'lucide-react';

/** Shared vocabulary for the two finance ledgers so Payments (money in) and
 *  Expenses (money out) read as one system — same chips, pills, summary cards. */

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

export const formatCurrencyCents = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

export const dayLabel = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  const yest = new Date();
  yest.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (sameDay(d, today)) return 'Today';
  if (sameDay(d, yest)) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};

/** Groups already-sorted rows into contiguous day buckets, preserving order. */
export function groupByDay<T>(rows: T[], getDate: (row: T) => string): { key: string; label: string; rows: T[] }[] {
  const groups: { key: string; label: string; rows: T[] }[] = [];
  for (const row of rows) {
    const key = new Date(getDate(row)).toDateString();
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.rows.push(row);
    else groups.push({ key, label: dayLabel(getDate(row)), rows: [row] });
  }
  return groups;
}

// Category chips reuse the brand-validated categorical hues (see chartTheme), assigned
// deterministically by name so a category always reads as the same color across the app.
const CATEGORY_HUES: { chip: string; dot: string }[] = [
  { chip: 'bg-primary-50 text-primary-700', dot: 'bg-primary-500' },
  { chip: 'bg-info-50 text-info-700', dot: 'bg-info-500' },
  { chip: 'bg-violet-50 text-violet-700', dot: 'bg-violet-500' },
  { chip: 'bg-pink-50 text-pink-700', dot: 'bg-pink-500' },
  { chip: 'bg-cyan-50 text-cyan-700', dot: 'bg-cyan-500' },
  { chip: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
];

export function categoryStyle(name: string): { chip: string; dot: string } {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return CATEGORY_HUES[hash % CATEGORY_HUES.length];
}

export const METHOD_META: Record<string, { label: string; icon: LucideIcon; chip: string; iconColor: string }> = {
  CASH: { label: 'Cash', icon: Banknote, chip: 'bg-success-50 text-success-700', iconColor: 'text-success-600' },
  CARD: { label: 'Card', icon: CreditCard, chip: 'bg-info-50 text-info-700', iconColor: 'text-info-600' },
  TRANSFER: { label: 'Transfer', icon: Landmark, chip: 'bg-violet-50 text-violet-700', iconColor: 'text-violet-600' },
  INSURANCE: { label: 'Insurance', icon: ShieldCheck, chip: 'bg-amber-50 text-amber-700', iconColor: 'text-amber-600' },
};

export const methodMeta = (method: string | null) =>
  (method && METHOD_META[method]) || { label: method || 'Other', icon: HelpCircle, chip: 'bg-surface-100 text-surface-600', iconColor: 'text-surface-500' };

interface SummaryCardProps {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  icon: LucideIcon;
  tone?: 'neutral' | 'success' | 'danger' | 'warning';
}

const TONE: Record<NonNullable<SummaryCardProps['tone']>, { icon: string; value: string }> = {
  neutral: { icon: 'bg-surface-100 text-surface-500', value: 'text-surface-900' },
  success: { icon: 'bg-success-50 text-success-600', value: 'text-success-700' },
  danger: { icon: 'bg-danger-50 text-danger-600', value: 'text-danger-700' },
  warning: { icon: 'bg-warning-50 text-warning-600', value: 'text-warning-700' },
};

export function SummaryCard({ label, value, sub, icon: Icon, tone = 'neutral' }: SummaryCardProps) {
  const t = TONE[tone];
  return (
    <div className="rounded-xl border border-surface-200 bg-white p-4 shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-surface-400">{label}</span>
        <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${t.icon}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className={`mt-2 font-display text-2xl font-semibold tracking-tight tabular-nums ${t.value}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-surface-400">{sub}</p>}
    </div>
  );
}
