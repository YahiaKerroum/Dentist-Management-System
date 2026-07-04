import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Wallet, Receipt } from 'lucide-react';
import PaymentTable from '../components/finances/PaymentTable';
import { ExpenseTable } from '../components/finances/ExpenseTable';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { useAuth } from '../contexts/AuthContext';

const FinancesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'payments' | 'expenses'>('payments');
  const { token } = useAuth();

  return (
    <div className="min-h-full bg-surface-50 p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">Finances</h1>
        <p className="mt-1 text-surface-500">Track payments received and expenses paid out</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'payments' | 'expenses')}>
        <TabsList className="mb-6">
          <TabsTrigger
            value="payments"
            className="flex items-center gap-2 data-[state=active]:text-success-700"
          >
            <Wallet size={15} /> Payments
          </TabsTrigger>
          <TabsTrigger
            value="expenses"
            className="flex items-center gap-2 data-[state=active]:text-danger-700"
          >
            <Receipt size={15} /> Expenses
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === 'payments' ? <PaymentTable token={token ?? ''} /> : <ExpenseTable token={token ?? ''} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default FinancesPage;
