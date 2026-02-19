
import React, { useState, useRef } from 'react';
import { useStore } from '../store';
import { 
  Lock, Save, Key, AlertCircle, CheckCircle2, 
  Palette, Type, Package, Image as ImageIcon, 
  Download, Upload, Database, AlertTriangle 
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

  // --- DATA MANAGEMENT (BACKUP / RESTORE) ---
  const handleExportData = () => {
    const backupData = {
      items,
      locations,
      users,
      branding,
      exportDate: new Date().toISOString(),
      version: "1.0"
    };
    
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_wms_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const content = evt.target?.result as string;
        const data = JSON.parse(content);
        
        if (!data.items || !data.locations) {
          throw new Error("Format file tidak valid");
        }

        if (confirm("⚠️ PERINGATAN: Mengimpor data akan menggantikan data yang ada saat ini. Lanjutkan?")) {
          // Update store directly (this works because of zustand persist)
          useStore.setState({
            items: data.items,
            locations: data.locations,
            users: data.users || users,
            branding: data.branding || branding
          });
          alert("Data berhasil dipulihkan! Halaman akan dimuat ulang.");
          window.location.reload();
        }
      } catch (err) {
        alert("Gagal mengimpor data: " + (err as Error).message);
      }
    };
    reader.readAsText(file);
  };

  const colorPresets = [
    '#4f46e5', '#0ea5e9', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#22c55e', '#334155'
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Alert Warning for LocalStorage */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start space-x-3">
        <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
        <div>
          <p className="text-sm font-bold text-amber-800">Informasi Penyimpanan</p>
          <p className="text-xs text-amber-700 leading-relaxed">
            Data Anda saat ini tersimpan di <b>LocalStorage Browser</b>. Jika Anda mengakses aplikasi dari URL Vercel yang berbeda (Preview URL), data mungkin tampak kosong. Gunakan fitur <b>Export Data</b> di bawah untuk memindahkan data antar browser atau URL.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Branding Customization */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
              <Palette size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Custom Tampilan</h3>
              <p className="text-sm text-slate-500">Ubah identitas, logo, dan tema warna</p>
            </div>
          </div>

          <form onSubmit={handleBrandingUpdate} className="space-y-6">
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
                <ImageIcon size={14} className="mr-1.5" /> URL Logo Aplikasi
              </label>
              <div className="flex space-x-3">
                <input 
                  type="url"
                  value={brandingForm.logo}
                  onChange={e => setBrandingForm({...brandingForm, logo: e.target.value})}
                  className="flex-grow px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  placeholder="https://..."
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center">
                <Palette size={14} className="mr-1.5" /> Warna Tema
              </label>
              <div className="flex flex-wrap gap-2 mb-4">
                {colorPresets.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setBrandingForm({...brandingForm, primaryColor: color})}
                    className={`w-8 h-8 rounded-full border-2 ${brandingForm.primaryColor === color ? 'border-slate-800' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <button type="submit" className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-900 transition">
              Update Tampilan
            </button>
          </form>
        </div>

        {/* Data Management Section */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <Database size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Manajemen Data</h3>
              <p className="text-sm text-slate-500">Backup atau pulihkan database lokal Anda</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <h4 className="text-sm font-bold text-slate-700 mb-2">Export Seluruh Data</h4>
              <p className="text-xs text-slate-500 mb-4">Simpan semua barang, lokasi, dan pengaturan ke file JSON.</p>
              <button 
                onClick={handleExportData}
                className="w-full flex items-center justify-center space-x-2 bg-white border border-slate-200 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-50 transition shadow-sm"
              >
                <Download size={18} />
                <span>Download Backup (.json)</span>
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <h4 className="text-sm font-bold text-slate-700 mb-2">Restore / Import Data</h4>
              <p className="text-xs text-slate-500 mb-4">Unggah file backup untuk memulihkan data ke browser ini.</p>
              <input type="file" ref={fileInputRef} onChange={handleImportData} accept=".json" className="hidden" />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center space-x-2 bg-indigo-50 text-indigo-700 py-3 rounded-xl font-bold hover:bg-indigo-100 transition"
              >
                <Upload size={18} />
                <span>Upload & Restore Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change - Kept for utility */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 max-w-2xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <Key size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">Keamanan Akun</h3>
            <p className="text-sm text-slate-500">Ganti password admin</p>
          </div>
        </div>
        <form onSubmit={handlePasswordChange} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <input 
              type="password" required placeholder="Password Saat Ini"
              value={passData.current}
              onChange={e => setPassData({...passData, current: e.target.value})}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
            />
          </div>
          <input 
            type="password" required placeholder="Password Baru"
            value={passData.new}
            onChange={e => setPassData({...passData, new: e.target.value})}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
          />
          <input 
            type="password" required placeholder="Ulangi Password"
            value={passData.confirm}
            onChange={e => setPassData({...passData, confirm: e.target.value})}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
          />
          <button type="submit" className="sm:col-span-2 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg">
            Simpan Password Baru
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
