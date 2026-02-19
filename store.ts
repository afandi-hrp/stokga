
import { create } from 'zustand';
import { createClient } from '@supabase/supabase-js';
import { Item, Location, User, AuthState } from './types';

const SUPABASE_URL = 'https://supabase.waruna-group.co.id';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlbGYtaG9zdGVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDgzNDU2MDAsImV4cCI6MjAyMzkxMDQwMH0.XvR6vS_tXwN6pY8vR2pX9zW4mN7qQ5bL1tS6vH3aK9I';

// Cek apakah key adalah JWT yang valid (minimal mengandung dua titik)
const isJWT = (key: string) => key.split('.').length === 3;

if (!isJWT(SUPABASE_ANON_KEY)) {
  console.warn("PERINGATAN: ANON_KEY yang diberikan bukan format JWT yang valid. Hal ini akan menyebabkan error 'Expected 3 parts in JWT'. Silakan pastikan Anda menggunakan ANON_KEY dari dashboard/env Supabase Anda.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false, // Mematikan persistensi untuk menghindari parsing JWT auth otomatis jika key tidak valid
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'apikey': SUPABASE_ANON_KEY // Memastikan apikey tetap terkirim di header meskipun parsing JWT auth gagal
    }
  }
});

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
  users: [{ id: 'default-admin', username: 'admin', password: 'admin', role: 'admin' }],
  auth: { user: null, token: null },
  branding: DEFAULT_BRANDING,
  isLoading: false,
  schemaError: false,

  fetchData: async () => {
    set({ isLoading: true, schemaError: false });
    try {
      const [itemsRes, locsRes, usersRes, brandingRes] = await Promise.all([
        supabase.from('barang').select('*').order('sku', { ascending: true }),
        supabase.from('lokasi').select('*').order('nama_lokasi'),
        supabase.from('users').select('*'),
        supabase.from('settings').select('*').eq('id', 'branding').maybeSingle()
      ]);

      if (locsRes.error) {
        console.error("Fetch Locations Error:", locsRes.error);
        if (locsRes.error.message.includes('JWT') || locsRes.error.message.includes('3 parts')) {
          alert("Koneksi Gagal: ANON_KEY bukan JWT yang valid. Periksa file store.ts");
        }
        if (locsRes.error.message.includes('schema cache') || locsRes.error.code === 'PGRST103') {
          set({ schemaError: true });
        }
      }

      const dbUsers = (usersRes.data as any[]) || [];
      const finalUsers = dbUsers.length > 0 
        ? dbUsers 
        : [{ id: 'default-admin', username: 'admin', password: 'admin', role: 'admin' }];

      set({
        items: (itemsRes.data as Item[]) || [],
        locations: (locsRes.data as Location[]) || [],
        users: finalUsers,
        branding: brandingRes.data?.value || DEFAULT_BRANDING,
        isLoading: false
      });
    } catch (error) {
      console.error("Critical Connection Error:", error);
      set({ isLoading: false });
    }
  },

  login: (user) => set({ auth: { user, token: 'fake-jwt-token' } }),
  logout: () => set({ auth: { user: null, token: null } }),

  addItem: async (itemData) => {
    const { error } = await supabase.from('barang').insert([itemData]);
    if (error) {
      alert("Gagal tambah barang: " + error.message);
      console.error(error);
    } else await get().fetchData();
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
    // Memastikan header dikirim secara eksplisit untuk menangani self-hosted yang sensitif apikey
    const { error } = await supabase
      .from('lokasi')
      .insert([locData]);
      
    if (error) {
      console.error("Add Location Error Detail:", error);
      if (error.message.includes('JWT')) {
        alert("CRITICAL ERROR: Server mewajibkan ANON_KEY berupa JWT. Hubungi IT Waruna untuk mendapatkan JWT ANON_KEY yang benar.");
      } else {
        alert("Gagal tambah lokasi: " + error.message);
      }
      if (error.message.includes('schema cache')) set({ schemaError: true });
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
