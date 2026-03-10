import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { FileText, AlertCircle, CheckCircle2 } from 'lucide-react';

const Requests = () => {
  const { userProfile } = useAuth();
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile?.uid) return;

    const q = query(
      collection(db, 'loans'),
      where('userId', '==', userProfile.uid),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const loanData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLoans(loanData);
      setLoading(false);
    });

    return () => unsub();
  }, [userProfile?.uid]);

  return (
    <div className="space-y-4 pb-6">
      <h2 className="text-2xl font-bold text-gray-800">Loan Details</h2>
      <p className="text-sm text-gray-500">Your loan history and current status</p>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      ) : loans.length === 0 ? (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
            <FileText size={24} />
          </div>
          <p className="text-gray-500 font-medium">No active or past loans.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {loans.map((loan) => (
            <div key={loan.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
                  {loan.status === 'active' ? (
                    <AlertCircle size={20} className="text-orange-500" />
                  ) : (
                    <CheckCircle2 size={20} className="text-green-500" />
                  )}
                  <span className={`text-sm font-semibold uppercase tracking-wider ${
                    loan.status === 'active' ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {loan.status === 'active' ? 'Active Loan' : 'Paid Off'}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {loan.createdAt?.toDate ? format(loan.createdAt.toDate(), 'MMM dd, yyyy') : ''}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Principal</p>
                  <p className="font-bold text-gray-800">Rs. {loan.principal?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Interest Rate</p>
                  <p className="font-bold text-gray-800">{loan.interestRate}%</p>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center">
                <span className="text-sm text-gray-600 font-medium">Remaining Balance</span>
                <span className={`font-bold text-lg ${loan.remainingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  Rs. {loan.remainingBalance?.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Requests;
