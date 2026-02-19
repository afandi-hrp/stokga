
import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { Search, MapPin, Box, Tag, Image as ImageIcon } from 'lucide-react';

const PublicView: React.FC = () => {
  const { items, locations } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.nama_barang.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation = selectedLocation === '' || item.lokasi_id === selectedLocation;
      return matchesSearch && matchesLocation;
    });
  }, [items, searchTerm, selectedLocation]);

  const getLocationName = (id: string) => {
    return locations.find(l => l.id === id)?.nama_lokasi || 'Unknown';
  };

  const getKodeLokasi = (id: string) => {
    return locations.find(l => l.id === id)?.kode_lokasi || 'N/A';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Pencarian Inventaris</h1>
        <p className="text-slate-500">Cari lokasi barang dan periksa ketersediaan stok secara real-time.</p>
      </div>

      {/* Controls Section */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Nama atau SKU Barang</label>
            <div className="relative">
              <input 
                type="text"
                placeholder="Contoh: Laptop, BRG-001..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all pl-14"
              />
              <Search className="absolute left-5 top-4 text-slate-400" size={24} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Lokasi Gudang</label>
            <div className="relative">
              <select 
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer pl-14"
              >
                <option value="">Semua Lokasi</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.kode_lokasi} - {loc.nama_lokasi}</option>
                ))}
              </select>
              <MapPin className="absolute left-5 top-4 text-slate-400" size={24} />
              <div className="absolute right-5 top-5 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <div key={item.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden group">
              <div className="aspect-[4/3] w-full bg-slate-50 relative overflow-hidden">
                {item.poto_barang ? (
                  <img src={item.poto_barang} alt={item.nama_barang} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-200">
                    <ImageIcon size={48} />
                    <span className="text-[10px] uppercase font-black mt-3 tracking-widest opacity-50">No Image</span>
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full shadow-xl backdrop-blur-md ${item.stok > 10 ? 'bg-green-500/90 text-white' : 'bg-orange-500/90 text-white'}`}>
                    <Box size={14} />
                    <span className="text-xs font-black">{item.stok}</span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg">
                    {item.sku}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.kategori}</span>
                </div>
                
                <h3 className="text-lg font-bold text-slate-800 mb-6 group-hover:text-indigo-600 transition-colors line-clamp-2 min-h-[3.5rem]">
                  {item.nama_barang}
                </h3>

                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center text-slate-500">
                    <MapPin size={16} className="mr-2 text-indigo-500" />
                    <span className="text-xs font-bold text-slate-700">{getKodeLokasi(item.lokasi_id)}</span>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400">{getLocationName(item.lokasi_id)}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-32 text-center">
            <div className="bg-slate-50 inline-flex p-10 rounded-full mb-6">
              <Search size={64} className="text-slate-200" />
            </div>
            <h3 className="text-2xl font-bold text-slate-400">Tidak ada barang ditemukan</h3>
            <p className="text-slate-300 mt-2">Coba gunakan kata kunci lain atau pilih lokasi yang berbeda.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicView;
