
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Item, Location, User, AuthState } from './types';

interface Branding {
  title: string;
  primaryColor: string;
}

interface WarehouseStore {
  items: Item[];
  locations: Location[];
  users: (User & { password?: string })[];
  auth: AuthState;
  branding: Branding;
  
  // Branding Actions
  updateBranding: (branding: Partial<Branding>) => void;

  // Auth Actions
  login: (user: User) => void;
  logout: () => void;
  changePassword: (username: string, newPassword: string) => void;

  // User Actions
  addUser: (user: Omit<User, 'id'> & { password?: string }) => void;
  deleteUser: (id: string) => void;

  // Location Actions
  addLocation: (loc: Omit<Location, 'id'>) => void;
  updateLocation: (id: string, loc: Partial<Location>) => void;
  deleteLocation: (id: string) => void;

  // Item Actions
  addItem: (item: Omit<Item, 'id'>) => void;
  updateItem: (id: string, item: Partial<Item>) => void;
  deleteItem: (id: string) => void;
}

const initialLocations: Location[] = [
  { id: '1', kode_lokasi: 'WH-A1', nama_lokasi: 'Gudang Utama A1' },
  { id: '2', kode_lokasi: 'WH-B2', nama_lokasi: 'Gudang Logistik B2' },
];

const initialItems: Item[] = [
  { id: '1', sku: 'BRG-000123', nama_barang: 'Laptop ThinkPad X1', kategori: 'Elektronik', lokasi_id: '1', stok: 15, poto_barang: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&q=80' },
];

const initialUsers = [
  { id: '1', username: 'admin', role: 'admin' as const, password: 'admin' },
  { id: '2', username: 'staff', role: 'staff' as const, password: 'staff' }
];

const defaultBranding: Branding = {
  title: 'SmartWarehouse Pro',
  primaryColor: '#4f46e5' // indigo-600
};

export const useStore = create<WarehouseStore>()(
  persist(
    (set) => ({
      items: initialItems,
      locations: initialLocations,
      users: initialUsers,
      auth: { user: null, token: null },
      branding: defaultBranding,

      updateBranding: (branding) => set((state) => ({
        branding: { ...state.branding, ...branding }
      })),

      login: (user) => set({ 
        auth: { user, token: 'mock-jwt-token' } 
      }),
      
      logout: () => set({ auth: { user: null, token: null } }),

      changePassword: (username, newPassword) => set((state) => ({
        users: state.users.map(u => u.username === username ? { ...u, password: newPassword } : u)
      })),

      addUser: (user) => set((state) => ({
        users: [...state.users, { ...user, id: Math.random().toString(36).substr(2, 9) }]
      })),

      deleteUser: (id) => set((state) => ({
        users: state.users.filter(u => u.id !== id)
      })),

      addLocation: (loc) => set((state) => ({
        locations: [...state.locations, { ...loc, id: Math.random().toString(36).substr(2, 9) }]
      })),

      updateLocation: (id, updatedLoc) => set((state) => ({
        locations: state.locations.map(l => l.id === id ? { ...l, ...updatedLoc } : l)
      })),

      deleteLocation: (id) => set((state) => ({
        locations: state.locations.filter(l => l.id !== id),
        items: state.items.map(i => i.lokasi_id === id ? { ...i, lokasi_id: '' } : i)
      })),

      addItem: (item) => set((state) => ({
        items: [...state.items, { ...item, id: Math.random().toString(36).substr(2, 9) }]
      })),

      updateItem: (id, updatedItem) => set((state) => ({
        items: state.items.map(i => i.id === id ? { ...i, ...updatedItem } : i)
      })),

      deleteItem: (id) => set((state) => ({
        items: state.items.filter(i => i.id !== id)
      })),
    }),
    { 
      name: 'warehouse-storage',
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        ...persistedState,
      }),
    }
  )
);
