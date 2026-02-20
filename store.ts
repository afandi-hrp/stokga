
import { create } from 'zustand';
import { db, seedDatabase } from './db';
import { Item, Location, User, AuthState } from './types';

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
  users: [],
  auth: { user: null, token: null },
  branding: DEFAULT_BRANDING,
  isLoading: false,

  fetchData: async () => {
    set({ isLoading: true });
    try {
      // Pastikan data awal ada
      await seedDatabase();

      const [items, locations, users, brandingSetting] = await Promise.all([
        db.items.toArray(),
        db.locations.toArray(),
        db.users.toArray(),
        db.settings.get('branding')
      ]);

      set({
        items: items || [],
        locations: locations || [],
        users: users || [],
        branding: brandingSetting?.value || DEFAULT_BRANDING,
        isLoading: false
      });
    } catch (error) {
      console.error("Database Error:", error);
      set({ isLoading: false });
    }
  },

  login: (user) => set({ auth: { user, token: 'local-session-token' } }),
  logout: () => set({ auth: { user: null, token: null } }),

  addItem: async (itemData) => {
    try {
      const newItem = { ...itemData, id: crypto.randomUUID() };
      await db.items.add(newItem);
      await get().fetchData();
    } catch (e) { alert("Gagal tambah barang: " + e); }
  },

  updateItem: async (id, itemData) => {
    try {
      await db.items.update(id, itemData);
      await get().fetchData();
    } catch (e) { alert("Gagal update barang: " + e); }
  },

  deleteItem: async (id) => {
    try {
      await db.items.delete(id);
      await get().fetchData();
    } catch (e) { alert("Gagal hapus barang: " + e); }
  },

  addLocation: async (locData) => {
    try {
      const newLoc = { ...locData, id: crypto.randomUUID() };
      await db.locations.add(newLoc);
      await get().fetchData();
    } catch (e) { alert("Gagal tambah lokasi: " + e); }
  },

  updateLocation: async (id, locData) => {
    try {
      await db.locations.update(id, locData);
      await get().fetchData();
    } catch (e) { alert("Gagal update lokasi: " + e); }
  },

  deleteLocation: async (id) => {
    try {
      await db.locations.delete(id);
      await get().fetchData();
    } catch (e) { alert("Gagal hapus lokasi: " + e); }
  },

  addUser: async (userData) => {
    try {
      const newUser = { ...userData, id: crypto.randomUUID() };
      await db.users.add(newUser);
      await get().fetchData();
    } catch (e) { alert("Gagal tambah user: " + e); }
  },

  deleteUser: async (id) => {
    try {
      await db.users.delete(id);
      await get().fetchData();
    } catch (e) { alert("Gagal hapus user: " + e); }
  },

  changePassword: async (username, newPass) => {
    try {
      const user = await db.users.where('username').equals(username).first();
      if (user) {
        await db.users.update(user.id, { password: newPass });
        await get().fetchData();
      }
    } catch (e) { alert("Gagal ganti password: " + e); }
  },

  updateBranding: async (brandingData) => {
    const newBranding = { ...get().branding, ...brandingData };
    try {
      await db.settings.put({ id: 'branding', value: newBranding });
      set({ branding: newBranding });
    } catch (e) { alert("Gagal update branding: " + e); }
  }
}));
