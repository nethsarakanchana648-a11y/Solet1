import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc, addDoc, serverTimestamp, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Plus, Save } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Admin = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('deposit');
  
  // Form states
  const [selectedUser, setSelectedUser] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [interestRate, setInterestRate] = useState('5');
  const [notice, setNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }

    const fetchUsers = async () => {
      const q = query(collection(db, 'users'));
      const snapshot = await getDocs(q);
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
      
      const statsDoc = await getDoc(doc(db, 'society_stats', 'main'));
      if (statsDoc.exists()) {
        setNotice(statsDoc.data().notice || '');
      }
      
      setLoading(false);
    };

    fetchUsers();
  }, [isAdmin, navigate]);

  const handleAddDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !amount) return;
    setIsSubmitting(true);

    try {
      const numAmount = parseFloat(amount);
      const userRef = doc(db, 'users', selectedUser);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();

      // Create transaction
      await addDoc(collection(db, 'transactions'), {
        userId: selectedUser,
        amount: numAmount,
        type: 'deposit',
        date: serverTimestamp(),
        description: description || 'Monthly Deposit',
        createdAt: serverTimestamp()
      });

      // Update user savings
      await updateDoc(userRef, {
        totalSavings: (userData?.totalSavings || 0) + numAmount
      });

      // Update society total
      const statsRef = doc(db, 'society_stats', 'main');
      const statsDoc = await getDoc(statsRef);
      if (statsDoc.exists()) {
        await updateDoc(statsRef, {
          totalBalance: (statsDoc.data().totalBalance || 0) + numAmount,
          updatedAt: serverTimestamp()
        });
      } else {
        await setDoc(statsRef, {
          totalBalance: numAmount,
          notice: '',
          updatedAt: serverTimestamp()
        });
      }

      alert('Deposit added successfully!');
      setAmount('');
      setDescription('');
    } catch (error) {
      console.error("Error adding deposit:", error);
      alert('Failed to add deposit.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !amount) return;
    setIsSubmitting(true);

    try {
      const numAmount = parseFloat(amount);
      const numInterest = parseFloat(interestRate);
      const userRef = doc(db, 'users', selectedUser);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();

      // Create loan
      await addDoc(collection(db, 'loans'), {
        userId: selectedUser,
        principal: numAmount,
        interestRate: numInterest,
        remainingBalance: numAmount,
        status: 'active',
        createdAt: serverTimestamp()
      });

      // Create transaction
      await addDoc(collection(db, 'transactions'), {
        userId: selectedUser,
        amount: numAmount,
        type: 'loan_disbursement',
        date: serverTimestamp(),
        description: description || 'Loan Disbursement',
        createdAt: serverTimestamp()
      });

      // Update user outstanding loan
      await updateDoc(userRef, {
        outstandingLoan: (userData?.outstandingLoan || 0) + numAmount
      });

      // Update society total (decrease balance)
      const statsRef = doc(db, 'society_stats', 'main');
      const statsDoc = await getDoc(statsRef);
      if (statsDoc.exists()) {
        await updateDoc(statsRef, {
          totalBalance: (statsDoc.data().totalBalance || 0) - numAmount,
          updatedAt: serverTimestamp()
        });
      }

      alert('Loan added successfully!');
      setAmount('');
      setDescription('');
    } catch (error) {
      console.error("Error adding loan:", error);
      alert('Failed to add loan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const statsRef = doc(db, 'society_stats', 'main');
      const statsDoc = await getDoc(statsRef);
      if (statsDoc.exists()) {
        await updateDoc(statsRef, {
          notice,
          updatedAt: serverTimestamp()
        });
      } else {
        await setDoc(statsRef, {
          totalBalance: 0,
          notice,
          updatedAt: serverTimestamp()
        });
      }
      alert('Notice updated successfully!');
    } catch (error) {
      console.error("Error updating notice:", error);
      alert('Failed to update notice.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center space-x-3">
        <Link to="/menu" className="p-2 bg-white rounded-full shadow-sm">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
      </div>

      <div className="flex space-x-2 bg-white p-1 rounded-xl shadow-sm">
        <button 
          onClick={() => setActiveTab('deposit')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'deposit' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          Deposit
        </button>
        <button 
          onClick={() => setActiveTab('loan')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'loan' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          Loan
        </button>
        <button 
          onClick={() => setActiveTab('notice')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'notice' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          Notice
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          
          {activeTab === 'deposit' && (
            <form onSubmit={handleAddDeposit} className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><Plus size={20} className="mr-2 text-green-500"/> Add Deposit</h3>
              
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Select Member</label>
                <select 
                  required
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                >
                  <option value="">-- Select Member --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.displayName || u.email}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Amount (Rs.)</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Description (Optional)</label>
                <input 
                  type="text" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  placeholder="e.g. March Contribution"
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-70 mt-4"
              >
                {isSubmitting ? 'Processing...' : 'Add Deposit'}
              </button>
            </form>
          )}

          {activeTab === 'loan' && (
            <form onSubmit={handleAddLoan} className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><Plus size={20} className="mr-2 text-red-500"/> Issue Loan</h3>
              
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Select Member</label>
                <select 
                  required
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                >
                  <option value="">-- Select Member --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.displayName || u.email}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Principal (Rs.)</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="Amount"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Interest (%)</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Description (Optional)</label>
                <input 
                  type="text" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="e.g. Emergency Loan"
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-70 mt-4"
              >
                {isSubmitting ? 'Processing...' : 'Issue Loan'}
              </button>
            </form>
          )}

          {activeTab === 'notice' && (
            <form onSubmit={handleUpdateNotice} className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center"><Save size={20} className="mr-2 text-blue-500"/> Update Notice</h3>
              
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Society Notice</label>
                <textarea 
                  rows={4}
                  value={notice}
                  onChange={(e) => setNotice(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                  placeholder="Enter notice to display to all members..."
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-70 mt-4"
              >
                {isSubmitting ? 'Saving...' : 'Save Notice'}
              </button>
            </form>
          )}

        </div>
      )}
    </div>
  );
};

export default Admin;
