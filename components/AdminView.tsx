
import React, { useState } from 'react';
import { useStore } from '../store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { 
  Plus, Edit2, Trash2, LayoutGrid, List, Map, 
  TrendingUp, Package, MapPin, AlertCircle, CheckCircle,
  Users, Settings as SettingsIcon
} from 'lucide-react';
import ItemManager from './ItemManager';
import LocationManager from './LocationManager';
import UserManager from './UserManager';
import Settings from './Settings';

const AdminView: React.FC = () => {
  const { items, locations } = useStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'items' | 'locations' | 'users' | 'settings'>('dashboard');

  const totalStock = items.reduce((acc, curr) => acc + curr.stok, 0);
  const lowStockItems = items.filter(i => i.stok < 10).length;

  const chartData = locations.map(loc => ({
    name: loc.kode_lokasi,
    count: items.filter(i => i.lokasi_id === loc.id).length
  }));

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
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
              <h3 className="text-lg font-bold text-slate-800 mb-6">Items distribution by Location</h3>
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
              <h3 className="text-lg font-bold text-slate-800 mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((_, idx) => (
                  <div key={idx} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-slate-50 transition">
                    <div className="mt-1">
                      <CheckCircle size={16} className="text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">Stock update for Item #{Math.floor(Math.random() * 1000)}</p>
                      <p className="text-xs text-slate-400">{idx + 1} hours ago</p>
                    </div>
                  </div>
                ))}
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
