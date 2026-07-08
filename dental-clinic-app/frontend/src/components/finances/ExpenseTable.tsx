import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getExpenses, deleteExpense, approveExpense } from '../../services/expense.service';
import { Expense } from '../../types/expense.types';
import { queryKeys } from '../../lib/queryKeys';
import { ExpenseForm } from './ExpenseForm';
import { ExpenseDetailModal } from './ExpenseDetailModal';
import { Plus, Search, X, Edit, Trash2, Loader2, ChevronLeft, ChevronRight, CheckCircle, Clock, Receipt, CalendarDays, Tag } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';
import { toast } from '../ui/Toaster';
import { SummaryCard, categoryStyle, formatCurrency, groupByDay } from './financeUi';

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

export const ExpenseTable: React.FC<ExpenseTableProps> = ({ token }) => {
  const {
    data: expenses = [],
    isLoading: loading,
    error: queryError,
    refetch: fetchExpenses,
  } = useQuery({
    queryKey: queryKeys.expenses,
    queryFn: async () => {
      const response: any = await getExpenses(token);
      if (Array.isArray(response)) return response as Expense[];
      if (response && response.data) return response.data as Expense[];
      throw new Error(response?.message || 'Failed to load expenses');
    },
  });
  const error = queryError ? (queryError instanceof Error ? queryError.message : 'An error occurred') : '';

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

  // Summary metrics over the filtered set
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
  const totalSpent = filteredExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const pendingList = filteredExpenses.filter((e) => !e.approved);
  const pendingAmount = pendingList.reduce((s, e) => s + Number(e.amount || 0), 0);
  const thisMonthTotal = filteredExpenses
    .filter((e) => new Date(e.date).getTime() >= monthStart)
    .reduce((s, e) => s + Number(e.amount || 0), 0);
  const lastMonthTotal = filteredExpenses
    .filter((e) => {
      const t = new Date(e.date).getTime();
      return t >= lastMonthStart && t < monthStart;
    })
    .reduce((s, e) => s + Number(e.amount || 0), 0);
  const catTotals = new Map<string, number>();
  filteredExpenses.forEach((e) => catTotals.set(e.category, (catTotals.get(e.category) || 0) + Number(e.amount || 0)));
  const topCategory = [...catTotals.entries()].sort((a, b) => b[1] - a[1])[0];

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

  const totalPages = Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const pageExpenses = filteredExpenses.slice(startIndex, endIndex);
  const dayGroups = groupByDay(pageExpenses, (e) => e.date);

  const hasActiveFilters =
    searchQuery !== '' || categoryFilter !== 'All' || statusFilter !== 'All' || sortBy !== 'date-desc';

  return (
    <div>
      {/* Summary strip */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard label="Total spent" value={formatCurrency(totalSpent)} sub={`${filteredExpenses.length} expenses`} icon={Receipt} tone="danger" />
        <SummaryCard label="Pending approval" value={formatCurrency(pendingAmount)} sub={`${pendingList.length} awaiting`} icon={Clock} tone="warning" />
        <SummaryCard label="This month" value={formatCurrency(thisMonthTotal)} sub={`vs ${formatCurrency(lastMonthTotal)} last month`} icon={CalendarDays} />
        <SummaryCard label="Top category" value={topCategory ? topCategory[0] : '—'} sub={topCategory ? formatCurrency(topCategory[1]) : undefined} icon={Tag} />
      </div>

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
        <div className="overflow-hidden rounded-xl border border-surface-200 bg-white shadow-xs">
          {filteredExpenses.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No expenses found"
              description={expenses.length === 0 ? 'Click "Add Expense" to create one.' : 'Try adjusting your filters.'}
            />
          ) : (
            dayGroups.map((group) => {
              const daySum = group.rows.reduce((s, e) => s + Number(e.amount || 0), 0);
              return (
                <div key={group.key}>
                  {/* Day divider */}
                  <div className="flex items-center justify-between border-b border-surface-100 bg-surface-50/70 px-5 py-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wide text-surface-400">{group.label}</span>
                    <span className="text-xs font-medium tabular-nums text-surface-500">-{formatCurrency(daySum)}</span>
                  </div>

                  <div className="divide-y divide-surface-100">
                    {group.rows.map((expense) => {
                      const cat = categoryStyle(expense.category);
                      return (
                        <div
                          key={expense.id}
                          onClick={() => handleViewDetail(expense)}
                          className={`group flex cursor-pointer items-center gap-3 px-5 py-2.5 transition-colors hover:bg-surface-50 ${
                            expense.approved ? '' : 'bg-warning-50/40'
                          }`}
                        >
                          {/* Vendor + category chip */}
                          <div className="flex min-w-0 flex-1 items-center gap-2.5">
                            <p className="truncate font-medium text-surface-900">{expense.paidTo || 'Unspecified vendor'}</p>
                            <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${cat.chip}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${cat.dot}`} />
                              {expense.category}
                            </span>
                          </div>

                          {/* Status pill */}
                          <span
                            className={`hidden shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium sm:inline-flex ${
                              expense.approved ? 'bg-success-50 text-success-700' : 'bg-warning-50 text-warning-700'
                            }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${expense.approved ? 'bg-success-500' : 'bg-warning-500'}`} />
                            {expense.approved ? 'Approved' : 'Pending'}
                          </span>

                          {/* Amount */}
                          <span className="w-28 shrink-0 text-right font-display text-base font-semibold tabular-nums text-danger-600">
                            -{formatCurrency(Number(expense.amount))}
                          </span>

                          {/* Actions */}
                          <div className="flex w-24 shrink-0 items-center justify-end gap-0.5" onClick={(e) => e.stopPropagation()}>
                            {deleteConfirmId === expense.id ? (
                              <div className="flex items-center gap-1">
                                <button onClick={() => handleDelete(expense.id)} className="rounded-md bg-danger-600 px-2 py-1 text-xs font-medium text-white hover:bg-danger-700">Delete</button>
                                <button onClick={() => setDeleteConfirmId(null)} className="rounded-md px-1.5 py-1 text-xs font-medium text-surface-500 hover:bg-surface-100">Cancel</button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-0.5 lg:opacity-0 lg:transition-opacity lg:group-hover:opacity-100">
                                {!expense.approved && (
                                  <button onClick={() => handleApprove(expense.id)} title="Approve" className="rounded-md p-1.5 text-surface-400 transition-colors hover:bg-success-50 hover:text-success-600">
                                    <CheckCircle size={16} />
                                  </button>
                                )}
                                <button onClick={() => handleEdit(expense)} title="Edit" className="rounded-md p-1.5 text-surface-400 transition-colors hover:bg-surface-100 hover:text-primary-600">
                                  <Edit size={16} />
                                </button>
                                <button onClick={() => setDeleteConfirmId(expense.id)} title="Delete" className="rounded-md p-1.5 text-surface-400 transition-colors hover:bg-danger-50 hover:text-danger-600">
                                  <Trash2 size={16} />
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
