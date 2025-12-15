import { useState } from 'react';
import { ExpenseTable } from '../components/finances/ExpenseTable';
import { DollarSign, Receipt, TrendingDown } from 'lucide-react';

// TODO: Import PaymentTable when implemented
// import { PaymentTable } from '../components/finances/PaymentTable';

interface FinancesPageProps {
  token: string;
}

export function FinancesPage({ token }: FinancesPageProps) {
  // Tab state: 'payments' or 'expenses'
  // TODO: Change default to 'payments' when PaymentTable is implemented
  const [activeTab, setActiveTab] = useState<'payments' | 'expenses'>('expenses');

  return (
    <div className="bg-gray-50 min-h-full p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finances</h1>
          <p className="text-gray-500 mt-1">Manage payments and expenses</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex border-b border-gray-200">
          {/* Payments Tab */}
          <button
            onClick={() => setActiveTab('payments')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'payments'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <DollarSign size={18} />
            Payments
          </button>

          {/* Expenses Tab */}
          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'expenses'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Receipt size={18} />
            Expenses
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-0">
          {/* 
            TODO: PAYMENT TABLE IMPLEMENTATION NEEDED
            ==========================================
            When PaymentTable is ready, replace the placeholder below with:
            
            {activeTab === 'payments' && (
              <PaymentTable token={token} />
            )}
            
            PaymentTable should include:
            - Display payments in a table with columns: Name, Patient Name, Date, Amount, Method, Actions
            - Search functionality
            - Create, Edit, Delete buttons
            - Pagination
            - Patient dropdown for selecting which patient made the payment
            
            See documentation: FEATURE_GUIDE_FINANCES.md - Step 3.3 and Step 3.4
          */}
          {activeTab === 'payments' && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <TrendingDown size={48} className="mb-4 text-gray-300" />
              <p className="text-lg font-medium">Payments Coming Soon</p>
              <p className="text-sm mt-1">This feature is under development.</p>
            </div>
          )}

          {activeTab === 'expenses' && (
            <ExpenseTable token={token} />
          )}
        </div>
      </div>
    </div>
  );
}