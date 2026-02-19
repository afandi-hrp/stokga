
import { create } from 'zustand';
import { createClient } from '@supabase/supabase-js';
import { Item, Location, User, AuthState } from './types';

const SUPABASE_URL = 'https://xdwrqaeotnokxygralcx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhkd3JxYWVvdG5va3h5Z3JhbGN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0Njg5NTIsImV4cCI6MjA4NzA0NDk1Mn0.Kae01Xe0F63KZEskh0tCGEi2fSZmdIwKWHCT8K60SBM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface Branding {
  title: string;
  primaryColor: string;
  logo?: string;
}

interface WarehouseStore {
  items: Item[];
  locations: Location[];
  users: (User & { password?: string })[];
  auth: AuthState;
  branding: Branding;
  isLoading: boolean;
  
  fetchData: () => Promise<void>;
  login: (user: User) => void;
  logout: () => void;
  addItem: (item: Omit<Item, 'id'>) => Promise<void>;
  updateItem: (id: string, item: Partial<Item>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  addLocation: (loc: Omit<Location, 'id'>) => Promise<void>;
  updateLocation: (id: string, loc: Partial<Location>) => Promise<void>;
  deleteLocation: (id: string) => Promise<void>;
  addUser: (user: Omit<User, 'id'> & { password?: string }) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  changePassword: (username: string, newPass: string) => Promise<void>;
  updateBranding: (branding: Partial<Branding>) => Promise<void>;
}

export const useStore = create<WarehouseStore>((set, get) => ({
  items: [],
  locations: [],
  users: [{ id: 'default-admin', username: 'admin', password: 'admin', role: 'admin' }],
  auth: { user: null, token: null },
  branding: { title: 'SmartWarehouse Pro', primaryColor: '#4f46e5', logo: '' },
  isLoading: false,

  fetchData: async () => {
    set({ isLoading: true });
    try {
      // Mengambil data secara paralel namun menangani error secara individu
      const [itemsRes, locsRes, usersRes, brandingRes] = await Promise.all([
        supabase.from('barang').select('*').order('sku', { ascending: true }),
        supabase.from('lokasi').select('*').order('nama_lokasi'),
        supabase.from('users').select('*'),
        supabase.from('settings').select('*').eq('id', 'branding').maybeSingle()
      ]);

      if (locsRes.error) {
        console.error("❌ Error Tabel Lokasi:", locsRes.error.message);
      } else {
        console.log("✅ Data Lokasi Terambil:", locsRes.data?.length || 0, "rows");
      }

      if (itemsRes.error) console.error("❌ Error Tabel Barang:", itemsRes.error.message);
      if (usersRes.error) console.error("❌ Error Tabel Users:", usersRes.error.message);

      const dbUsers = (usersRes.data as any[]) || [];
      const finalUsers = dbUsers.length > 0 
        ? dbUsers 
        : [{ id: 'default-admin', username: 'admin', password: 'admin', role: 'admin' }];

      set({
        items: (itemsRes.data as Item[]) || [],
        locations: (locsRes.data as Location[]) || [],
        users: finalUsers,
        branding: brandingRes.data?.value || { title: 'SmartWarehouse Pro', primaryColor: '#4f46e5', logo: '' },
        isLoading: false
      });
    } catch (error) {
      console.error("Critical Fetch Error:", error);
      set({ isLoading: false });
    }
  },

  login: (user) => set({ auth: { user, token: 'fake-jwt-token' } }),
  logout: () => set({ auth: { user: null, token: null } }),

  addItem: async (itemData) => {
    const { error } = await supabase.from('barang').insert([itemData]);
    if (error) alert("Gagal tambah barang: " + error.message);
    else await get().fetchData();
  },

  updateItem: async (id, itemData) => {
    const { error } = await supabase.from('barang').update(itemData).eq('id', id);
    if (error) alert("Gagal update barang: " + error.message);
    else await get().fetchData();
  },

  deleteItem: async (id) => {
    const { error } = await supabase.from('barang').delete().eq('id', id);
    if (error) alert("Gagal hapus barang: " + error.message);
    else await get().fetchData();
  },

  addLocation: async (locData) => {
    const { error } = await supabase.from('lokasi').insert([locData]);
    if (error) alert("Gagal tambah lokasi: " + error.message);
    else await get().fetchData();
  },

  updateLocation: async (id, locData) => {
    const { error } = await supabase.from('lokasi').update(locData).eq('id', id);
    if (error) alert("Gagal update lokasi: " + error.message);
    else await get().fetchData();
  },

  deleteLocation: async (id) => {
    const { error } = await supabase.from('lokasi').delete().eq('id', id);
    if (error) alert("Gagal hapus lokasi: " + error.message);
    else await get().fetchData();
  },

  addUser: async (userData) => {
    const { error } = await supabase.from('users').insert([userData]);
    if (error) alert("Gagal tambah user: " + error.message);
    else await get().fetchData();
  },

  deleteUser: async (id) => {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) alert("Gagal hapus user: " + error.message);
    else await get().fetchData();
  },

  changePassword: async (username, newPass) => {
    const { error } = await supabase.from('users').update({ password: newPass }).eq('username', username);
    if (error) alert("Gagal ganti password: " + error.message);
    else await get().fetchData();
  },

  updateBranding: async (brandingData) => {
    const newBranding = { ...get().branding, ...brandingData };
    const { error } = await supabase.from('settings').upsert({ id: 'branding', value: newBranding });
    if (error) alert("Gagal update branding: " + error.message);
    else set({ branding: newBranding });
  }
}));
