import React, { useState } from 'react';
import PaymentTable from '../components/finances/PaymentTable';
import { ExpenseTable } from '../components/finances/ExpenseTable';

const FinancesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'payments' | 'expenses'>('payments');

  // Get token from localStorage for ExpenseTable
  const token = localStorage.getItem('token') || '';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="px-4 md:px-6 lg:px-8 pt-6 pb-4">
          <h1 className="text-3xl font-bold text-gray-900">Finances</h1>
          <p className="text-gray-600 mt-2">Manage payments and expenses</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <nav className="flex -mb-px" aria-label="Tabs">
              {/* Payments Tab */}
              <button
                onClick={() => setActiveTab('payments')}
                className={`
                  flex-1 py-4 px-6 text-center font-medium text-sm md:text-base
                  border-b-2 transition-colors duration-200
                  ${
                    activeTab === 'payments'
                      ? 'border-[#3DBEA3] text-[#3DBEA3]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
                aria-current={activeTab === 'payments' ? 'page' : undefined}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Payments
                </span>
              </button>

              {/* Expenses Tab */}
              <button
                onClick={() => setActiveTab('expenses')}
                className={`
                  flex-1 py-4 px-6 text-center font-medium text-sm md:text-base
                  border-b-2 transition-colors duration-200
                  ${
                    activeTab === 'expenses'
                      ? 'border-[#3DBEA3] text-[#3DBEA3]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
                aria-current={activeTab === 'expenses' ? 'page' : undefined}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  Expenses
                </span>
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content with Animation */}
        <div className="relative overflow-hidden">
          {/* Animated Background Gradient */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" style={{ backgroundColor: '#D5EDE8' }}></div>
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" style={{ backgroundColor: '#E8F5F0' }}></div>
            <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>
          </div>

          {/* Content with Slide Animation */}
          <div className="relative z-10">
            {activeTab === 'payments' && (
              <div className="animate-slideInRight">
                <PaymentTable />
              </div>
            )}

            {activeTab === 'expenses' && (
              <div className="animate-slideInLeft">
                <ExpenseTable token={token} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancesPage;