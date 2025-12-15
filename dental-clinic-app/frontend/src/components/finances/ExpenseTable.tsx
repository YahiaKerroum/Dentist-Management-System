import React, { useEffect, useState, useCallback } from 'react';
import { getExpenses, deleteExpense, searchExpenses } from '../../services/expense.service';
import { Expense } from '../../types/expense.types';
import { ExpenseFormModal } from './ExpenseFormModal';
import { Plus, Search, X, Edit, Trash2, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

interface ExpenseTableProps {
  token: string;
}

// Items per page for pagination
const ITEMS_PER_PAGE = 10;

export const ExpenseTable: React.FC<ExpenseTableProps> = ({ token }) => {
  // Data state
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Show toast message
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch all expenses
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

  // Debounced search
  const debounce = (func: Function, delay: number) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  // Search expenses
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      fetchExpenses();
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await searchExpenses(query, token);
      const anyRes: any = response;
      if (Array.isArray(anyRes)) {
        setExpenses(anyRes);
      } else if (anyRes && anyRes.data) {
        setExpenses(anyRes.data);
      }
      setCurrentPage(1); // Reset to first page on search
    } catch (err: any) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((query: string) => performSearch(query), 500),
    [token]
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    fetchExpenses();
    setCurrentPage(1);
  };

  // Delete expense
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      await deleteExpense(id, token);
      showToast('Expense deleted successfully', 'success');
      fetchExpenses();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete expense', 'error');
    }
  };

  // Open modal for creating new expense
  const handleCreate = () => {
    setSelectedExpense(null);
    setIsModalOpen(true);
  };

  // Open modal for editing expense
  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsModalOpen(true);
  };

  // Close modal
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedExpense(null);
  };

  // After successful save
  const handleSaveSuccess = (message: string) => {
    handleModalClose();
    showToast(message, 'success');
    fetchExpenses();
  };

  // Pagination calculations
  const totalPages = Math.ceil(expenses.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentExpenses = expenses.slice(startIndex, endIndex);

  // Pagination handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [token]);

  // Format amount as currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="p-5">
      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}
        >
          {toast.message}
        </div>
      )}

      {/* Header with title and create button */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-semibold text-gray-800">Expenses</h2>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={20} />
          Add Expense
        </button>
      </div>

      {/* Search bar */}
      <div className="mb-5 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by category, paid to, or notes..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Loading spinner */}
      {loading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="animate-spin text-blue-600" size={40} />
          <span className="ml-3 text-gray-600">Loading expenses...</span>
        </div>
      )}

      {/* Error message */}
      {error && !loading && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && expenses.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          <p className="text-lg">No expenses found.</p>
          <p className="mt-2">Click "Add Expense" to create one.</p>
        </div>
      )}

      {/* Expenses table */}
      {!loading && !error && expenses.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-3 border-b-2 border-gray-200 font-semibold">Category</th>
                  <th className="p-3 border-b-2 border-gray-200 font-semibold">Paid To</th>
                  <th className="p-3 border-b-2 border-gray-200 font-semibold">Amount</th>
                  <th className="p-3 border-b-2 border-gray-200 font-semibold">Date</th>
                  <th className="p-3 border-b-2 border-gray-200 font-semibold">Notes</th>
                  <th className="p-3 border-b-2 border-gray-200 font-semibold">Status</th>
                  <th className="p-3 border-b-2 border-gray-200 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentExpenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-3">{expense.category}</td>
                    <td className="p-3">{expense.paidTo || 'N/A'}</td>
                    <td className="p-3 font-medium">{formatCurrency(Number(expense.amount))}</td>
                    <td className="p-3">{formatDate(expense.date)}</td>
                    <td className="p-3 max-w-xs truncate">{expense.notes || 'N/A'}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${
                          expense.approved
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {expense.approved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4 px-2">
              <span className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, expenses.length)} of {expenses.length} expenses
              </span>
              <div className="flex gap-2">
                <button
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <ChevronLeft size={18} />
                  Previous
                </button>
                <span className="flex items-center px-3 py-2 text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Next
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal for create/edit */}
      <ExpenseFormModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleSaveSuccess}
        expense={selectedExpense}
        token={token}
      />
    </div>
  );
};