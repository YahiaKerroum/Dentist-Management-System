import React, { useEffect, useState } from 'react';
import { getExpenses, deleteExpense, approveExpense } from '../../services/expense.service';
import { Expense } from '../../types/expense.types';
import { ExpenseForm } from './ExpenseForm';
import { ExpenseDetailModal } from './ExpenseDetailModal';
import { Plus, Search, X, Edit, Trash2, Loader2, ChevronLeft, ChevronRight, CheckCircle, Clock, Receipt } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';
import { toast } from '../ui/Toaster';

interface ExpenseTableProps {
  token: string;
}

const ITEMS_PER_PAGE = 10;

const CATEGORIES = ['All', 'Equipment', 'Supplies', 'Utilities', 'Salaries', 'Rent', 'Maintenance', 'Insurance', 'Marketing', 'Other'];
const STATUSES = ['All', 'Approved', 'Pending'];
const SORT_OPTIONS = [
  { value: 'date-desc', label: 'Date (Newest First)' },
  { value: 'date-asc', label: 'Date (Oldest First)' },
  { value: 'amount-desc', label: 'Amount (Highest First)' },
  { value: 'amount-asc', label: 'Amount (Lowest First)' },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const formatShortDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export const ExpenseTable: React.FC<ExpenseTableProps> = ({ token }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date-desc');

  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailExpense, setDetailExpense] = useState<Expense | null>(null);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getExpenses(token);
      const anyRes: any = response;
      if (Array.isArray(anyRes)) {
        setExpenses(anyRes);
      } else if (anyRes && anyRes.data) {
        setExpenses(anyRes.data);
      } else {
        setError(anyRes?.message || 'Failed to load expenses');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, statusFilter, sortBy]);

  let filteredExpenses = expenses.filter((expense) => {
    const matchesCategory = categoryFilter === 'All' || expense.category === categoryFilter;
    const matchesStatus =
      statusFilter === 'All' || (statusFilter === 'Approved' ? expense.approved : !expense.approved);
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      expense.category.toLowerCase().includes(query) ||
      expense.paidTo?.toLowerCase().includes(query) ||
      expense.notes?.toLowerCase().includes(query);
    return matchesCategory && matchesStatus && matchesSearch;
  });

  filteredExpenses = [...filteredExpenses].sort((a, b) => {
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

  let cumulative = 0;
  const withRunningTotal = filteredExpenses.map((expense) => {
    cumulative += Number(expense.amount || 0);
    return { expense, runningTotal: cumulative };
  });

  const maxAmount = Math.max(1, ...filteredExpenses.map((e) => Number(e.amount || 0)));

  const handleClearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('All');
    setStatusFilter('All');
    setSortBy('date-desc');
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteExpense(id, token);
      toast.success('Expense deleted successfully');
      setDeleteConfirmId(null);
      fetchExpenses();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete expense');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveExpense(id, token);
      toast.success('Expense approved successfully');
      fetchExpenses();
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve expense');
    }
  };

  const handleCreate = () => {
    setSelectedExpense(null);
    setIsModalOpen(true);
  };

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedExpense(null);
  };

  const handleSaveSuccess = (message: string) => {
    handleModalClose();
    toast.success(message);
    fetchExpenses();
  };

  const handleViewDetail = (expense: Expense) => {
    setDetailExpense(expense);
    setIsDetailModalOpen(true);
  };

  const handleDetailModalClose = () => {
    setIsDetailModalOpen(false);
    setDetailExpense(null);
  };

  const totalPages = Math.ceil(withRunningTotal.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentRows = withRunningTotal.slice(startIndex, endIndex);
  const pageTotal = currentRows.reduce((sum, r) => sum + Number(r.expense.amount || 0), 0);

  const hasActiveFilters =
    searchQuery !== '' || categoryFilter !== 'All' || statusFilter !== 'All' || sortBy !== 'date-desc';

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={16} />
          <input
            type="text"
            placeholder="Search by category, paid to, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-surface-300 py-2 pl-10 pr-9 focus:border-primary-500 focus:outline-none focus:shadow-focus"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-md border border-surface-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:shadow-focus"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-surface-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:shadow-focus"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? 'All Statuses' : s}
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
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="rounded-md px-3 py-2 text-sm text-surface-600 transition-colors hover:bg-surface-100 hover:text-surface-800"
            >
              Clear
            </button>
          )}
          <Button onClick={handleCreate}>
            <Plus size={16} />
            Add Expense
          </Button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-primary-600" size={32} />
          <span className="ml-3 text-surface-600">Loading expenses...</span>
        </div>
      )}

      {error && !loading && (
        <div className="mb-4 rounded-lg border border-danger-100 bg-danger-50 p-4 text-danger-700">{error}</div>
      )}

      {!loading && !error && (
        <div className="overflow-hidden rounded-lg border border-surface-200 bg-white shadow-sm">
          {/* Letterhead */}
          <div className="flex items-center justify-between gap-3 border-b border-surface-100 bg-gradient-to-r from-danger-50 via-danger-50/40 to-white px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-danger-600 text-white shadow-sm">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-surface-900">Expense Ledger</p>
                <p className="text-xs text-surface-500">{filteredExpenses.length} entries</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono text-lg font-bold tabular-nums text-danger-700">-{formatCurrency(cumulative)}</p>
              <p className="text-xs text-surface-400">total spent</p>
            </div>
          </div>

          {filteredExpenses.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No expenses found"
              description={expenses.length === 0 ? 'Click "Add Expense" to create one.' : 'Try adjusting your filters.'}
            />
          ) : (
            <>
              <div className="hidden grid-cols-[80px_1fr_100px_130px_130px_60px] gap-3 border-b border-surface-100 bg-surface-50 px-5 py-2 text-[11px] font-semibold uppercase tracking-wide text-surface-400 lg:grid">
                <span>Date</span>
                <span>Category / Paid To</span>
                <span>Status</span>
                <span className="text-right">Amount</span>
                <span className="text-right">Running Total</span>
                <span />
              </div>

              <div className="divide-y divide-surface-100">
                {currentRows.map(({ expense, runningTotal }) => {
                  const barPct = Math.max(4, (Number(expense.amount || 0) / maxAmount) * 100);
                  return (
                    <div
                      key={expense.id}
                      onClick={() => handleViewDetail(expense)}
                      className="group grid cursor-pointer grid-cols-1 gap-2 px-5 py-3 transition-colors hover:bg-surface-50 lg:grid-cols-[80px_1fr_100px_130px_130px_60px] lg:items-center lg:gap-3"
                    >
                      <span className="font-mono text-xs text-surface-500">{formatShortDate(expense.date)}</span>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-surface-900">
                          {expense.category}
                          <span className="text-surface-400"> · {expense.paidTo || 'N/A'}</span>
                        </p>
                        {expense.notes && <p className="truncate text-xs text-surface-400">{expense.notes}</p>}
                      </div>

                      <span
                        className={`inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          expense.approved ? 'bg-success-100 text-success-700' : 'bg-warning-100 text-warning-700'
                        }`}
                      >
                        {expense.approved ? <CheckCircle size={11} /> : <Clock size={11} />}
                        {expense.approved ? 'Approved' : 'Pending'}
                      </span>

                      <div className="relative flex items-center justify-end overflow-hidden rounded">
                        <div className="absolute inset-y-0 right-0 bg-danger-100/70" style={{ width: `${barPct}%` }} />
                        <span className="relative px-1.5 font-mono text-sm font-semibold tabular-nums text-danger-700">
                          -{formatCurrency(Number(expense.amount))}
                        </span>
                      </div>

                      <span className="text-right font-mono text-xs tabular-nums text-surface-400">
                        -{formatCurrency(runningTotal)}
                      </span>

                      <div
                        className="flex justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {!expense.approved && (
                          <button
                            onClick={() => handleApprove(expense.id)}
                            className="text-success-600 transition-colors hover:text-success-700"
                            title="Approve"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(expense)}
                          className="text-primary-600 transition-colors hover:text-primary-700"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        {deleteConfirmId === expense.id ? (
                          <div className="flex items-center gap-1.5 opacity-100">
                            <button
                              onClick={() => handleDelete(expense.id)}
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
                            onClick={() => setDeleteConfirmId(expense.id)}
                            className="text-surface-400 transition-colors hover:text-danger-600"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between border-t border-surface-200 bg-surface-50 px-5 py-2.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-surface-500">Page subtotal</span>
                <span className="font-mono text-sm font-bold tabular-nums text-danger-700">-{formatCurrency(pageTotal)}</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-surface-500">
            Showing {startIndex + 1}–{Math.min(endIndex, filteredExpenses.length)} of {filteredExpenses.length}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 rounded-lg border border-surface-300 px-3 py-1.5 text-sm transition-colors hover:bg-surface-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 rounded-lg border border-surface-300 px-3 py-1.5 text-sm transition-colors hover:bg-surface-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Modal for create/edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={selectedExpense ? 'Edit Expense' : 'Add New Expense'}
      >
        <ExpenseForm expense={selectedExpense} onSave={handleSaveSuccess} onCancel={handleModalClose} token={token} />
      </Modal>

      {/* Modal for viewing details */}
      <ExpenseDetailModal isOpen={isDetailModalOpen} onClose={handleDetailModalClose} expense={detailExpense} />
    </div>
  );
};
