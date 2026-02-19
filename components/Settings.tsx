
import React, { useState, useRef } from 'react';
import { useStore } from '../store';
import { 
  Lock, Save, Key, AlertCircle, CheckCircle2, 
  Palette, Type, Package, Image as ImageIcon, 
  Download, Upload, Database, AlertTriangle, Cloud, AlignLeft, Layout
} from 'lucide-react';

const Settings: React.FC = () => {
  const { auth, users, changePassword, branding, updateBranding, items, locations } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [passData, setPassData] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  
  const [brandingForm, setBrandingForm] = useState({
    title: branding.title,
    primaryColor: branding.primaryColor,
    logo: branding.logo || '',
    description: branding.description || '',
    footerText: branding.footerText || ''
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

  const handleExportData = () => {
    const backupData = {
      items,
      locations,
      branding,
      exportDate: new Date().toISOString(),
      version: "1.1-cloud"
    };
    
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_cloud_wms_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const colorPresets = [
    '#4f46e5', '#0ea5e9', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#22c55e', '#334155'
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex items-start space-x-3 shadow-sm">
        <Cloud className="text-indigo-600 flex-shrink-0 mt-0.5" size={20} />
        <div>
          <p className="text-sm font-bold text-indigo-800">Penyimpanan Cloud Aktif</p>
          <p className="text-xs text-indigo-700 leading-relaxed">
            Data Anda disinkronkan secara aman dengan <b>Supabase PostgreSQL</b>. Perubahan di satu perangkat akan langsung terlihat di perangkat lain.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Branding Customization */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
              <Palette size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Custom Tampilan</h3>
              <p className="text-sm text-slate-500">Ubah identitas, teks, dan tema warna</p>
            </div>
          </div>

          <form onSubmit={handleBrandingUpdate} className="space-y-6">
            {brandMessage && (
              <div className="p-3 bg-green-50 text-green-700 rounded-lg text-xs font-bold border border-green-100 animate-in fade-in">
                {brandMessage}
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center">
                  <Type size={14} className="mr-1.5" /> Judul Aplikasi
                </label>
                <input 
                  type="text" required
                  value={brandingForm.title}
                  onChange={e => setBrandingForm({...brandingForm, title: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center">
                  <ImageIcon size={14} className="mr-1.5" /> URL Logo
                </label>
                <input 
                  type="url"
                  value={brandingForm.logo}
                  onChange={e => setBrandingForm({...brandingForm, logo: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center">
                <AlignLeft size={14} className="mr-1.5" /> Deskripsi Login (Hero Text)
              </label>
              <textarea 
                rows={3}
                value={brandingForm.description}
                onChange={e => setBrandingForm({...brandingForm, description: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none"
                placeholder="Teks yang muncul di halaman login sebelah kiri..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center">
                <Layout size={14} className="mr-1.5" /> Teks Footer
              </label>
              <input 
                type="text"
                value={brandingForm.footerText}
                onChange={e => setBrandingForm({...brandingForm, footerText: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                placeholder="e.g. Cloud Warehouse v1.1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center">
                <Palette size={14} className="mr-1.5" /> Warna Tema Utama
              </label>
              <div className="flex flex-wrap gap-2 mb-4">
                {colorPresets.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setBrandingForm({...brandingForm, primaryColor: color})}
                    className={`w-9 h-9 rounded-full border-2 transition-all hover:scale-110 ${brandingForm.primaryColor === color ? 'border-slate-800 shadow-lg scale-110' : 'border-transparent opacity-60'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <button type="submit" className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold hover:bg-slate-900 transition shadow-lg active:scale-95">
              Simpan Perubahan Tampilan
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
              <h3 className="text-xl font-bold text-slate-800">Keamanan Akun</h3>
              <p className="text-sm text-slate-500">Ganti password admin saat ini</p>
            </div>
          </div>
          
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {message && (
              <div className={`p-3 rounded-lg text-xs font-bold border animate-in slide-in-from-top-1 ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                {message.text}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Password Sekarang</label>
                <input 
                  type="password" required
                  value={passData.current}
                  onChange={e => setPassData({...passData, current: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Password Baru</label>
                <input 
                  type="password" required
                  value={passData.new}
                  onChange={e => setPassData({...passData, new: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Konfirmasi Password Baru</label>
                <input 
                  type="password" required
                  value={passData.confirm}
                  onChange={e => setPassData({...passData, confirm: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg mt-4 active:scale-95">
              Update Password
            </button>
          </form>
        </div>
      </div>

      {/* Export Utility */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3 text-center sm:text-left">
            <div className="p-3 bg-slate-100 rounded-xl text-slate-600">
              <Download size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Backup Data Utama</h3>
              <p className="text-sm text-slate-500">Unduh snapshot data barang & lokasi untuk arsip offline</p>
            </div>
          </div>
          <button 
            onClick={handleExportData}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-slate-800 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-900 transition shadow-lg active:scale-95"
          >
            <Download size={18} />
            <span>Export Snapshot .JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
