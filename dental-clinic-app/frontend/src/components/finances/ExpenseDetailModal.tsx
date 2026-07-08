import React from 'react';
import { Expense } from '../../types/expense.types';
import { X, Calendar, Tag, User, FileText, CheckCircle, Clock } from 'lucide-react';

interface ExpenseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
}

export const ExpenseDetailModal: React.FC<ExpenseDetailModalProps> = ({
  isOpen,
  onClose,
  expense,
}) => {
  // Don't render if not open or no expense
  if (!isOpen || !expense) return null;

  // Format amount as currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-semibold text-surface-800">Expense Details</h3>
          <button
            onClick={onClose}
            className="text-surface-500 hover:text-surface-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Status Badge */}
          <div className="flex justify-center mb-6">
            <span
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                expense.approved
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {expense.approved ? (
                <>
                  <CheckCircle size={18} />
                  Approved
                </>
              ) : (
                <>
                  <Clock size={18} />
                  Pending Approval
                </>
              )}
            </span>
          </div>

          {/* Amount - Highlighted */}
          <div className="text-center mb-6">
            <p className="text-sm text-surface-500 mb-1">Amount</p>
            <p className="text-3xl font-bold text-surface-800">
              {formatCurrency(Number(expense.amount))}
            </p>
          </div>

          {/* Details Grid */}
          <div className="space-y-4">
            {/* Category */}
            <div className="flex items-start gap-3 p-3 bg-surface-50 rounded-lg">
              <Tag className="text-blue-600 mt-0.5" size={20} />
              <div>
                <p className="text-sm text-surface-500">Category</p>
                <p className="font-medium text-surface-800">{expense.category}</p>
              </div>
            </div>

            {/* Paid To */}
            <div className="flex items-start gap-3 p-3 bg-surface-50 rounded-lg">
              <User className="text-blue-600 mt-0.5" size={20} />
              <div>
                <p className="text-sm text-surface-500">Paid To</p>
                <p className="font-medium text-surface-800">{expense.paidTo || 'N/A'}</p>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-start gap-3 p-3 bg-surface-50 rounded-lg">
              <Calendar className="text-blue-600 mt-0.5" size={20} />
              <div>
                <p className="text-sm text-surface-500">Date</p>
                <p className="font-medium text-surface-800">{formatDate(expense.date)}</p>
              </div>
            </div>

            {/* Notes */}
            <div className="flex items-start gap-3 p-3 bg-surface-50 rounded-lg">
              <FileText className="text-blue-600 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="text-sm text-surface-500">Notes</p>
                <p className="font-medium text-surface-800 whitespace-pre-wrap">
                  {expense.notes || 'No notes provided'}
                </p>
              </div>
            </div>

            {/* Recorded By */}
            {expense.recordedBy && (
              <div className="flex items-start gap-3 p-3 bg-surface-50 rounded-lg">
                <User className="text-blue-600 mt-0.5" size={20} />
                <div>
                  <p className="text-sm text-surface-500">Recorded By</p>
                  <p className="font-medium text-surface-800">
                    {expense.recordedBy.firstName} {expense.recordedBy.lastName}
                  </p>
                </div>
              </div>
            )}

            {/* Approved By */}
            {expense.approved && expense.approvedBy && (
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="text-green-600 mt-0.5" size={20} />
                <div>
                  <p className="text-sm text-surface-500">Approved By</p>
                  <p className="font-medium text-surface-800">
                    {expense.approvedBy.firstName} {expense.approvedBy.lastName}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-surface-100 text-surface-700 rounded-lg hover:bg-surface-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};