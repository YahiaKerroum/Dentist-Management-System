import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { getAllPayments, deletePayment } from '../../services/payment.service';
import { Payment } from '../../types/payment.types';
import PaymentFormModal from './PaymentFormModal';
import { toast } from '../ui/Toaster';

const PaymentTable: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Fetch payments on component mount
  useEffect(() => {
    fetchPayments();
  }, []);

  // Filter payments when search query changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      filterPayments();
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, payments]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError('');
      
      const data = await getAllPayments();
      setPayments(data);
      setFilteredPayments(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch payments. Please try again.';
      setError(errorMessage);
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = () => {
    if (!searchQuery.trim()) {
      setFilteredPayments(payments);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = payments.filter(payment => {
      const patientFullName = payment.patient 
        ? `${payment.patient.firstName} ${payment.patient.lastName}`.toLowerCase()
        : '';
      
      return (
        patientFullName.includes(query) ||
        payment.method?.toLowerCase().includes(query) ||
        payment.amount.toString().includes(query) ||
        payment.notes?.toLowerCase().includes(query)
      );
    });
    
    setFilteredPayments(filtered);
    setCurrentPage(1);
  };

  const handleCreatePayment = () => {
    setSelectedPayment(null);
    setIsModalOpen(true);
  };

  const handleEditPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  const handleDeletePayment = async (payment: Payment) => {
    const patientName = payment.patient 
      ? `${payment.patient.firstName} ${payment.patient.lastName}`
      : 'this payment';
    
    const confirmed = window.confirm(
      `Are you sure you want to delete the payment for ${patientName}?`
    );

    if (!confirmed) return;

    try {
      await deletePayment(payment.id);
      toast.success('Payment deleted successfully');
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
    await fetchPayments();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Pagination
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPayments = filteredPayments.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#26a37e' }} />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-900 mb-4">Payments</h1>
        
        {/* Search and Create Button */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search payments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-[#26a37e] focus:border-transparent"
            />
          </div>
          
          <button
            onClick={handleCreatePayment}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors"
            style={{ backgroundColor: '#26a37e' }}
          >
            <Plus className="w-5 h-5" />
            Create Payment
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredPayments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-surface-500 text-lg">
            {searchQuery ? 'No payments found matching your search.' : 'No payments yet. Create your first payment!'}
          </p>
        </div>
      )}

      {/* Table */}
      {filteredPayments.length > 0 && (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-surface-200">
                <thead className="bg-surface-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
                      Patient Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-surface-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-surface-200">
                  {currentPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-surface-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-surface-900">
                        {payment.patient 
                          ? `${payment.patient.firstName} ${payment.patient.lastName}`
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-700">
                        {formatDate(payment.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-surface-900">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-700">
                        {payment.method || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEditPayment(payment)}
                            className="p-2 rounded-lg transition-colors hover:bg-[#effcf6]"
                            style={{ color: '#26a37e' }}
                            title="Edit payment"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePayment(payment)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete payment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-surface-700">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredPayments.length)} of {filteredPayments.length} results
              </p>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-surface-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-50 transition-colors"
                >
                  Previous
                </button>
                
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? 'text-white'
                            : 'border border-surface-300 hover:bg-surface-50'
                        }`}
                        style={currentPage === pageNum ? { backgroundColor: '#26a37e' } : {}}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-surface-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Payment Modal */}
      <PaymentFormModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        payment={selectedPayment}
        onSave={handleModalSave}
      />
    </div>
  );
};

export default PaymentTable;