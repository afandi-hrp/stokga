
import React, { useState } from 'react';
import { useStore } from '../store';
import { Plus, Edit2, Trash2, MapPin, X, Save, RefreshCw, Search, AlertTriangle, Terminal, Database } from 'lucide-react';
import { Location } from '../types';

const LocationManager: React.FC = () => {
  const { locations, addLocation, updateLocation, deleteLocation, fetchData, isLoading, schemaError } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<Omit<Location, 'id'>>({
    kode_lokasi: '',
    nama_lokasi: ''
  });

  const filteredLocations = locations.filter(loc => 
    loc.nama_lokasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loc.kode_lokasi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (loc: Location) => {
    setEditingId(loc.id);
    setFormData({
      kode_lokasi: loc.kode_lokasi,
      nama_lokasi: loc.nama_lokasi
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateLocation(editingId, formData);
    } else {
      await addLocation(formData);
    }
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ kode_lokasi: '', nama_lokasi: '' });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
      <div className="p-6 border-b flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Master Data Lokasi</h2>
          <p className="text-sm text-slate-500">Kelola zona dan titik penyimpanan barang</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative mr-2">
            <input 
              type="text" 
              placeholder="Cari lokasi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm w-48"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          </div>
          <button 
            onClick={() => fetchData()}
            disabled={isLoading}
            className={`p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition ${isLoading ? 'animate-spin text-indigo-600' : 'text-slate-500'}`}
            title="Refresh Data"
          >
            <RefreshCw size={18} />
          </button>
          <button 
            onClick={() => { setEditingId(null); setFormData({ kode_lokasi: '', nama_lokasi: '' }); setIsModalOpen(true); }}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium text-sm shadow-md"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Tambah Lokasi</span>
          </button>
        </div>
      </div>

      {/* SCHEMA CACHE ALERT - PERBAIKAN TOTAL */}
      {schemaError && (
        <div className="m-6 p-6 bg-rose-50 border-2 border-rose-200 rounded-2xl">
          <div className="flex items-start space-x-4">
            <div className="bg-rose-500 p-2 rounded-lg text-white animate-pulse">
              <AlertTriangle size={24} />
            </div>
            <div className="flex-grow">
              <h3 className="text-lg font-bold text-rose-900">Database Masih Terkunci</h3>
              <p className="text-sm text-rose-700 mb-4">
                Supabase menolak akses ke tabel 'lokasi'. Ini biasanya terjadi jika tabel dibuat tanpa izin akses eksplisit.
              </p>
              
              <div className="space-y-4">
                <div className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-xs overflow-x-auto relative group">
                  <div className="flex items-center space-x-2 text-rose-400 mb-2">
                    <Terminal size={14} />
                    <span>Langkah Perbaikan (Jalankan di SQL Editor Supabase):</span>
                  </div>
                  <p className="text-white font-bold">-- Langkah 1: Berikan Izin Role Anon</p>
                  <p>GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;</p>
                  <p>GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;</p>
                  <p className="text-white font-bold mt-2">-- Langkah 2: Paksa Reload API</p>
                  <p>NOTIFY pgrst, 'reload schema';</p>
                </div>

                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => fetchData()}
                    className="bg-rose-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-rose-700 transition shadow-lg flex items-center space-x-2"
                  >
                    <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                    <span>Cek Koneksi Lagi</span>
                  </button>
                  <a 
                    href="https://supabase.com/dashboard/project/xdwrqaeotnokxygralcx/sql/new" 
                    target="_blank"
                    className="text-xs font-bold text-slate-500 hover:text-indigo-600 underline flex items-center"
                  >
                    <Database size={14} className="mr-1" /> Buka SQL Editor Supabase &rarr;
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoading && locations.length === 0 ? (
        <div className="p-20 flex flex-col items-center justify-center text-slate-400">
          <RefreshCw size={48} className="animate-spin mb-4 opacity-20" />
          <p className="font-medium">Sinkronisasi Database...</p>
        </div>
      ) : filteredLocations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {filteredLocations.map(loc => (
            <div key={loc.id} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl hover:border-indigo-300 hover:bg-white hover:shadow-xl transition-all duration-300 group relative">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600 shadow-inner group-hover:scale-110 transition-transform">
                  <MapPin size={24} />
                </div>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(loc)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition" title="Edit">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => { if(confirm('Hapus lokasi ini?')) deleteLocation(loc.id); }} className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition" title="Hapus">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h4 className="text-lg font-extrabold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">
                {loc.nama_lokasi}
              </h4>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Kode:</span>
                <span className="text-indigo-600 font-mono text-xs font-black bg-white px-2 py-0.5 rounded border border-indigo-50 shadow-sm">
                  {loc.kode_lokasi}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-20 text-center">
          <div className="bg-slate-50 inline-flex p-8 rounded-full mb-4">
            <MapPin size={48} className="text-slate-200" />
          </div>
          <h3 className="text-xl font-bold text-slate-400">Data Lokasi Kosong</h3>
          <p className="text-slate-300 mt-2 max-w-xs mx-auto">
            Gagal menarik data dari tabel 'lokasi'. Jalankan skrip di SQL Editor jika ini pertama kali Anda menggunakan aplikasi.
          </p>
          <button 
            onClick={() => { setEditingId(null); setIsModalOpen(true); }}
            className="mt-6 text-indigo-600 font-bold hover:underline"
          >
            Tambah Lokasi Sekarang &rarr;
          </button>
        </div>
      )}

      {/* Location Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 bg-slate-50 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">
                {editingId ? 'Ubah Nama Lokasi' : 'Daftarkan Lokasi Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-200 rounded-full transition">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Kode Lokasi (ID Unik)</label>
                <input 
                  type="text" required
                  value={formData.kode_lokasi}
                  onChange={e => setFormData({...formData, kode_lokasi: e.target.value.toUpperCase()})}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-mono text-indigo-600 font-bold"
                  placeholder="e.g. WH-A1"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Nama Alias Lokasi</label>
                <input 
                  type="text" required
                  value={formData.nama_lokasi}
                  onChange={e => setFormData({...formData, nama_lokasi: e.target.value})}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none"
                  placeholder="e.g. Gudang Sparepart Lt. 2"
                />
              </div>
              <div className="pt-4 flex space-x-3">
                <button type="submit" className="flex-2 bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition flex items-center justify-center space-x-2 shadow-lg shadow-indigo-200 flex-[2]">
                  <Save size={18} />
                  <span>Simpan Perubahan</span>
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationManager;
