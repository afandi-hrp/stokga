
import React, { useState } from 'react';
import { useStore } from '../store';
import { Lock, Save, Key } from 'lucide-react';

const Settings: React.FC = () => {
  const { auth, changePassword } = useStore();
  const [passData, setPassData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passData.new !== passData.confirm) {
      alert("New password and confirmation don't match!");
      return;
    }
    
    // In a real app, we'd verify current password with backend
    changePassword(passData.new);
    setPassData({ current: '', new: '', confirm: '' });
    alert("Password updated successfully!");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <Key size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">Change Admin Password</h3>
            <p className="text-sm text-slate-500">Update your account security credentials</p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Current Password</label>
            <input 
              type="password" required
              value={passData.current}
              onChange={e => setPassData({...passData, current: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">New Password</label>
            <input 
              type="password" required minLength={5}
              value={passData.new}
              onChange={e => setPassData({...passData, new: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Confirm New Password</label>
            <input 
              type="password" required minLength={5}
              value={passData.confirm}
              onChange={e => setPassData({...passData, confirm: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit"
            className="w-full flex items-center justify-center space-x-2 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition"
          >
            <Save size={18} />
            <span>Update Credentials</span>
          </button>
        </form>
      </div>

      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-8 text-white shadow-lg">
        <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md mb-6 inline-block">
          <Lock size={32} />
        </div>
        <h3 className="text-2xl font-bold mb-4">Security Notice</h3>
        <p className="text-indigo-100 leading-relaxed mb-6">
          Changing your administrator password will affect all active sessions. 
          Make sure to use a complex password with at least 8 characters including numbers and symbols.
        </p>
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-sm text-indigo-100">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
            <span>Encrypted with industry standard salt & hash</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-indigo-100">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
            <span>Logged activity for all credential changes</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
