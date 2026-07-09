import { useState, useEffect, useMemo } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Search, Loader2, AlertCircle, CalendarClock, Wallet, FileText, User } from 'lucide-react';
import { createPayment, updatePayment } from '../../services/payment.service';
import { Payment, CreatePaymentData, UpdatePaymentData } from '../../types/payment.types';
import { Patient } from '../../types/patient';
import { getPatients } from '../../services/patient.service';
import { Button } from '../ui/Button';

interface PaymentFormProps {
  payment: Payment | null;
  onSave: () => void;
  onCancel: () => void;
  token: string;
}

interface FormData {
  patientId: string;
  date: string;
  amount: string;
  method: string;
  notes: string;
}

interface FormErrors {
  patientId?: string;
  date?: string;
  amount?: string;
}

const PAYMENT_METHODS = [
  { value: '', label: 'Select method (optional)' },
  { value: 'CASH', label: 'Cash' },
  { value: 'CARD', label: 'Card' },
  { value: 'TRANSFER', label: 'Bank Transfer' },
  { value: 'INSURANCE', label: 'Insurance' },
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

export function PaymentForm({ payment, onSave, onCancel, token }: PaymentFormProps) {
  const [formData, setFormData] = useState<FormData>({
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

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (payment) {
      setFormData({
        patientId: payment.patientId,
        date: payment.date.split('T')[0],
        amount: payment.amount.toString(),
        method: payment.method || '',
        notes: payment.notes || '',
      });

      if (payment.patient) {
        setPatientSearchQuery(`${payment.patient.firstName} ${payment.patient.lastName}`);
      }
    } else {
      setFormData({
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
  }, [payment]);

  const fetchPatients = async () => {
    try {
      setLoadingPatients(true);
      const response = await getPatients(token);
      setPatients(response.data || []);
    } catch (err) {
      console.error('Error fetching patients:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load patients';
      setServerError(errorMessage);
    } finally {
      setLoadingPatients(false);
    }
  };

  const filteredPatients = useMemo(() => {
    if (!patientSearchQuery.trim()) {
      return patients;
    }

    const query = patientSearchQuery.toLowerCase();
    return patients.filter((patient) => {
      const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
      return fullName.includes(query);
    });
  }, [patients, patientSearchQuery]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handlePatientSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPatientSearchQuery(e.target.value);
    setShowPatientDropdown(true);

    if (formData.patientId) {
      setFormData((prev) => ({ ...prev, patientId: '' }));
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    setFormData((prev) => ({ ...prev, patientId: patient.id }));
    setPatientSearchQuery(`${patient.firstName} ${patient.lastName}`);
    setShowPatientDropdown(false);

    if (errors.patientId) {
      setErrors((prev) => ({ ...prev, patientId: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

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
        patientId: formData.patientId,
        date: formData.date,
        amount: parseFloat(formData.amount),
        method: formData.method || undefined,
        notes: formData.notes.trim() || undefined,
      };

      if (payment) {
        await updatePayment(payment.id, paymentData as UpdatePaymentData);
      } else {
        await createPayment(paymentData as CreatePaymentData);
      }

      onSave();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save payment';
      setServerError(errorMessage);
      console.error('Error saving payment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full rounded-lg border border-surface-300 bg-white pl-10 pr-4 py-2.5 text-sm text-surface-800 transition focus:border-primary-500 focus:outline-none focus:shadow-focus disabled:cursor-not-allowed disabled:bg-surface-50';

  const parsedAmount = parseFloat(formData.amount);
  const formattedAmount = !isNaN(parsedAmount)
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parsedAmount)
    : '$0.00';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Live amount preview */}
      <div className="flex items-center gap-3 rounded-lg border border-success-100 bg-success-50 p-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-success-100 text-success-700">
          <Wallet className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-bold text-success-700">+{formattedAmount}</p>
          <p className="text-xs text-surface-500">{payment ? 'Editing payment record' : 'Recording a new payment'}</p>
        </div>
      </div>

      {serverError && (
        <div className="flex items-center gap-2 rounded-lg border border-danger-100 bg-danger-50 p-3 text-sm text-danger-700">
          <AlertCircle size={18} />
          {serverError}
        </div>
      )}

      <FormSection icon={CalendarClock} title="Patient & Date" tone="primary">
        <div className="relative">
          <label htmlFor="patient" className="mb-2 block text-sm font-medium text-surface-700">
            Patient <span className="text-danger-500">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-surface-400" />
            </div>
            <input
              type="text"
              id="patient"
              value={patientSearchQuery}
              onChange={handlePatientSearchChange}
              onFocus={() => setShowPatientDropdown(true)}
              className={`${inputClass} ${errors.patientId ? 'border-danger-500' : ''}`}
              placeholder="Search patient by name..."
              disabled={submitting}
              autoComplete="off"
            />
            {loadingPatients && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-surface-400" />
            )}
          </div>

          {showPatientDropdown && filteredPatients.length > 0 && (
            <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-surface-300 bg-white shadow-lg">
              {filteredPatients.map((patient) => (
                <button
                  key={patient.id}
                  type="button"
                  onClick={() => handlePatientSelect(patient)}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left transition-colors hover:bg-surface-50"
                >
                  <User className="h-3.5 w-3.5 shrink-0 text-surface-400" />
                  <div className="min-w-0">
                    <div className="truncate font-medium text-surface-900">
                      {patient.firstName} {patient.lastName}
                    </div>
                    {patient.email && <div className="truncate text-xs text-surface-500">{patient.email}</div>}
                  </div>
                </button>
              ))}
            </div>
          )}

          {errors.patientId && <p className="mt-1 text-sm text-danger-600">{errors.patientId}</p>}
        </div>

        <div>
          <label htmlFor="date" className="mb-2 block text-sm font-medium text-surface-700">
            Date <span className="text-danger-500">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <CalendarClock className="h-4 w-4 text-surface-400" />
            </div>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className={`${inputClass} ${errors.date ? 'border-danger-500' : ''}`}
              disabled={submitting}
            />
          </div>
          {errors.date && <p className="mt-1 text-sm text-danger-600">{errors.date}</p>}
        </div>
      </FormSection>

      <FormSection icon={Wallet} title="Amount & Method" tone="info">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="amount" className="mb-2 block text-sm font-medium text-surface-700">
              Amount <span className="text-danger-500">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-surface-400">$</div>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className={`${inputClass} ${errors.amount ? 'border-danger-500' : ''}`}
                placeholder="0.00"
                disabled={submitting}
              />
            </div>
            {errors.amount && <p className="mt-1 text-sm text-danger-600">{errors.amount}</p>}
          </div>

          <div>
            <label htmlFor="method" className="mb-2 block text-sm font-medium text-surface-700">
              Payment Method
            </label>
            <select
              id="method"
              name="method"
              value={formData.method}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-surface-300 bg-white px-3.5 py-2.5 text-sm text-surface-800 transition focus:border-primary-500 focus:outline-none focus:shadow-focus disabled:cursor-not-allowed disabled:bg-surface-50"
              disabled={submitting}
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </FormSection>

      <FormSection icon={FileText} title="Notes" tone="surface">
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          rows={3}
          className="w-full resize-none rounded-lg border border-surface-300 bg-white px-3.5 py-2.5 text-sm text-surface-800 transition focus:border-primary-500 focus:outline-none focus:shadow-focus disabled:cursor-not-allowed disabled:bg-surface-50"
          placeholder="Add any additional notes..."
          disabled={submitting}
        />
      </FormSection>

      <div className="flex gap-3 border-t border-surface-100 pt-4">
        <Button type="submit" disabled={submitting} isLoading={submitting} className="flex-1">
          {payment ? 'Update Payment' : 'Create Payment'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
}
