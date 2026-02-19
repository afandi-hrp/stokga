
import React, { useState } from 'react';
import { useStore } from '../store';
import { Lock, Save, Key, AlertCircle, CheckCircle2 } from 'lucide-react';

const Settings: React.FC = () => {
  const { auth, users, changePassword } = useStore();
  const [passData, setPassData] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!auth.user) return;

    // Find current user in the store to verify password
    const currentUser = users.find(u => u.username === auth.user?.username);

    if (!currentUser || currentUser.password !== passData.current) {
      setMessage({ type: 'error', text: 'Password saat ini tidak benar!' });
      return;
    }

    if (passData.new.length < 5) {
      setMessage({ type: 'error', text: 'Password baru minimal 5 karakter!' });
      return;
    }

    if (passData.new !== passData.confirm) {
      setMessage({ type: 'error', text: 'Konfirmasi password tidak cocok!' });
      return;
    }
    
    // Update the password in the store
    changePassword(auth.user.username, passData.new);
    
    setPassData({ current: '', new: '', confirm: '' });
    setMessage({ type: 'success', text: 'Password berhasil diperbarui!' });
    
    // Clear success message after 3 seconds
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <Key size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">Ganti Password Admin</h3>
            <p className="text-sm text-slate-500">Perbarui kredensial keamanan akun Anda</p>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl flex items-center text-sm font-medium border animate-in fade-in zoom-in-95 ${
            message.type === 'error' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-green-50 text-green-600 border-green-100'
          }`}>
            {message.type === 'error' ? <AlertCircle size={18} className="mr-2" /> : <CheckCircle2 size={18} className="mr-2" />}
            {message.text}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Password Saat Ini</label>
            <input 
              type="password" required
              value={passData.current}
              onChange={e => setPassData({...passData, current: e.target.value})}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          <div className="pt-2 border-t border-slate-100 mt-2">
            <label className="block text-sm font-bold text-slate-700 mb-1">Password Baru</label>
            <input 
              type="password" required minLength={5}
              value={passData.new}
              onChange={e => setPassData({...passData, new: e.target.value})}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Konfirmasi Password Baru</label>
            <input 
              type="password" required minLength={5}
              value={passData.confirm}
              onChange={e => setPassData({...passData, confirm: e.target.value})}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit"
            className="w-full flex items-center justify-center space-x-2 bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 mt-4"
          >
            <Save size={18} />
            <span>Simpan Perubahan</span>
          </button>
        </form>
      </div>

      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-8 text-white shadow-xl flex flex-col justify-center">
        <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md mb-6 w-fit">
          <Lock size={32} />
        </div>
        <h3 className="text-2xl font-bold mb-4">Informasi Keamanan</h3>
        <p className="text-indigo-100 leading-relaxed mb-6">
          Mengubah password admin akan berlaku segera. Setelah diubah, pastikan Anda mencatat password baru Anda. 
          Sistem menggunakan enkripsi lokal untuk menyimpan data kredensial Anda dengan aman di browser ini.
        </p>
        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-sm text-indigo-50">
            <div className="w-2 h-2 bg-green-400 rounded-full shadow-sm shadow-green-400"></div>
            <span>Minimal 5 karakter untuk keamanan standar</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-indigo-50">
            <div className="w-2 h-2 bg-green-400 rounded-full shadow-sm shadow-green-400"></div>
            <span>Password saat ini wajib diverifikasi</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-indigo-50">
            <div className="w-2 h-2 bg-green-400 rounded-full shadow-sm shadow-green-400"></div>
            <span>Persistensi data otomatis tersimpan</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
