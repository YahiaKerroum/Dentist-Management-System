import { useState, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import { AlertCircle, Tag, DollarSign, FileText, Receipt, CheckCircle, Clock, Calendar } from 'lucide-react';
import { createExpense, updateExpense } from '../../services/expense.service';
import { Expense, CreateExpenseData, UpdateExpenseData } from '../../types/expense.types';
import { Button } from '../ui/Button';

interface ExpenseFormProps {
  expense: Expense | null;
  onSave: (message: string) => void;
  onCancel: () => void;
  token: string;
}

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

const SECTION_TONE: Record<'primary' | 'info' | 'surface', string> = {
  primary: 'bg-primary-50 text-primary-700 border-primary-100',
  info: 'bg-info-50 text-info-700 border-info-100',
  surface: 'bg-surface-100 text-surface-600 border-surface-200',
};

function FormSection({
  icon: Icon,
  title,
  tone,
  children,
}: {
  icon: LucideIcon;
  title: string;
  tone: keyof typeof SECTION_TONE;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-surface-200">
      <div className={`flex items-center gap-2 border-b px-4 py-2.5 ${SECTION_TONE[tone]}`}>
        <Icon className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase tracking-wide">{title}</span>
      </div>
      <div className="space-y-4 p-4">{children}</div>
    </div>
  );
}

export function ExpenseForm({ expense, onSave, onCancel, token }: ExpenseFormProps) {
  const [category, setCategory] = useState('');
  const [paidTo, setPaidTo] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  const isEditing = expense !== null;

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (expense) {
      setCategory(expense.category || '');
      setPaidTo(expense.paidTo || '');
      setAmount(String(expense.amount) || '');
      setDate(expense.date ? expense.date.split('T')[0] : getTodayDate());
      setNotes(expense.notes || '');
    } else {
      setCategory('');
      setPaidTo('');
      setAmount('');
      setDate(getTodayDate());
      setNotes('');
    }
    setError('');
    setValidationErrors({});
  }, [expense]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isEditing && expense) {
        const updateData: UpdateExpenseData = { category, paidTo, amount: Number(amount), date, notes };
        await updateExpense(expense.id, updateData, token);
        onSave('Expense updated successfully');
      } else {
        const createData: CreateExpenseData = { category, paidTo, amount: Number(amount), date, notes };
        await createExpense(createData, token);
        onSave('Expense created successfully');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full rounded-lg border border-surface-300 bg-white pl-10 pr-4 py-2.5 text-sm text-surface-800 transition focus:border-primary-500 focus:outline-none focus:shadow-focus disabled:cursor-not-allowed disabled:bg-surface-50';

  const parsedAmount = Number(amount);
  const formattedAmount = amount && !isNaN(parsedAmount)
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parsedAmount)
    : '$0.00';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Live amount preview */}
      <div className="flex items-center gap-3 rounded-lg border border-danger-100 bg-danger-50 p-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-danger-100 text-danger-700">
          <Receipt className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold text-danger-700">-{formattedAmount}</p>
          <p className="text-xs text-surface-500">{isEditing ? 'Editing expense record' : 'Recording a new expense'}</p>
        </div>
        {isEditing && (
          <span
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
              expense?.approved ? 'bg-success-100 text-success-700' : 'bg-warning-100 text-warning-700'
            }`}
          >
            {expense?.approved ? <CheckCircle size={14} /> : <Clock size={14} />}
            {expense?.approved ? 'Approved' : 'Pending'}
          </span>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-danger-100 bg-danger-50 p-3 text-sm text-danger-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <FormSection icon={Tag} title="Expense Details" tone="primary">
        <div>
          <label className="mb-2 block text-sm font-medium text-surface-700">
            Category <span className="text-danger-500">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3">
              <Tag className="h-4 w-4 text-surface-400" />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`${inputClass} appearance-none ${validationErrors.category ? 'border-danger-500' : ''}`}
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          {validationErrors.category && <p className="mt-1 text-sm text-danger-600">{validationErrors.category}</p>}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-surface-700">
            Paid To <span className="text-danger-500">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Receipt className="h-4 w-4 text-surface-400" />
            </div>
            <input
              type="text"
              value={paidTo}
              onChange={(e) => setPaidTo(e.target.value)}
              placeholder="Enter vendor or recipient name"
              className={`${inputClass} ${validationErrors.paidTo ? 'border-danger-500' : ''}`}
            />
          </div>
          {validationErrors.paidTo && <p className="mt-1 text-sm text-danger-600">{validationErrors.paidTo}</p>}
        </div>
      </FormSection>

      <FormSection icon={DollarSign} title="Amount & Date" tone="info">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-surface-700">
              Amount <span className="text-danger-500">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-surface-400">$</div>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className={`${inputClass} ${validationErrors.amount ? 'border-danger-500' : ''}`}
              />
            </div>
            {validationErrors.amount && <p className="mt-1 text-sm text-danger-600">{validationErrors.amount}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-surface-700">
              Date <span className="text-danger-500">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Calendar className="h-4 w-4 text-surface-400" />
              </div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`${inputClass} ${validationErrors.date ? 'border-danger-500' : ''}`}
              />
            </div>
            {validationErrors.date && <p className="mt-1 text-sm text-danger-600">{validationErrors.date}</p>}
          </div>
        </div>
      </FormSection>

      <FormSection icon={FileText} title="Notes" tone="surface">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any additional notes..."
          rows={3}
          className="w-full resize-none rounded-lg border border-surface-300 bg-white px-3.5 py-2.5 text-sm text-surface-800 transition focus:border-primary-500 focus:outline-none focus:shadow-focus disabled:cursor-not-allowed disabled:bg-surface-50"
        />
      </FormSection>

      <div className="flex gap-3 border-t border-surface-100 pt-4">
        <Button type="submit" disabled={loading} isLoading={loading} className="flex-1">
          {isEditing ? 'Update Expense' : 'Create Expense'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
}
