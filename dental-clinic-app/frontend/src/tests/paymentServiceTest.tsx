import React, { useState } from 'react';
import {
  getAllPayments,
  getPaymentById,
  getPaymentsByPatient,
  createPayment,
  updatePayment,
  deletePayment,
  searchPayments
} from '../services/payment.service';

const PaymentServiceTest: React.FC = () => {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Test input states
  const [paymentId, setPaymentId] = useState('');
  const [patientId, setPatientId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [newPayment, setNewPayment] = useState({
    name: 'Test Payment',
    patientId: '',
    date: new Date().toISOString(),
    amount: 100,
    method: 'cash',
    notes: 'Test notes'
  });

  const handleTest = async (testFn: () => Promise<any>, testName: string) => {
    setLoading(true);
    setError('');
    setResult(null);
    
    try {
      const data = await testFn();
      setResult(data);
      console.log(`✅ ${testName} SUCCESS:`, data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      console.error(`❌ ${testName} FAILED:`, errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Payment Service Tester</h1>
      
      {loading && <div style={{ color: 'blue' }}>⏳ Loading...</div>}
      {error && <div style={{ color: 'red', padding: '10px', background: '#fee' }}>❌ Error: {error}</div>}
      
      {/* Test getAllPayments */}
      <div style={{ marginBottom: '20px', border: '1px solid #ddd', padding: '15px' }}>
        <h3>1. Get All Payments</h3>
        <button onClick={() => handleTest(getAllPayments, 'getAllPayments')}>
          Test Get All Payments
        </button>
      </div>

      {/* Test getPaymentById */}
      <div style={{ marginBottom: '20px', border: '1px solid #ddd', padding: '15px' }}>
        <h3>2. Get Payment By ID</h3>
        <input
          type="text"
          placeholder="Enter Payment ID"
          value={paymentId}
          onChange={(e) => setPaymentId(e.target.value)}
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <button 
          onClick={() => handleTest(() => getPaymentById(paymentId), 'getPaymentById')}
          disabled={!paymentId}
        >
          Test Get Payment By ID
        </button>
      </div>

      {/* Test getPaymentsByPatient */}
      <div style={{ marginBottom: '20px', border: '1px solid #ddd', padding: '15px' }}>
        <h3>3. Get Payments By Patient</h3>
        <input
          type="text"
          placeholder="Enter Patient ID"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <button 
          onClick={() => handleTest(() => getPaymentsByPatient(patientId), 'getPaymentsByPatient')}
          disabled={!patientId}
        >
          Test Get Payments By Patient
        </button>
      </div>

      {/* Test createPayment */}
      <div style={{ marginBottom: '20px', border: '1px solid #ddd', padding: '15px' }}>
        <h3>4. Create Payment</h3>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Name"
            value={newPayment.name}
            onChange={(e) => setNewPayment({...newPayment, name: e.target.value})}
            style={{ marginRight: '10px', padding: '5px' }}
          />
          <input
            type="text"
            placeholder="Patient ID"
            value={newPayment.patientId}
            onChange={(e) => setNewPayment({...newPayment, patientId: e.target.value})}
            style={{ marginRight: '10px', padding: '5px' }}
          />
          <input
            type="number"
            placeholder="Amount"
            value={newPayment.amount}
            onChange={(e) => setNewPayment({...newPayment, amount: Number(e.target.value)})}
            style={{ marginRight: '10px', padding: '5px' }}
          />
        </div>
        <button 
          onClick={() => handleTest(() => createPayment(newPayment), 'createPayment')}
          disabled={!newPayment.name || !newPayment.patientId}
        >
          Test Create Payment
        </button>
      </div>

      {/* Test updatePayment */}
      <div style={{ marginBottom: '20px', border: '1px solid #ddd', padding: '15px' }}>
        <h3>5. Update Payment</h3>
        <input
          type="text"
          placeholder="Payment ID to update"
          value={paymentId}
          onChange={(e) => setPaymentId(e.target.value)}
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <button 
          onClick={() => handleTest(
            () => updatePayment(paymentId, { amount: 200, notes: 'Updated notes' }), 
            'updatePayment'
          )}
          disabled={!paymentId}
        >
          Test Update Payment (Amount: 200)
        </button>
      </div>

      {/* Test deletePayment */}
      <div style={{ marginBottom: '20px', border: '1px solid #ddd', padding: '15px' }}>
        <h3>6. Delete Payment</h3>
        <input
          type="text"
          placeholder="Payment ID to delete"
          value={paymentId}
          onChange={(e) => setPaymentId(e.target.value)}
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <button 
          onClick={() => handleTest(() => deletePayment(paymentId), 'deletePayment')}
          disabled={!paymentId}
          style={{ background: '#f44336', color: 'white' }}
        >
          Test Delete Payment
        </button>
      </div>

      {/* Test searchPayments */}
      <div style={{ marginBottom: '20px', border: '1px solid #ddd', padding: '15px' }}>
        <h3>7. Search Payments</h3>
        <input
          type="text"
          placeholder="Search query"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <button 
          onClick={() => handleTest(() => searchPayments(searchQuery), 'searchPayments')}
        >
          Test Search Payments
        </button>
      </div>

      {/* Results Display */}
      {result && (
        <div style={{ marginTop: '20px', border: '2px solid green', padding: '15px', background: '#f0fff0' }}>
          <h3>✅ Result:</h3>
          <pre style={{ background: '#fff', padding: '10px', overflow: 'auto' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default PaymentServiceTest;