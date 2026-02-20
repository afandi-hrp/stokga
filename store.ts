
import { create } from 'zustand';
import { createClient } from '@supabase/supabase-js';
import { Item, Location, User, AuthState } from './types';

// CONFIGURATION SUPABASE SELF-HOSTED
const SUPABASE_URL = 'https://supabase.waruna-group.co.id';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE5MDAwMDAwMDB9.Y1fo9TYR0AXEipC4pagd-23mMPqoGJIQpBdQgqJDNl0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

interface Branding {
  title: string;
  primaryColor: string;
  logo?: string;
  description?: string;
  footerText?: string;
  copyrightText?: string;
  icon?: string;
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
  
  // CRUD & Upload
  uploadImage: (file: File) => Promise<string | null>;
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
  footerText: 'Enterprise Edition v3.0',
  copyrightText: '© 2026 Waruna Group'
};

export const useStore = create<WarehouseStore>((set, get) => ({
  items: [],
  locations: [],
  users: [],
  auth: { user: null, token: null },
  branding: DEFAULT_BRANDING,
  isLoading: false,

  fetchData: async () => {
    set({ isLoading: true });
    try {
      const [itemsRes, locsRes, usersRes, brandingRes] = await Promise.all([
        supabase.from('barang').select('*').order('created_at', { ascending: false }),
        supabase.from('lokasi').select('*').order('nama_lokasi'),
        supabase.from('users').select('*').order('username'),
        supabase.from('settings').select('*').eq('id', 'branding').maybeSingle()
      ]);

      if (itemsRes.error) console.error("Error fetching items:", itemsRes.error);

      set({
        items: (itemsRes.data as Item[]) || [],
        locations: (locsRes.data as Location[]) || [],
        users: (usersRes.data as any[]) || [],
        branding: brandingRes.data?.value || DEFAULT_BRANDING,
        isLoading: false
      });
    } catch (error) {
      console.error("Critical Connection Error:", error);
      set({ isLoading: false });
    }
  },

  login: (user) => set({ auth: { user, token: 'session-active' } }),
  logout: () => set({ auth: { user: null, token: null } }),

  // --- IMAGE UPLOAD LOGIC ---
  uploadImage: async (file: File) => {
    try {
      // 1. Buat nama file unik
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${fileName}`;

      // 2. Upload ke Bucket 'barang-images'
      const { error: uploadError } = await supabase.storage
        .from('barang-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // 3. Dapatkan Public URL
      const { data } = supabase.storage
        .from('barang-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error: any) {
      alert("Gagal upload foto: " + error.message);
      return null;
    }
  },

  addItem: async (itemData) => {
    const { error } = await supabase.from('barang').insert([itemData]);
    if (error) {
      alert("Gagal tambah barang: " + error.message);
    } else await get().fetchData();
  },

  updateItem: async (id, itemData) => {
    const { error } = await supabase.from('barang').update(itemData).eq('id', id);
    if (error) {
      alert("Gagal update barang: " + error.message);
    } else await get().fetchData();
  },

  deleteItem: async (id) => {
    const { error } = await supabase.from('barang').delete().eq('id', id);
    if (error) {
      alert("Gagal hapus barang: " + error.message);
    } else await get().fetchData();
  },

  addLocation: async (locData) => {
    const { error } = await supabase.from('lokasi').insert([locData]);
    if (error) {
      alert("Gagal tambah lokasi: " + error.message);
    } else await get().fetchData();
  },

  updateLocation: async (id, locData) => {
    const { error } = await supabase.from('lokasi').update(locData).eq('id', id);
    if (error) {
      alert("Gagal update lokasi: " + error.message);
    } else await get().fetchData();
  },

  deleteLocation: async (id) => {
    const { error } = await supabase.from('lokasi').delete().eq('id', id);
    if (error) {
      alert("Gagal hapus lokasi: " + error.message);
    } else await get().fetchData();
  },

  addUser: async (userData) => {
    // Menggunakan RPC untuk bypass RLS pada insert user jika perlu, atau insert biasa
    const { error } = await supabase.from('users').insert([userData]);
    if (error) {
       // Fallback jika insert biasa gagal karena RLS, coba RPC
       const { error: rpcError } = await supabase.rpc('create_user_safe', {
        p_username: userData.username,
        p_password: userData.password,
        p_role: userData.role
      });
      if(rpcError) alert("Gagal tambah user: " + error.message);
      else await get().fetchData();
    } else {
      await get().fetchData();
    }
  },

  deleteUser: async (id) => {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) {
      alert("Gagal hapus user: " + error.message);
    } else await get().fetchData();
  },

  changePassword: async (username, newPass) => {
    const { error } = await supabase.from('users').update({ password: newPass }).eq('username', username);
    if (error) {
      alert("Gagal ganti password: " + error.message);
    } else await get().fetchData();
  },

  updateBranding: async (brandingData) => {
    const newBranding = { ...get().branding, ...brandingData };
    const { error } = await supabase.from('settings').upsert({ id: 'branding', value: newBranding });
    if (error) {
      alert("Gagal update branding: " + error.message);
    } else set({ branding: newBranding });
  }
}));
