
import React, { useState } from 'react';
import { useStore } from '../store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { 
  Plus, Edit2, Trash2, LayoutGrid, List, Map, 
  TrendingUp, Package, MapPin, AlertCircle, CheckCircle,
  Users, Settings as SettingsIcon, Database, Download, AlertTriangle, X
} from 'lucide-react';
import ItemManager from './ItemManager';
import LocationManager from './LocationManager';
import UserManager from './UserManager';
import Settings from './Settings';

const AdminView: React.FC = () => {
  const { items, locations, users, branding } = useStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'items' | 'locations' | 'users' | 'settings'>('dashboard');

  const totalStock = items.reduce((acc, curr) => acc + curr.stok, 0);
  const lowStockItems = items.filter(i => i.stok < 10).length;

  const chartData = locations.map(loc => ({
    name: loc.kode_lokasi,
    count: items.filter(i => i.lokasi_id === loc.id).length
  }));

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'];

  const handleQuickExport = () => {
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
    link.download = `quick_backup_wms_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* DATA PERSISTENCE WARNING BAR */}
      <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-amber-100 p-2 rounded-full text-amber-600">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-900">Mode Penyimpanan Lokal Aktif</p>
            <p className="text-xs text-amber-700">Data tersimpan di browser ini. Lakukan backup berkala agar data tidak hilang saat hapus cache.</p>
          </div>
        </div>
        <button 
          onClick={handleQuickExport}
          className="flex items-center justify-center space-x-2 bg-white hover:bg-amber-100 border border-amber-200 text-amber-700 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm"
        >
          <Download size={14} />
          <span>Quick Backup (.json)</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center space-x-2 mb-8 border-b pb-4 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          <LayoutGrid size={18} className="mr-2" /> Overview
        </button>
        <button 
          onClick={() => setActiveTab('items')}
          className={`flex items-center px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${activeTab === 'items' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          <List size={18} className="mr-2" /> Master Barang
        </button>
        <button 
          onClick={() => setActiveTab('locations')}
          className={`flex items-center px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${activeTab === 'locations' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          <Map size={18} className="mr-2" /> Master Lokasi
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`flex items-center px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${activeTab === 'users' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          <Users size={18} className="mr-2" /> User Management
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex items-center px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${activeTab === 'settings' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          <SettingsIcon size={18} className="mr-2" /> Settings
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Items" value={items.length} icon={<Package className="text-blue-600" />} color="blue" />
            <StatCard title="Total Inventory" value={totalStock} icon={<TrendingUp className="text-indigo-600" />} color="indigo" />
            <StatCard title="Locations" value={locations.length} icon={<MapPin className="text-purple-600" />} color="purple" />
            <StatCard title="Low Stock Alert" value={lowStockItems} icon={<AlertCircle className="text-rose-600" />} color="rose" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Distribution by Location</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      cursor={{fill: '#f1f5f9'}}
                      contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800">Storage Info</h3>
                <Database className="text-slate-300" size={20} />
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Current Method</p>
                  <p className="text-sm font-bold text-slate-700">Web LocalStorage</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Cloud Sync</p>
                  <p className="text-sm font-bold text-rose-500 flex items-center">
                    <X size={14} className="mr-1" /> Not Connected
                  </p>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed italic">
                  *Untuk penggunaan industri, hubungkan ke database PostgreSQL/MySQL agar data tidak hilang saat ganti perangkat atau hapus cache browser.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'items' && <ItemManager />}
      {activeTab === 'locations' && <LocationManager />}
      {activeTab === 'users' && <UserManager />}
      {activeTab === 'settings' && <Settings />}
    </div>
  );
};

const StatCard: React.FC<{title: string, value: number, icon: React.ReactNode, color: string}> = ({title, value, icon, color}) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="text-2xl font-bold text-slate-800 mt-1">{value.toLocaleString()}</p>
    </div>
    <div className={`p-4 rounded-xl bg-${color}-50`}>
      {icon}
    </div>
  </div>
);

export default AdminView;
