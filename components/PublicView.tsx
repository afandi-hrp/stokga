
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
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Inventory Search</h1>
        <p className="text-slate-600 max-w-2xl mx-auto">Find item locations and stock levels across all warehouse zones in real-time.</p>
      </div>

      {/* Controls Section */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center">
              <Search size={16} className="mr-2" /> Search Item
            </label>
            <input 
              type="text"
              placeholder="Type SKU or Item Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all pl-12"
            />
            <Search className="absolute left-4 bottom-3.5 text-slate-400" size={20} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center">
              <MapPin size={16} className="mr-2" /> Filter by Location
            </label>
            <select 
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="">All Locations</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.kode_lokasi} - {loc.nama_lokasi}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <div className="aspect-video w-full bg-slate-100 relative overflow-hidden">
                {item.poto_barang ? (
                  <img src={item.poto_barang} alt={item.nama_barang} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                    <ImageIcon size={40} />
                    <span className="text-[10px] uppercase font-bold mt-2 tracking-widest">No Image Available</span>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full shadow-lg ${item.stok > 10 ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}`}>
                    <Box size={10} />
                    <span className="text-[10px] font-bold">{item.stok} units</span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                    {item.sku}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.kategori}</span>
                </div>
                
                <h3 className="text-lg font-bold text-slate-800 mb-4 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {item.nama_barang}
                </h3>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-slate-500">
                    <MapPin size={14} className="mr-2 flex-shrink-0" />
                    <span>Location: </span>
                    <span className="ml-1 font-medium text-indigo-600 bg-indigo-50 px-1.5 rounded">{getKodeLokasi(item.lokasi_id)}</span>
                  </div>
                  <div className="pt-2 border-t mt-3">
                    <p className="text-xs text-slate-400 font-medium">{getLocationName(item.lokasi_id)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <div className="bg-slate-100 inline-flex p-6 rounded-full mb-4">
              <Search size={48} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-600">No items found</h3>
            <p className="text-slate-400">Try adjusting your search keywords or filter settings.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicView;
