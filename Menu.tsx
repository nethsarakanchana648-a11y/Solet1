import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { logout } from '../firebase';
import { User, Settings, LogOut, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

const Menu = () => {
  const { userProfile, isAdmin } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <div className="space-y-6 pb-6">
      <h2 className="text-2xl font-bold text-gray-800">Menu</h2>

      {/* Profile Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
        <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center">
          <User size={32} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">{userProfile?.displayName || 'Member'}</h3>
          <p className="text-sm text-gray-500">{userProfile?.email}</p>
          <span className="inline-block mt-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-md uppercase tracking-wider">
            {userProfile?.role}
          </span>
        </div>
      </div>

      {/* Admin Link */}
      {isAdmin && (
        <Link to="/admin" className="bg-orange-50 p-4 rounded-xl shadow-sm border border-orange-100 flex items-center justify-between hover:bg-orange-100 transition-colors">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-200 text-orange-600 rounded-full flex items-center justify-center">
              <ShieldAlert size={20} />
            </div>
            <div>
              <p className="font-semibold text-orange-800">Admin Dashboard</p>
              <p className="text-xs text-orange-600">Manage society data</p>
            </div>
          </div>
        </Link>
      )}

      {/* Settings & Logout */}
      <div className="space-y-3">
        <button className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-50 text-gray-500 rounded-full flex items-center justify-center">
              <Settings size={20} />
            </div>
            <p className="font-semibold text-gray-800">Settings</p>
          </div>
        </button>

        <button 
          onClick={handleLogout}
          className="w-full bg-white p-4 rounded-xl shadow-sm border border-red-100 flex items-center justify-between hover:bg-red-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
              <LogOut size={20} />
            </div>
            <p className="font-semibold text-red-600">Logout</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Menu;
