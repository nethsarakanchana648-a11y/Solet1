import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Wallet, CreditCard, ArrowRight, Activity, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const { userProfile } = useAuth();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Overview</h2>

      <div className="grid grid-cols-2 gap-4">
        {/* Savings Card */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-3">
            <Wallet size={24} />
          </div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Savings</p>
          <p className="text-xl font-bold text-gray-800">
            Rs. {userProfile?.totalSavings?.toLocaleString() || '0'}
          </p>
        </div>

        {/* Loan Card */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-3">
            <CreditCard size={24} />
          </div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Outstanding Loan</p>
          <p className="text-xl font-bold text-gray-800">
            Rs. {userProfile?.outstandingLoan?.toLocaleString() || '0'}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Quick Links</h3>
        <div className="space-y-3">
          <Link to="/transactions" className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
                <Activity size={20} />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Recent Transactions</p>
                <p className="text-xs text-gray-500">View your passbook history</p>
              </div>
            </div>
            <ArrowRight size={20} className="text-gray-400" />
          </Link>

          <Link to="/requests" className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center">
                <FileText size={20} />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Loan Details</p>
                <p className="text-xs text-gray-500">Manage your active loans</p>
              </div>
            </div>
            <ArrowRight size={20} className="text-gray-400" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
