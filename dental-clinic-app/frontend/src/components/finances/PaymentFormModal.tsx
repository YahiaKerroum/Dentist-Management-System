import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, Loader2 } from 'lucide-react';
import { createPayment, updatePayment } from '../../services/payment.service';
import { Payment, CreatePaymentData, UpdatePaymentData } from '../../types/payment.types';
import { Patient } from '../../types/patient';
import { getPatients } from '../../services/patient.service';

interface PaymentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
  onSave: () => void;
}

interface FormData {
  name: string;
  patientId: string;
  date: string;
  amount: string;
  method: string;
  notes: string;
}

interface FormErrors {
  name?: string;
  patientId?: string;
  date?: string;
  amount?: string;
  method?: string;
  notes?: string;
}

const PAYMENT_METHODS = [
  { value: '', label: 'Select method (optional)' },
  { value: 'CASH', label: 'Cash' },
  { value: 'CARD', label: 'Card' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'INSURANCE', label: 'Insurance' },
  { value: 'OTHER', label: 'Other' },
];

const PaymentFormModal: React.FC<PaymentFormModalProps> = ({
  isOpen,
  onClose,
  payment,
  onSave,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    patientId: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    method: '',
    notes: '',
  });

  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string>('');

  // Load patients when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchPatients();
    }
  }, [isOpen]);

  // Pre-populate form when editing
  useEffect(() => {
    if (payment) {
      setFormData({
        name: payment.name,
        patientId: payment.patientId,
        date: payment.date.split('T')[0], // Extract date part
        amount: payment.amount.toString(),
        method: payment.method || '',
        notes: payment.notes || '',
      });
      
      // Set search query to patient name for display
      if (payment.patient) {
        setPatientSearchQuery(`${payment.patient.firstName} ${payment.patient.lastName}`);
      }
    } else {
      // Reset form for new payment
      setFormData({
        name: '',
        patientId: '',
        date: new Date().toISOString().split('T')[0],
        amount: '',
        method: '',
        notes: '',
      });
      setPatientSearchQuery('');
    }
    
    setErrors({});
    setServerError('');
  }, [payment, isOpen]);

  const fetchPatients = async () => {
    try {
      setLoadingPatients(true);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setServerError('Authentication token not found. Please login again.');
        return;
      }
      
      const response = await getPatients(token);
      
      // Extract patients array from response
      const data = response.data || [];
      setPatients(data);
    } catch (err) {
      console.error('Error fetching patients:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load patients';
      setServerError(errorMessage);
    } finally {
      setLoadingPatients(false);
    }
  };

  // Filter patients based on search query
  const filteredPatients = useMemo(() => {
    if (!patientSearchQuery.trim()) {
      return patients;
    }
    
    const query = patientSearchQuery.toLowerCase();
    return patients.filter(patient => {
      const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
      return fullName.includes(query);
    });
  }, [patients, patientSearchQuery]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handlePatientSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPatientSearchQuery(e.target.value);
    setShowPatientDropdown(true);
    
    // Clear patient selection if user is typing
    if (formData.patientId) {
      setFormData(prev => ({ ...prev, patientId: '' }));
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    setFormData(prev => ({ ...prev, patientId: patient.id }));
    setPatientSearchQuery(`${patient.firstName} ${patient.lastName}`);
    setShowPatientDropdown(false);
    
    // Clear patient error
    if (errors.patientId) {
      setErrors(prev => ({ ...prev, patientId: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Payment name is required';
    }

    if (!formData.patientId) {
      newErrors.patientId = 'Please select a patient';
    }

    if (!formData.date) {
      newErrors.date = 'Payment date is required';
    }

    if (!formData.amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount)) {
        newErrors.amount = 'Amount must be a valid number';
      } else if (amount < 0) {
        newErrors.amount = 'Amount must be a positive number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setServerError('');

    try {
      const paymentData = {
        name: formData.name.trim(),
        patientId: formData.patientId,
        date: formData.date,
        amount: parseFloat(formData.amount),
        method: formData.method || undefined,
        notes: formData.notes.trim() || undefined,
      };

      if (payment) {
        // Update existing payment
        await updatePayment(payment.id, paymentData as UpdatePaymentData);
      } else {
        // Create new payment
        await createPayment(paymentData as CreatePaymentData);
      }

      // Success - notify parent and close modal
      onSave();
      handleClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save payment';
      setServerError(errorMessage);
      console.error('Error saving payment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {payment ? 'Edit Payment' : 'Create New Payment'}
          </h2>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Server Error */}
          {serverError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {serverError}
            </div>
          )}

          {/* Payment Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Payment Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Consultation Payment"
              disabled={submitting}
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>

          {/* Patient Selection */}
          <div className="relative">
            <label htmlFor="patient" className="block text-sm font-medium text-gray-700 mb-1">
              Patient <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                id="patient"
                value={patientSearchQuery}
                onChange={handlePatientSearchChange}
                onFocus={() => setShowPatientDropdown(true)}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.patientId ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Search patient by name..."
                disabled={submitting}
                autoComplete="off"
              />
              {loadingPatients && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 animate-spin text-gray-400" />
              )}
            </div>
            
            {/* Patient Dropdown */}
            {showPatientDropdown && filteredPatients.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredPatients.map(patient => (
                  <button
                    key={patient.id}
                    type="button"
                    onClick={() => handlePatientSelect(patient)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">
                      {patient.firstName} {patient.lastName}
                    </div>
                    {patient.email && (
                      <div className="text-sm text-gray-500">{patient.email}</div>
                    )}
                  </button>
                ))}
              </div>
            )}
            
            {errors.patientId && <p className="mt-1 text-sm text-red-500">{errors.patientId}</p>}
          </div>

          {/* Date and Amount Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.date ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={submitting}
              />
              {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
            </div>

            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.amount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
                disabled={submitting}
              />
              {errors.amount && <p className="mt-1 text-sm text-red-500">{errors.amount}</p>}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label htmlFor="method" className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <select
              id="method"
              name="method"
              value={formData.method}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={submitting}
            >
              {PAYMENT_METHODS.map(method => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Add any additional notes..."
              disabled={submitting}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? 'Saving...' : payment ? 'Update Payment' : 'Create Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentFormModal;