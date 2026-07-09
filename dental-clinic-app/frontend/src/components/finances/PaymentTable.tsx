import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus, Edit, Trash2, Loader2, Wallet, ChevronLeft, ChevronRight, CalendarDays, TrendingUp } from 'lucide-react';
import { getAllPayments, deletePayment } from '../../services/payment.service';
import { Payment } from '../../types/payment.types';
import { queryKeys } from '../../lib/queryKeys';
import { PaymentForm } from './PaymentForm';
import { toast } from '../ui/Toaster';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';
import { SummaryCard, methodMeta, METHOD_META, formatCurrency, groupByDay } from './financeUi';

interface PaymentTableProps {
  token: string;
}

const METHODS = ['All', 'CASH', 'CARD', 'TRANSFER', 'INSURANCE'];
const SORT_OPTIONS = [
  { value: 'date-desc', label: 'Date (Newest First)' },
  { value: 'date-asc', label: 'Date (Oldest First)' },
  { value: 'amount-desc', label: 'Amount (Highest First)' },
  { value: 'amount-asc', label: 'Amount (Lowest First)' },
];
const ITEMS_PER_PAGE = 10;

const PaymentTable: React.FC<PaymentTableProps> = ({ token }) => {
  const {
    data: payments = [],
    isLoading: loading,
    error: queryError,
    refetch: fetchPayments,
  } = useQuery({
    queryKey: queryKeys.payments,
    queryFn: getAllPayments,
  });
  const error = queryError ? (queryError instanceof Error ? queryError.message : 'Failed to fetch payments. Please try again.') : '';
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [methodFilter, setMethodFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date-desc');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  let filteredPayments = payments.filter((payment) => {
    const patientFullName = payment.patient
      ? `${payment.patient.firstName} ${payment.patient.lastName}`.toLowerCase()
      : '';
    const matchesSearch =
      !searchQuery.trim() ||
      patientFullName.includes(searchQuery.toLowerCase()) ||
      payment.method?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.amount.toString().includes(searchQuery) ||
      payment.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMethod = methodFilter === 'All' || payment.method === methodFilter;
    return matchesSearch && matchesMethod;
  });

  filteredPayments = [...filteredPayments].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'date-asc':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'amount-desc':
        return Number(b.amount) - Number(a.amount);
      case 'amount-asc':
        return Number(a.amount) - Number(b.amount);
      default:
        return 0;
    }
  });

  // Summary metrics over the filtered set
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const totalReceived = filteredPayments.reduce((s, p) => s + Number(p.amount || 0), 0);
  const thisMonthTotal = filteredPayments
    .filter((p) => new Date(p.date).getTime() >= monthStart)
    .reduce((s, p) => s + Number(p.amount || 0), 0);
  const byMethod = new Map<string, number>();
  filteredPayments.forEach((p) => {
    const key = p.method || 'OTHER';
    byMethod.set(key, (byMethod.get(key) || 0) + Number(p.amount || 0));
  });
  const topMethod = [...byMethod.entries()].sort((a, b) => b[1] - a[1])[0];
  const methodBreakdown = Object.keys(METHOD_META)
    .map((m) => ({ method: m, amount: byMethod.get(m) || 0 }))
    .filter((m) => m.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const handleCreatePayment = () => {
    setSelectedPayment(null);
    setIsModalOpen(true);
  };

  const handleEditPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  const handleDeletePayment = async (payment: Payment) => {
    try {
      await deletePayment(payment.id);
      toast.success('Payment deleted successfully');
      setDeleteConfirmId(null);
      await fetchPayments();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete payment';
      console.error('Error deleting payment:', err);
      toast.error(errorMessage);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedPayment(null);
  };

  const handleModalSave = async () => {
    handleModalClose();
    toast.success(selectedPayment ? 'Payment updated successfully' : 'Payment created successfully');
    await fetchPayments();
  };

  const totalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const pagePayments = filteredPayments.slice(startIndex, endIndex);
  const dayGroups = groupByDay(pagePayments, (p) => p.date);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div>
      {/* Summary strip */}
      <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Total received" value={formatCurrency(totalReceived)} sub={`${filteredPayments.length} payments`} icon={Wallet} tone="success" />
        <SummaryCard label="This month" value={formatCurrency(thisMonthTotal)} icon={CalendarDays} />
        <SummaryCard label="Top method" value={topMethod ? methodMeta(topMethod[0]).label : '—'} sub={topMethod ? formatCurrency(topMethod[1]) : undefined} icon={TrendingUp} />
        {/* By-method mini breakdown */}
        <div className="rounded-xl border border-surface-200 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wide text-surface-400">By method</span>
          <div className="mt-2 space-y-1.5">
            {methodBreakdown.length === 0 ? (
              <p className="text-sm text-surface-400">No payments</p>
            ) : (
              methodBreakdown.map(({ method, amount }) => {
                const meta = methodMeta(method);
                const pct = totalReceived > 0 ? Math.round((amount / totalReceived) * 100) : 0;
                return (
                  <div key={method} className="flex items-center gap-2 text-xs">
                    <meta.icon className={`h-3.5 w-3.5 shrink-0 ${meta.iconColor}`} />
                    <span className="w-16 shrink-0 text-surface-600">{meta.label}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-100">
                      <div className="h-full rounded-full bg-primary-400" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-9 shrink-0 text-right tabular-nums text-surface-500">{pct}%</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder="Search payments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-surface-300 py-2 pl-10 pr-4 focus:border-primary-500 focus:outline-none focus:shadow-focus"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="rounded-md border border-surface-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:shadow-focus"
          >
            {METHODS.map((m) => (
              <option key={m} value={m}>
                {m === 'All' ? 'All Methods' : m}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-md border border-surface-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:shadow-focus"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Button onClick={handleCreatePayment}>
            <Plus className="h-4 w-4" />
            Create Payment
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-danger-100 bg-danger-50 p-4 text-danger-700">{error}</div>
      )}

      {/* Ledger */}
      <div className="overflow-hidden rounded-xl border border-surface-200 bg-white shadow-xs">
        {filteredPayments.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title={searchQuery || methodFilter !== 'All' ? 'No payments found matching your filters.' : 'No payments yet'}
            description={searchQuery || methodFilter !== 'All' ? undefined : 'Create your first payment to start the ledger.'}
          />
        ) : (
          dayGroups.map((group) => {
            const daySum = group.rows.reduce((s, p) => s + Number(p.amount || 0), 0);
            return (
              <div key={group.key}>
                {/* Day divider */}
                <div className="flex items-center justify-between border-b border-surface-100 bg-surface-50/70 px-5 py-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-surface-400">{group.label}</span>
                  <span className="text-xs font-medium tabular-nums text-surface-500">+{formatCurrency(daySum)}</span>
                </div>

                <div className="divide-y divide-surface-100">
                  {group.rows.map((payment) => {
                    const meta = methodMeta(payment.method);
                    const patientName = payment.patient
                      ? `${payment.patient.firstName} ${payment.patient.lastName}`
                      : 'Unknown patient';
                    const ref = payment.id.slice(-6).toUpperCase();
                    return (
                      <div
                        key={payment.id}
                        className="group flex items-center gap-3 px-5 py-2.5 transition-colors hover:bg-surface-50"
                      >
                        {/* Method icon tile */}
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${meta.chip}`}>
                          <meta.icon className={`h-4 w-4 ${meta.iconColor}`} />
                        </span>

                        {/* Patient + method chip */}
                        <div className="flex min-w-0 flex-1 items-center gap-2.5">
                          <p className="truncate font-medium text-surface-900">{patientName}</p>
                          <span className={`hidden shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium sm:inline-flex ${meta.chip}`}>
                            {meta.label}
                          </span>
                        </div>

                        {/* Reference (muted, lookup data) */}
                        <span className="hidden shrink-0 font-mono text-[11px] text-surface-300 lg:inline" title="Reference">
                          #{ref}
                        </span>

                        {/* Amount */}
                        <span className="w-28 shrink-0 text-right font-display text-base font-semibold tabular-nums text-success-700">
                          +{formatCurrency(payment.amount)}
                        </span>

                        {/* Actions */}
                        <div className="flex w-20 shrink-0 items-center justify-end gap-0.5">
                          {deleteConfirmId === payment.id ? (
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleDeletePayment(payment)} className="rounded-md bg-danger-600 px-2 py-1 text-xs font-medium text-white hover:bg-danger-700">Delete</button>
                              <button onClick={() => setDeleteConfirmId(null)} className="rounded-md px-1.5 py-1 text-xs font-medium text-surface-500 hover:bg-surface-100">Cancel</button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-0.5 lg:opacity-0 lg:transition-opacity lg:group-hover:opacity-100">
                              <button onClick={() => handleEditPayment(payment)} title="Edit payment" className="rounded-md p-1.5 text-surface-400 transition-colors hover:bg-surface-100 hover:text-primary-600">
                                <Edit className="h-4 w-4" />
                              </button>
                              <button onClick={() => setDeleteConfirmId(payment.id)} title="Delete payment" className="rounded-md p-1.5 text-surface-400 transition-colors hover:bg-danger-50 hover:text-danger-600">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-surface-500">
            Showing {startIndex + 1}–{Math.min(endIndex, filteredPayments.length)} of {filteredPayments.length}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 rounded-lg border border-surface-300 px-3 py-1.5 text-sm transition-colors hover:bg-surface-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 rounded-lg border border-surface-300 px-3 py-1.5 text-sm transition-colors hover:bg-surface-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={selectedPayment ? 'Edit Payment' : 'Create New Payment'}
      >
        <PaymentForm payment={selectedPayment} onSave={handleModalSave} onCancel={handleModalClose} token={token} />
      </Modal>
    </div>
  );
};

export default PaymentTable;
