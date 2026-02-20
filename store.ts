
import { create } from 'zustand';
import { createClient } from '@supabase/supabase-js';
import { Item, Location, User, AuthState } from './types';

// CONFIGURATION
const SUPABASE_URL = 'https://supabase.waruna-group.co.id';

// Default key (Fallback only). 
// Kunci ini hanya bekerja jika server menggunakan secret default 'super-secret-jwt-token-with-at-least-32-characters-long'
const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzcxNTQ5MTI2LCJleHAiOjIwODY5MDkxMjZ9.kHX0SEfhFaJFHOQjT0ZCVxw75zfALLZ312vj4WY9n1Y';

// 1. Coba ambil key yang benar dari LocalStorage (jika user sudah pernah input manual)
const STORED_KEY = localStorage.getItem('WARUNA_SUPABASE_KEY');
const ACTIVE_KEY = STORED_KEY || DEFAULT_ANON_KEY;

// 2. Initialize Client
export const supabase = createClient(SUPABASE_URL, ACTIVE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
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
  connectionError: boolean; // Flag baru untuk mendeteksi kunci salah
  
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
  setApiKey: (newKey: string) => void; // Fungsi baru untuk update key
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
  connectionError: false,

  setApiKey: (newKey: string) => {
    localStorage.setItem('WARUNA_SUPABASE_KEY', newKey.trim());
    window.location.reload(); // Reload halaman agar Client ter-inisialisasi ulang dengan key baru
  },

  fetchData: async () => {
    set({ isLoading: true, schemaError: false, connectionError: false });
    try {
      const [itemsRes, locsRes, usersRes, brandingRes] = await Promise.all([
        supabase.from('barang').select('*').order('sku', { ascending: true }),
        supabase.from('lokasi').select('*').order('nama_lokasi'),
        supabase.from('users').select('*').order('username'),
        supabase.from('settings').select('*').eq('id', 'branding').maybeSingle()
      ]);

      // DETEKSI ERROR KUNCI SALAH
      const allErrors = [itemsRes.error, locsRes.error, usersRes.error].filter(Boolean);
      const isKeyError = allErrors.some(e => e?.message.includes('suitable key') || e?.message.includes('wrong key type') || e?.code === 'PGRST301');

      if (isKeyError) {
        console.error("FATAL: API Key Rejected by Server");
        set({ connectionError: true, isLoading: false });
        return;
      }

      if (itemsRes.error || locsRes.error || usersRes.error) {
        console.error("Fetch Data Errors:", { items: itemsRes.error, locs: locsRes.error, users: usersRes.error });
        if (locsRes.error?.message.includes('schema cache') || locsRes.error?.code === 'PGRST103') {
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
    } catch (error: any) {
      console.error("Critical Connection Error:", error);
      // Tangkap error network level
      set({ isLoading: false, connectionError: true });
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
    // Strategi 1: Coba Insert Normal (Standard)
    const { error } = await supabase.from('users').insert([userData]);
    
    if (error) {
      console.error("Standard Insert Failed:", error);
      
      // Check Auth Error specifically
      if (error.message.includes('suitable key') || error.message.includes('wrong key type')) {
        alert("KUNCI API DITOLAK: Anon Key yang digunakan salah. \n\nSilakan refresh halaman dan masukkan Anon Key yang benar dari Server Anda.");
        set({ connectionError: true });
        return;
      }

      // Strategi 2: Coba lewat RPC Function (Jalur Khusus/Bypass)
      console.log("Mencoba metode RPC fallback...");
      
      const { error: rpcError } = await supabase.rpc('create_user_safe', {
        p_username: userData.username,
        p_password: userData.password,
        p_role: userData.role
      });

      if (rpcError) {
        console.error("RPC Failed:", rpcError);
        alert(`Gagal tambah user.\nError: ${error.message}\nRPC: ${rpcError.message}`);
      } else {
        await get().fetchData(); // Berhasil lewat RPC
      }
    } else {
      await get().fetchData(); // Berhasil lewat Insert biasa
    }
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
