import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { ArrowDownLeft, ArrowUpRight, RefreshCw } from 'lucide-react';

const Transactions = () => {
  const { userProfile } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile?.uid) return;

    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', userProfile.uid),
      orderBy('date', 'desc')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(txs);
      setLoading(false);
    });

    return () => unsub();
  }, [userProfile?.uid]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft size={20} className="text-green-500" />;
      case 'loan_repayment':
        return <RefreshCw size={20} className="text-blue-500" />;
      case 'loan_disbursement':
        return <ArrowUpRight size={20} className="text-red-500" />;
      default:
        return <ArrowDownLeft size={20} className="text-gray-500" />;
    }
  };

  const getLabel = (type: string) => {
    switch (type) {
      case 'deposit': return 'Deposit (තැන්පතුව)';
      case 'loan_repayment': return 'Loan Repayment (ණය ගෙවීම)';
      case 'loan_disbursement': return 'Loan Given (ණය ලබාදීම)';
      default: return 'Other (වෙනත්)';
    }
  };

  return (
    <div className="space-y-4 pb-6">
      <h2 className="text-2xl font-bold text-gray-800">Passbook</h2>
      <p className="text-sm text-gray-500">Your recent transaction history</p>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      ) : transactions.length === 0 ? (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
          <p className="text-gray-500">No transactions found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div key={tx.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  tx.type === 'deposit' ? 'bg-green-50' : 
                  tx.type === 'loan_disbursement' ? 'bg-red-50' : 'bg-blue-50'
                }`}>
                  {getIcon(tx.type)}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{getLabel(tx.type)}</p>
                  <p className="text-xs text-gray-500">
                    {tx.date?.toDate ? format(tx.date.toDate(), 'MMM dd, yyyy') : 'Unknown date'}
                  </p>
                  {tx.description && (
                    <p className="text-xs text-gray-400 mt-0.5">{tx.description}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold ${
                  tx.type === 'deposit' || tx.type === 'loan_repayment' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {tx.type === 'deposit' || tx.type === 'loan_repayment' ? '+' : '-'} Rs. {tx.amount?.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Transactions;
