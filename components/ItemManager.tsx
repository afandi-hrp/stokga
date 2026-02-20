
import React, { useState, useRef } from 'react';
import { useStore } from '../store';
import { Plus, Edit2, Trash2, Search, X, Save, Image as ImageIcon, RefreshCw, FileUp, Download, Camera, UploadCloud, Loader2 } from 'lucide-react';
import { Item } from '../types';
import * as XLSX from 'xlsx';

const ItemManager: React.FC = () => {
  const { items, locations, addItem, updateItem, deleteItem, uploadImage } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Refs untuk input file
  const excelInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

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
    setPreviewUrl(item.poto_barang || '');
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Buat preview lokal sebelum upload
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let finalImageUrl = formData.poto_barang;

      // Jika ada file baru yang dipilih, upload dulu
      if (selectedFile) {
        const uploadedUrl = await uploadImage(selectedFile);
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        } else {
          setIsUploading(false);
          return; // Stop jika gagal upload
        }
      }

      const itemPayload = {
        ...formData,
        poto_barang: finalImageUrl
      };

      if (editingId) {
        await updateItem(editingId, itemPayload);
      } else {
        await addItem(itemPayload);
      }
      
      setIsModalOpen(false);
      setEditingId(null);
      setSelectedFile(null);
      setPreviewUrl('');
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsUploading(false);
    }
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
    setPreviewUrl('');
    setSelectedFile(null);
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
        const sku = row.SKU || row['sku'] || row['Kode Barang'];
        const nama = row.Nama || row['nama_barang'] || row['Nama Barang'];
        const kategori = row.Kategori || row['kategori'] || 'Umum';
        const kodeLokasi = row['Kode Lokasi'] || row['Lokasi'] || row['lokasi_kode'];
        const stok = parseInt(row.Stok || row['stok'] || row['Jumlah']) || 0;

        if (sku && nama) {
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
      if (excelInputRef.current) excelInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Master Data Barang</h2>
          <p className="text-sm text-slate-500">Database Server: Supabase Self-Hosted</p>
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
            ref={excelInputRef} 
            onChange={handleImportExcel} 
            accept=".xlsx, .xls, .csv" 
            className="hidden" 
          />
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => excelInputRef.current?.click()}
              className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-lg hover:bg-emerald-100 transition font-medium text-sm shadow-sm"
              title="Import dari Excel"
            >
              <FileUp size={18} />
              <span className="hidden lg:inline">Import Excel</span>
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
                    <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center flex-shrink-0 relative">
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
              
              {/* Image Upload Section */}
              <div className="flex flex-col items-center justify-center mb-6">
                <div className="w-full h-48 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group">
                  {previewUrl ? (
                    <>
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <p className="text-white font-bold text-sm">Ganti Foto</p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      <ImageIcon className="mx-auto text-slate-300 mb-2" size={32} />
                      <p className="text-xs text-slate-400 font-medium">Belum ada foto</p>
                    </div>
                  )}
                </div>

                {/* Hidden Inputs */}
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" // Forces rear camera on mobile
                  ref={cameraInputRef} 
                  onChange={handleFileSelect} 
                  className="hidden" 
                />
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={galleryInputRef} 
                  onChange={handleFileSelect} 
                  className="hidden" 
                />

                <div className="flex space-x-3 mt-4 w-full">
                  <button 
                    type="button" 
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center space-x-2 bg-slate-800 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-slate-900 transition active:scale-95"
                  >
                    <Camera size={16} />
                    <span>Kamera</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => galleryInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center space-x-2 bg-slate-100 text-slate-700 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-200 transition active:scale-95 border border-slate-200"
                  >
                    <UploadCloud size={16} />
                    <span>Galeri</span>
                  </button>
                </div>
              </div>

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
                <button 
                  type="submit" 
                  disabled={isUploading}
                  className={`flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center justify-center space-x-2 shadow-lg shadow-indigo-200 ${isUploading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  <span>{isUploading ? 'Mengupload...' : (editingId ? 'Update Barang' : 'Simpan Barang')}</span>
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
