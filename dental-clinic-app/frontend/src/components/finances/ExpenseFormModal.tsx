import React, { useState, useEffect } from 'react';
import { createExpense, updateExpense } from '../../services/expense.service';
import { Expense, CreateExpenseData, UpdateExpenseData } from '../../types/expense.types';
import { X, Loader2, DollarSign } from 'lucide-react';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (message: string) => void;
  expense: Expense | null;
  token: string;
}

// Suggested categories for dropdown
const CATEGORIES = [
  'Equipment',
  'Supplies',
  'Utilities',
  'Salaries',
  'Rent',
  'Maintenance',
  'Insurance',
  'Marketing',
  'Other',
];

export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  expense,
  token,
}) => {
  // Form state
  const [category, setCategory] = useState('');
  const [paidTo, setPaidTo] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  // Check if we're editing or creating
  const isEditing = expense !== null;

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Pre-populate form when editing
  useEffect(() => {
    if (isOpen) {
      if (expense) {
        // Editing: populate with expense data
        setCategory(expense.category || '');
        setPaidTo(expense.paidTo || '');
        setAmount(String(expense.amount) || '');
        setDate(expense.date ? expense.date.split('T')[0] : getTodayDate());
        setNotes(expense.notes || '');
      } else {
        // Creating: reset to defaults
        setCategory('');
        setPaidTo('');
        setAmount('');
        setDate(getTodayDate());
        setNotes('');
      }
      setError('');
      setValidationErrors({});
    }
  }, [isOpen, expense]);

  // Validate form
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!category.trim()) {
      errors.category = 'Category is required';
    }

    if (!paidTo.trim()) {
      errors.paidTo = 'Paid To is required';
    }

    if (!amount) {
      errors.amount = 'Amount is required';
    } else if (isNaN(Number(amount)) || Number(amount) <= 0) {
      errors.amount = 'Amount must be a positive number';
    }

    if (!date) {
      errors.date = 'Date is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isEditing && expense) {
        // Update existing expense
        const updateData: UpdateExpenseData = {
          category,
          paidTo,
          amount: Number(amount),
          date,
          notes,
        };
        await updateExpense(expense.id, updateData, token);
        onSave('Expense updated successfully');
      } else {
        // Create new expense
        const createData: CreateExpenseData = {
          category,
          paidTo,
          amount: Number(amount),
          date,
          notes,
        };
        await createExpense(createData, token);
        onSave('Expense created successfully');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-semibold text-surface-800">
            {isEditing ? 'Edit Expense' : 'Add New Expense'}
          </h3>
          <button
            onClick={onClose}
            className="text-surface-500 hover:text-surface-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4">
          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Category field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-surface-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.category ? 'border-red-500' : 'border-surface-300'
              }`}
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {validationErrors.category && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.category}</p>
            )}
          </div>

          {/* Paid To field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-surface-700 mb-1">
              Paid To <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={paidTo}
              onChange={(e) => setPaidTo(e.target.value)}
              placeholder="Enter vendor or recipient name"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.paidTo ? 'border-red-500' : 'border-surface-300'
              }`}
            />
            {validationErrors.paidTo && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.paidTo}</p>
            )}
          </div>

          {/* Amount field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-surface-700 mb-1">
              Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400"
                size={18}
              />
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.amount ? 'border-red-500' : 'border-surface-300'
                }`}
              />
            </div>
            {validationErrors.amount && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.amount}</p>
            )}
          </div>

          {/* Date field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-surface-700 mb-1">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.date ? 'border-red-500' : 'border-surface-300'
              }`}
            />
            {validationErrors.date && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.date}</p>
            )}
          </div>

          {/* Notes field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-surface-700 mb-1">
              Notes <span className="text-surface-400">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes..."
              rows={3}
              className="w-full px-3 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Form buttons */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-surface-300 text-surface-700 rounded-lg hover:bg-surface-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 className="animate-spin" size={18} />}
              {loading ? 'Saving...' : isEditing ? 'Update Expense' : 'Create Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};