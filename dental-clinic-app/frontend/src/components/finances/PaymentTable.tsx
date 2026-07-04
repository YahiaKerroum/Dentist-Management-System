import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Loader2, Wallet, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAllPayments, deletePayment } from '../../services/payment.service';
import { Payment } from '../../types/payment.types';
import { PaymentForm } from './PaymentForm';
import { toast } from '../ui/Toaster';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';

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

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const formatShortDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const PaymentTable: React.FC<PaymentTableProps> = ({ token }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [methodFilter, setMethodFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date-desc');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAllPayments();
      setPayments(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch payments. Please try again.';
      setError(errorMessage);
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

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

  // Running total computed over the full filtered/sorted ledger, then sliced per page.
  let cumulative = 0;
  const withRunningTotal = filteredPayments.map((payment) => {
    cumulative += Number(payment.amount || 0);
    return { payment, runningTotal: cumulative };
  });

  const maxAmount = Math.max(1, ...filteredPayments.map((p) => Number(p.amount || 0)));

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

  const totalPages = Math.ceil(withRunningTotal.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentRows = withRunningTotal.slice(startIndex, endIndex);
  const pageTotal = currentRows.reduce((sum, r) => sum + Number(r.payment.amount || 0), 0);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div>
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
      <div className="overflow-hidden rounded-lg border border-surface-200 bg-white shadow-sm">
        {/* Letterhead */}
        <div className="flex items-center justify-between gap-3 border-b border-surface-100 bg-gradient-to-r from-success-50 via-success-50/40 to-white px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success-600 text-white shadow-sm">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-surface-900">Payment Ledger</p>
              <p className="text-xs text-surface-500">{filteredPayments.length} entries</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-mono text-lg font-bold tabular-nums text-success-700">
              +{formatCurrency(cumulative)}
            </p>
            <p className="text-xs text-surface-400">total received</p>
          </div>
        </div>

        {filteredPayments.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title={searchQuery || methodFilter !== 'All' ? 'No payments found matching your filters.' : 'No payments yet'}
            description={searchQuery || methodFilter !== 'All' ? undefined : 'Create your first payment to start the ledger.'}
          />
        ) : (
          <>
            {/* Column header */}
            <div className="hidden grid-cols-[80px_1fr_100px_130px_130px_60px] gap-3 border-b border-surface-100 bg-surface-50 px-5 py-2 text-[11px] font-semibold uppercase tracking-wide text-surface-400 lg:grid">
              <span>Date</span>
              <span>Patient / Notes</span>
              <span>Method</span>
              <span className="text-right">Amount</span>
              <span className="text-right">Running Total</span>
              <span />
            </div>

            <div className="divide-y divide-surface-100">
              {currentRows.map(({ payment, runningTotal }) => {
                const barPct = Math.max(4, (Number(payment.amount || 0) / maxAmount) * 100);
                const patientName = payment.patient
                  ? `${payment.patient.firstName} ${payment.patient.lastName}`
                  : 'N/A';
                return (
                  <div
                    key={payment.id}
                    className="group grid grid-cols-1 gap-2 px-5 py-3 transition-colors hover:bg-surface-50 lg:grid-cols-[80px_1fr_100px_130px_130px_60px] lg:items-center lg:gap-3"
                  >
                    <span className="font-mono text-xs text-surface-500">{formatShortDate(payment.date)}</span>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-surface-900">{patientName}</p>
                      {payment.notes && <p className="truncate text-xs text-surface-400">{payment.notes}</p>}
                    </div>

                    <span className="font-mono text-[11px] text-surface-500">
                      {payment.method ? `[${payment.method}]` : '—'}
                    </span>

                    <div className="relative flex items-center justify-end overflow-hidden rounded">
                      <div
                        className="absolute inset-y-0 right-0 bg-success-100/70"
                        style={{ width: `${barPct}%` }}
                      />
                      <span className="relative px-1.5 font-mono text-sm font-semibold tabular-nums text-success-700">
                        +{formatCurrency(payment.amount)}
                      </span>
                    </div>

                    <span className="text-right font-mono text-xs tabular-nums text-surface-400">
                      {formatCurrency(runningTotal)}
                    </span>

                    <div className="flex justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => handleEditPayment(payment)}
                        className="text-primary-600 transition-colors hover:text-primary-700"
                        title="Edit payment"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {deleteConfirmId === payment.id ? (
                        <div className="flex items-center gap-1.5 opacity-100">
                          <button
                            onClick={() => handleDeletePayment(payment)}
                            className="rounded bg-danger-600 px-1.5 py-0.5 text-[11px] text-white hover:bg-danger-700"
                          >
                            Confirm
                          </button>
                          <button onClick={() => setDeleteConfirmId(null)} className="text-surface-500 hover:text-surface-700">
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(payment.id)}
                          className="text-surface-400 transition-colors hover:text-danger-600"
                          title="Delete payment"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Page subtotal */}
            <div className="flex items-center justify-between border-t border-surface-200 bg-surface-50 px-5 py-2.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-surface-500">Page subtotal</span>
              <span className="font-mono text-sm font-bold tabular-nums text-success-700">+{formatCurrency(pageTotal)}</span>
            </div>
          </>
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
