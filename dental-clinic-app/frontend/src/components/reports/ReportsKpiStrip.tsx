import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Wallet, UserX, CircleDollarSign, TriangleAlert, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import {
  getTotalPatients,
  getAppointmentsOverview,
  getRevenueGenerated,
  getPaymentStatus,
} from '../../services/report.service';

interface Props {
  token: string;
}

const currency = (n: number) => `$${Math.round(n).toLocaleString()}`;
const pct = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 100) : 0);

interface TileProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  tone?: 'neutral' | 'danger' | 'warning';
}

const VALUE_TONE = {
  neutral: 'text-surface-900',
  danger: 'text-danger-600',
  warning: 'text-warning-600',
} as const;

function KpiTile({ icon, label, value, sub, tone = 'neutral' }: TileProps) {
  return (
    <div className="rounded-xl border border-surface-200 bg-white p-4 shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-surface-400">{label}</span>
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-100 text-surface-500">{icon}</span>
      </div>
      <p className={`mt-2 font-display text-2xl font-semibold tracking-tight tabular-nums ${VALUE_TONE[tone]}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-surface-400">{sub}</p>}
    </div>
  );
}

/**
 * A KPI strip that answers "is the practice healthy?" up front — total patients,
 * revenue this month (with trend), no-show rate and outstanding balance — plus a
 * callout when a large share of appointments didn't happen. All from real endpoints.
 */
export const ReportsKpiStrip: React.FC<Props> = ({ token }) => {
  const { data: patients } = useQuery({
    queryKey: ['reports', 'total-patients'],
    queryFn: async () => (await getTotalPatients(token)).data,
  });
  const { data: overview } = useQuery({
    queryKey: ['reports', 'appointments-overview'],
    queryFn: async () => (await getAppointmentsOverview(token)).data,
  });
  const { data: revenue } = useQuery({
    queryKey: ['reports', 'revenue-generated', 6],
    queryFn: async () => (await getRevenueGenerated(token, 6)).data,
  });
  const { data: payments } = useQuery({
    queryKey: ['reports', 'payment-status'],
    queryFn: async () => (await getPaymentStatus(token)).data,
  });

  const total = overview?.total ?? 0;
  const noShow = overview?.noShow ?? 0;
  const cancelled = overview?.cancelled ?? 0;
  const noShowRate = pct(noShow, total);
  const didntHappenRate = pct(noShow + cancelled, total);

  const trends = revenue?.trends ?? [];
  const thisMonth = trends.length ? trends[trends.length - 1].revenue : (revenue?.totalRevenue ?? 0);
  const lastMonth = trends.length > 1 ? trends[trends.length - 2].revenue : 0;
  const revDelta = lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : null;

  const outstanding = (payments?.amounts?.pending ?? 0) + (payments?.amounts?.overdue ?? 0);

  return (
    <div className="space-y-4">
      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiTile
          icon={<Users className="h-4 w-4" />}
          label="Total patients"
          value={patients?.total ?? '—'}
          sub={patients ? `+${patients.newThisMonth} new this month` : undefined}
        />
        <KpiTile
          icon={<Wallet className="h-4 w-4" />}
          label="Revenue this month"
          value={currency(thisMonth)}
          sub={
            revDelta !== null ? (
              <span className={`inline-flex items-center gap-0.5 ${revDelta >= 0 ? 'text-success-700' : 'text-danger-600'}`}>
                {revDelta >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(revDelta)}% vs last month
              </span>
            ) : (
              'this month'
            )
          }
        />
        <KpiTile
          icon={<UserX className="h-4 w-4" />}
          label="No-show rate"
          value={`${noShowRate}%`}
          sub={total ? `${noShow} of ${total} appointments` : undefined}
          tone={noShowRate >= 15 ? 'danger' : 'neutral'}
        />
        <KpiTile
          icon={<CircleDollarSign className="h-4 w-4" />}
          label="Outstanding"
          value={currency(outstanding)}
          sub="pending + overdue"
          tone={outstanding > 0 ? 'warning' : 'neutral'}
        />
      </div>

      {/* Didn't-happen callout — the number an owner needs to see */}
      {total > 0 && didntHappenRate >= 30 && (
        <div className="flex items-start gap-3 rounded-xl border border-danger-100 bg-danger-50 px-4 py-3">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-danger-600" />
          <div>
            <p className="text-sm font-semibold text-danger-700">
              {didntHappenRate}% of appointments didn't happen
            </p>
            <p className="text-xs text-danger-600">
              {noShowRate}% no-show ({noShow}) · {pct(cancelled, total)}% cancelled ({cancelled}) — out of {total} appointments.
              Reducing this is the fastest way to recover lost chair time and revenue.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsKpiStrip;
