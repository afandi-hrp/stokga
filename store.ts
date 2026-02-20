
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
  description?: string;
  footerText?: string;
  copyrightText?: string;
}

interface WarehouseStore {
  items: Item[];
  locations: Location[];
  users: (User & { password?: string })[];
  auth: AuthState;
  branding: Branding;
  isLoading: boolean;
  schemaError: boolean;
  dbStatus: 'connected' | 'error' | 'empty';
  
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

const DEFAULT_ADMIN = { id: 'default-admin', username: 'admin', password: 'admin', role: 'admin' as const };

const DEFAULT_BRANDING = { 
  title: 'SmartWarehouse Pro', 
  primaryColor: '#4f46e5', 
  logo: '',
  description: 'Sistem Manajemen Pergudangan Terpadu dengan Kontrol Inventaris Real-time.',
  footerText: 'Cloud Warehouse v1.1',
  copyrightText: '© 2026 Enterprise Resource'
};

export const useStore = create<WarehouseStore>((set, get) => ({
  items: [],
  locations: [],
  users: [DEFAULT_ADMIN],
  auth: { user: null, token: null },
  branding: DEFAULT_BRANDING,
  isLoading: false,
  schemaError: false,
  dbStatus: 'connected',

  fetchData: async () => {
    set({ isLoading: true, schemaError: false });
    try {
      const [itemsRes, locsRes, usersRes, brandingRes] = await Promise.all([
        supabase.from('barang').select('*').order('sku', { ascending: true }),
        supabase.from('lokasi').select('*').order('nama_lokasi'),
        supabase.from('users').select('*'),
        supabase.from('settings').select('*').eq('id', 'branding').maybeSingle()
      ]);

      // Detect Schema Cache Errors
      if (locsRes.error || itemsRes.error || usersRes.error) {
        const err = locsRes.error || itemsRes.error || usersRes.error;
        console.error("Supabase Query Error:", err);
        if (err?.message.includes('schema cache') || err?.code === 'PGRST103') {
          set({ schemaError: true });
        }
        set({ dbStatus: 'error' });
      }

      const dbUsers = (usersRes.data as any[]) || [];
      
      // If DB is connected but users table is empty, or if there's an error fetching users
      if (usersRes.error || dbUsers.length === 0) {
        set({ 
          users: [DEFAULT_ADMIN],
          dbStatus: dbUsers.length === 0 ? 'empty' : 'error'
        });
      } else {
        set({ users: dbUsers, dbStatus: 'connected' });
      }

      set({
        items: (itemsRes.data as Item[]) || [],
        locations: (locsRes.data as Location[]) || [],
        branding: brandingRes.data?.value || DEFAULT_BRANDING,
        isLoading: false
      });
    } catch (error) {
      console.error("Critical Connection Error:", error);
      set({ isLoading: false, dbStatus: 'error', users: [DEFAULT_ADMIN] });
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
    if (error) {
      if (error.message.includes('schema cache')) set({ schemaError: true });
      alert("Gagal tambah lokasi: " + error.message);
    } else await get().fetchData();
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
