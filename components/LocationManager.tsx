
import React, { useState } from 'react';
import { useStore } from '../store';
import { Plus, Edit2, Trash2, MapPin, X, Save } from 'lucide-react';
import { Location } from '../types';

const LocationManager: React.FC = () => {
  const { locations, addLocation, updateLocation, deleteLocation } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<Location, 'id'>>({
    kode_lokasi: '',
    nama_lokasi: ''
  });

  const handleEdit = (loc: Location) => {
    setEditingId(loc.id);
    setFormData({
      kode_lokasi: loc.kode_lokasi,
      nama_lokasi: loc.nama_lokasi
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateLocation(editingId, formData);
    } else {
      addLocation(formData);
    }
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ kode_lokasi: '', nama_lokasi: '' });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Master Data Lokasi</h2>
        <button 
          onClick={() => { setEditingId(null); setFormData({ kode_lokasi: '', nama_lokasi: '' }); setIsModalOpen(true); }}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
        >
          <Plus size={18} />
          <span>Tambah Lokasi</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {locations.map(loc => (
          <div key={loc.id} className="p-5 border rounded-2xl hover:border-indigo-300 hover:shadow-md transition group">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                <MapPin size={24} />
              </div>
              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition">
                <button onClick={() => handleEdit(loc)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => { if(confirm('Hapus lokasi? Barang di lokasi ini akan kehilangan referensi lokasi.')) deleteLocation(loc.id); }} className="p-1 text-rose-600 hover:bg-rose-50 rounded">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <h4 className="text-lg font-bold text-slate-800">{loc.nama_lokasi}</h4>
            <p className="text-indigo-600 font-mono text-sm font-bold uppercase tracking-widest mt-1">{loc.kode_lokasi}</p>
          </div>
        ))}
      </div>

      {/* Location Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-50 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">
                {editingId ? 'Edit Lokasi' : 'Tambah Lokasi Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Kode Lokasi</label>
                <input 
                  type="text" required
                  value={formData.kode_lokasi}
                  onChange={e => setFormData({...formData, kode_lokasi: e.target.value.toUpperCase()})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                  placeholder="e.g. WH-A1"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Lokasi</label>
                <input 
                  type="text" required
                  value={formData.nama_lokasi}
                  onChange={e => setFormData({...formData, nama_lokasi: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Gudang Utama Lantai 1"
                />
              </div>
              <div className="pt-4 flex space-x-3">
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 transition flex items-center justify-center space-x-2">
                  <Save size={18} />
                  <span>Simpan</span>
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-lg font-bold hover:bg-slate-200 transition">
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
