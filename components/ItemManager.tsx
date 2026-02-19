
import React, { useState } from 'react';
import { useStore } from '../store';
import { Plus, Edit2, Trash2, Search, X, Save, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { Item } from '../types';

const ItemManager: React.FC = () => {
  const { items, locations, addItem, updateItem, deleteItem } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Omit<Item, 'id'>>({
    sku: '',
    nama_barang: '',
    kategori: '',
    lokasi_id: '',
    stok: 0,
    poto_barang: ''
  });

  const generateAutoSKU = () => {
    return `BRG-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`;
  };

  const filteredItems = items.filter(item => 
    item.nama_barang.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (item: Item) => {
    setEditingId(item.id);
    setFormData({
      sku: item.sku,
      nama_barang: item.nama_barang,
      kategori: item.kategori,
      lokasi_id: item.lokasi_id,
      stok: item.stok,
      poto_barang: item.poto_barang || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateItem(editingId, formData);
    } else {
      addItem(formData);
    }
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ sku: '', nama_barang: '', kategori: '', lokasi_id: '', stok: 0, poto_barang: '' });
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ 
      sku: generateAutoSKU(), // AUTOMATIC SKU
      nama_barang: '', 
      kategori: '', 
      lokasi_id: '', 
      stok: 0, 
      poto_barang: '' 
    });
    setIsModalOpen(true);
  };

  const getLocationCode = (id: string) => locations.find(l => l.id === id)?.kode_lokasi || 'N/A';

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-slate-800">Master Data Barang</h2>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative flex-grow sm:flex-grow-0">
            <input 
              type="text" 
              placeholder="Search SKU or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-full"
            />
            <Search size={18} className="absolute left-3 top-2.5 text-slate-400" />
          </div>
          <button 
            onClick={openAddModal}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Tambah Barang</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b text-slate-500 text-xs font-bold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Foto</th>
              <th className="px-6 py-4">SKU</th>
              <th className="px-6 py-4">Nama Barang</th>
              <th className="px-6 py-4">Kategori</th>
              <th className="px-6 py-4">Lokasi</th>
              <th className="px-6 py-4">Stok</th>
              <th className="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.map(item => (
              <tr key={item.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4">
                  <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center">
                    {item.poto_barang ? (
                      <img src={item.poto_barang} alt={item.nama_barang} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="text-slate-300" size={20} />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 font-mono text-xs font-semibold text-indigo-600">{item.sku}</td>
                <td className="px-6 py-4 font-medium text-slate-800">{item.nama_barang}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{item.kategori}</td>
                <td className="px-6 py-4">
                  <span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold text-slate-600">
                    {getLocationCode(item.lokasi_id)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`font-bold ${item.stok < 10 ? 'text-rose-500' : 'text-slate-800'}`}>
                    {item.stok}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center space-x-2">
                    <button onClick={() => handleEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => { if(confirm('Hapus barang ini?')) deleteItem(item.id); }} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-50 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">
                {editingId ? 'Edit Barang' : 'Tambah Barang Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    SKU Code
                    {!editingId && (
                      <button 
                        type="button" 
                        onClick={() => setFormData({...formData, sku: generateAutoSKU()})}
                        className="text-indigo-600 hover:text-indigo-800"
                        title="Regenerate SKU"
                      >
                        <RefreshCw size={12} />
                      </button>
                    )}
                  </label>
                  <input 
                    type="text" required
                    value={formData.sku}
                    onChange={e => setFormData({...formData, sku: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 font-mono"
                    placeholder="e.g. BRG-123456"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Stok</label>
                  <input 
                    type="number" required min="0"
                    value={formData.stok}
                    onChange={e => setFormData({...formData, stok: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Barang</label>
                <input 
                  type="text" required
                  value={formData.nama_barang}
                  onChange={e => setFormData({...formData, nama_barang: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Laptop MacBook Pro"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Kategori</label>
                <input 
                  type="text" required
                  value={formData.kategori}
                  onChange={e => setFormData({...formData, kategori: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Elektronik"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">URL Foto Barang</label>
                <input 
                  type="url"
                  value={formData.poto_barang}
                  onChange={e => setFormData({...formData, poto_barang: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Lokasi Penyimpanan</label>
                <select 
                  required
                  value={formData.lokasi_id}
                  onChange={e => setFormData({...formData, lokasi_id: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">Pilih Lokasi...</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.kode_lokasi} - {loc.nama_lokasi}</option>
                  ))}
                </select>
              </div>
              <div className="pt-4 flex space-x-3">
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 transition flex items-center justify-center space-x-2">
                  <Save size={18} />
                  <span>{editingId ? 'Simpan Perubahan' : 'Tambah Barang'}</span>
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

export default ItemManager;
