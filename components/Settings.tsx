
import React, { useState } from 'react';
import { useStore } from '../store';
// Add Package to the imports from lucide-react
import { Lock, Save, Key, AlertCircle, CheckCircle2, Palette, Type, Package, Image as ImageIcon } from 'lucide-react';

const Settings: React.FC = () => {
  const { auth, users, changePassword, branding, updateBranding } = useStore();
  const [passData, setPassData] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  
  const [brandingForm, setBrandingForm] = useState({
    title: branding.title,
    primaryColor: branding.primaryColor,
    logo: branding.logo || ''
  });

  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
  const [brandMessage, setBrandMessage] = useState<string | null>(null);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!auth.user) return;

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
    
    changePassword(auth.user.username, passData.new);
    
    setPassData({ current: '', new: '', confirm: '' });
    setMessage({ type: 'success', text: 'Password berhasil diperbarui!' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleBrandingUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateBranding(brandingForm);
    setBrandMessage('Tampilan aplikasi berhasil diperbarui!');
    setTimeout(() => setBrandMessage(null), 3000);
  };

  const colorPresets = [
    '#4f46e5', // Indigo
    '#0ea5e9', // Sky
    '#10b981', // Emerald
    '#f43f5e', // Rose
    '#f59e0b', // Amber
    '#8b5cf6', // Violet
    '#22c55e', // Green
    '#334155'  // Slate
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Branding Customization */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
              <Palette size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Custom Tampilan</h3>
              <p className="text-sm text-slate-500">Ubah identitas, logo, dan tema warna aplikasi</p>
            </div>
          </div>

          {brandMessage && (
            <div className="mb-6 p-4 bg-green-50 text-green-600 border border-green-100 rounded-xl flex items-center text-sm font-medium">
              <CheckCircle2 size={18} className="mr-2" />
              {brandMessage}
            </div>
          )}

          <form onSubmit={handleBrandingUpdate} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center">
                <Type size={14} className="mr-1.5" /> Judul Aplikasi
              </label>
              <input 
                type="text" required
                value={brandingForm.title}
                onChange={e => setBrandingForm({...brandingForm, title: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="SmartWarehouse Pro"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center">
                <ImageIcon size={14} className="mr-1.5" /> URL Logo Aplikasi
              </label>
              <div className="flex space-x-3">
                <input 
                  type="url"
                  value={brandingForm.logo}
                  onChange={e => setBrandingForm({...brandingForm, logo: e.target.value})}
                  className="flex-grow px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                  placeholder="https://example.com/logo.png"
                />
                {brandingForm.logo && (
                  <div className="w-12 h-10 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 p-1 flex items-center justify-center">
                    <img src={brandingForm.logo} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                  </div>
                )}
              </div>
              <p className="text-[10px] text-slate-400 mt-1 italic">Kosongkan jika ingin menggunakan ikon default.</p>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center">
                <Palette size={14} className="mr-1.5" /> Warna Tema Utama
              </label>
              <div className="flex flex-wrap gap-3 mb-4">
                {colorPresets.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setBrandingForm({...brandingForm, primaryColor: color})}
                    className={`w-10 h-10 rounded-full border-4 transition-all scale-100 active:scale-90 ${brandingForm.primaryColor === color ? 'border-slate-300 scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex items-center space-x-3">
                <input 
                  type="color" 
                  value={brandingForm.primaryColor}
                  onChange={e => setBrandingForm({...brandingForm, primaryColor: e.target.value})}
                  className="w-12 h-10 p-0 border-none bg-transparent cursor-pointer"
                />
                <span className="text-xs font-mono font-bold text-slate-400">{brandingForm.primaryColor.toUpperCase()}</span>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full flex items-center justify-center space-x-2 bg-slate-800 text-white py-3.5 rounded-xl font-bold hover:bg-slate-900 transition shadow-lg mt-4"
            >
              <Save size={18} />
              <span>Update Branding</span>
            </button>
          </form>
        </div>

        {/* Password Change */}
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
              style={{ backgroundColor: branding.primaryColor }}
            >
              <Save size={18} />
              <span>Simpan Perubahan</span>
            </button>
          </form>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-3xl p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
             <h3 className="text-2xl font-bold mb-4">Preview Login Screen</h3>
             <p className="text-slate-300 text-sm mb-6">Berikut adalah tampilan sidebar pada menu login dengan konfigurasi saat ini:</p>
             <div className="bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                <div 
                  className="w-full aspect-video rounded-xl flex flex-col items-center justify-center p-6 text-center transition-all duration-500"
                  style={{ backgroundColor: brandingForm.primaryColor }}
                >
                  {brandingForm.logo ? (
                    <img src={brandingForm.logo} alt="Logo" className="max-w-[40px] max-h-[40px] mb-2 object-contain" />
                  ) : (
                    <Package size={32} className="mb-2" />
                  )}
                  <h4 className="font-bold text-lg">{brandingForm.title}</h4>
                  <p className="text-[10px] opacity-70">Sistem Manajemen Gudang Profesional</p>
                </div>
             </div>
          </div>
          <div className="flex-1 space-y-4">
            <h4 className="font-bold text-lg">Keamanan & Branding</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Semua perubahan branding akan langsung diterapkan ke seluruh halaman aplikasi, termasuk halaman Login Staff dan Admin Dashboard. Warna tema yang Anda pilih akan digunakan sebagai elemen warna primer aplikasi.
            </p>
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white/10 p-3 rounded-xl border border-white/5">
                  <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Status UI</p>
                  <p className="text-xs font-bold text-green-400">Teroptimasi</p>
               </div>
               <div className="bg-white/10 p-3 rounded-xl border border-white/5">
                  <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Color Mode</p>
                  <p className="text-xs font-bold">RGB / HEX</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
