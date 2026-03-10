import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, ListOrdered, FileText, Menu as MenuIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const Layout = () => {
  const location = useLocation();
  const { userProfile } = useAuth();
  const [societyStats, setSocietyStats] = useState<{ totalBalance: number; notice?: string } | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'society_stats', 'main'), (doc) => {
      if (doc.exists()) {
        setSocietyStats(doc.data() as any);
      }
    });
    return () => unsub();
  }, []);

  const navItems = [
    { path: '/', label: 'මුල් පිටුව', icon: Home },
    { path: '/transactions', label: 'ගනුදෙනු', icon: ListOrdered },
    { path: '/requests', label: 'ඉල්ලීම්', icon: FileText },
    { path: '/menu', label: 'මෙනුව', icon: MenuIcon },
  ];

  return (
    <div className="flex justify-center min-h-screen bg-gray-100 font-sans">
      <div className="w-full max-w-md bg-white shadow-xl min-h-screen flex flex-col relative pb-16">
        
        {/* Top Banner */}
        <div className="bg-orange-500 text-white p-4 rounded-b-3xl shadow-md z-10">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h1 className="text-xl font-bold">සමිතිය Passbook</h1>
              <p className="text-sm opacity-90">Hello, {userProfile?.displayName || 'Member'}</p>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-80 uppercase tracking-wider">Total Society Balance</p>
              <p className="text-lg font-bold">Rs. {societyStats?.totalBalance?.toLocaleString() || '0'}</p>
            </div>
          </div>
          {societyStats?.notice && (
            <div className="bg-white/20 rounded-lg p-2 mt-2 text-sm">
              <p className="font-medium">📢 නිවේදනය (Notice):</p>
              <p>{societyStats.notice}</p>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <Outlet />
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-200 flex justify-around items-center h-16 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                  isActive ? 'text-orange-500' : 'text-gray-500 hover:text-orange-400'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Layout;
