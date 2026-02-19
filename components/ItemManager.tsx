
import React, { useState, useRef } from 'react';
import { useStore } from '../store';
import { Plus, Edit2, Trash2, Search, X, Save, Image as ImageIcon, RefreshCw, FileUp, Download } from 'lucide-react';
import { Item } from '../types';
import * as XLSX from 'xlsx';

const ItemManager: React.FC = () => {
  const { items, locations, addItem, updateItem, deleteItem } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Omit<Item, 'id'>>({
    sku: '',
    nama_barang: '',
    kategori: '',
    lokasi_id: '',
    stok: 0,
    poto_barang: ''
  });

  const generateAutoSKU = () => {
    const prefix = "BRG";
    const date = new Date();
    const timestamp = date.getTime().toString().slice(-6);
    const random = Math.floor(100 + Math.random() * 900);
    return `${prefix}-${timestamp}${random}`;
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
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ 
      sku: generateAutoSKU(),
      nama_barang: '', 
      kategori: '', 
      lokasi_id: '', 
      stok: 0, 
      poto_barang: '' 
    });
    setIsModalOpen(true);
  };

  const getLocationCode = (id: string) => locations.find(l => l.id === id)?.kode_lokasi || 'N/A';

  // --- EXCEL IMPORT LOGIC ---
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws) as any[];

      let importCount = 0;
      data.forEach((row) => {
        // Normalisasi header (mendukung variasi nama kolom)
        const sku = row.SKU || row['sku'] || row['Kode Barang'];
        const nama = row.Nama || row['nama_barang'] || row['Nama Barang'];
        const kategori = row.Kategori || row['kategori'] || 'Umum';
        const kodeLokasi = row['Kode Lokasi'] || row['Lokasi'] || row['lokasi_kode'];
        const stok = parseInt(row.Stok || row['stok'] || row['Jumlah']) || 0;

        if (sku && nama) {
          // Cari lokasi_id berdasarkan kode_lokasi di excel
          const locationMatch = locations.find(l => 
            l.kode_lokasi.toLowerCase() === String(kodeLokasi || '').toLowerCase()
          );

          addItem({
            sku: String(sku),
            nama_barang: String(nama),
            kategori: String(kategori),
            lokasi_id: locationMatch?.id || (locations[0]?.id || ''),
            stok: stok,
            poto_barang: ''
          });
          importCount++;
        }
      });

      alert(`Berhasil mengimpor ${importCount} barang!`);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  const downloadTemplate = () => {
    const template = [
      { 'SKU': 'BRG-001', 'Nama Barang': 'Contoh Barang', 'Kategori': 'Elektronik', 'Kode Lokasi': locations[0]?.kode_lokasi || 'WH-A1', 'Stok': 10 }
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Template_Import_Barang.xlsx");
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Master Data Barang</h2>
          <p className="text-sm text-slate-500">Kelola stok dan informasi inventaris gudang</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-grow sm:flex-grow-0">
            <input 
              type="text" 
              placeholder="Cari SKU atau Nama..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-full sm:w-64"
            />
            <Search size={18} className="absolute left-3 top-2.5 text-slate-400" />
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImportExcel} 
            accept=".xlsx, .xls, .csv" 
            className="hidden" 
          />
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-lg hover:bg-emerald-100 transition font-medium text-sm shadow-sm"
              title="Import dari Excel"
            >
              <FileUp size={18} />
              <span className="hidden lg:inline">Import Excel</span>
            </button>
            
            <button 
              onClick={downloadTemplate}
              className="p-2 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 transition shadow-sm"
              title="Download Template"
            >
              <Download size={18} />
            </button>

            <button 
              onClick={openAddModal}
              className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium text-sm shadow-lg shadow-indigo-100"
            >
              <Plus size={18} />
              <span>Tambah Barang</span>
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b text-slate-500 text-xs font-bold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Produk</th>
              <th className="px-6 py-4">SKU</th>
              <th className="px-6 py-4">Lokasi</th>
              <th className="px-6 py-4 text-center">Stok</th>
              <th className="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.map(item => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition group">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center flex-shrink-0">
                      {item.poto_barang ? (
                        <img src={item.poto_barang} alt={item.nama_barang} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="text-slate-300" size={20} />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{item.nama_barang}</p>
                      <p className="text-xs text-slate-500 uppercase">{item.kategori}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                   <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                    {item.sku}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-700">{getLocationCode(item.lokasi_id)}</span>
                    <span className="text-[10px] text-slate-400">Zone Code</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-block min-w-[3rem] px-2 py-1 rounded-full text-xs font-bold ${item.stok < 10 ? 'bg-rose-50 text-rose-600' : 'bg-green-50 text-green-600'}`}>
                    {item.stok}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center space-x-2 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => handleEdit(item)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => { if(confirm('Hapus barang ini?')) deleteItem(item.id); }} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Hapus">
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg my-8 overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="px-8 py-6 bg-slate-50 border-b flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  {editingId ? 'Ubah Informasi Barang' : 'Tambah Barang Baru'}
                </h3>
                <p className="text-sm text-slate-500">Lengkapi detail produk berikut</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center justify-between">
                    SKU Barang
                    {!editingId && (
                      <button 
                        type="button" 
                        onClick={() => setFormData({...formData, sku: generateAutoSKU()})}
                        className="text-indigo-600 hover:text-indigo-800 p-1 rounded hover:bg-indigo-50"
                        title="Generate SKU Baru"
                      >
                        <RefreshCw size={14} />
                      </button>
                    )}
                  </label>
                  <input 
                    type="text" required
                    value={formData.sku}
                    onChange={e => setFormData({...formData, sku: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Jumlah Stok</label>
                  <input 
                    type="number" required min="0"
                    value={formData.stok}
                    onChange={e => setFormData({...formData, stok: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Nama Produk</label>
                <input 
                  type="text" required
                  value={formData.nama_barang}
                  onChange={e => setFormData({...formData, nama_barang: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Contoh: Pallet Kayu Jati"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Kategori</label>
                <input 
                  type="text" required
                  value={formData.kategori}
                  onChange={e => setFormData({...formData, kategori: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Elektronik, Furniture, dll"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">URL Foto Produk</label>
                <div className="flex space-x-3">
                  <input 
                    type="url"
                    value={formData.poto_barang}
                    onChange={e => setFormData({...formData, poto_barang: e.target.value})}
                    className="flex-grow px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    placeholder="https://images.unsplash.com/..."
                  />
                  {formData.poto_barang && (
                    <div className="w-12 h-10 rounded-lg overflow-hidden border shadow-sm">
                      <img src={formData.poto_barang} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Lokasi Penempatan</label>
                <select 
                  required
                  value={formData.lokasi_id}
                  onChange={e => setFormData({...formData, lokasi_id: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                >
                  <option value="">Pilih Lokasi Gudang...</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.kode_lokasi} - {loc.nama_lokasi}</option>
                  ))}
                </select>
              </div>
              <div className="pt-6 flex space-x-3">
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center justify-center space-x-2 shadow-lg shadow-indigo-200">
                  <Save size={18} />
                  <span>{editingId ? 'Update Barang' : 'Tambah Ke Inventaris'}</span>
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition">
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
