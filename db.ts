
import Dexie, { Table } from 'dexie';
import { Item, Location, User } from './types';

// Definisi Schema Database Lokal
class WarehouseDB extends Dexie {
  items!: Table<Item>;
  locations!: Table<Location>;
  users!: Table<User & { password?: string }>;
  settings!: Table<{ id: string; value: any }>;

  constructor() {
    super('SmartWarehouseDB');
    
    // Definisi tabel dan index (primary key & kolom yang sering dicari)
    this.version(1).stores({
      items: 'id, sku, nama_barang, lokasi_id',
      locations: 'id, kode_lokasi',
      users: 'id, username',
      settings: 'id' // Key-value store untuk branding
    });
  }
}

export const db = new WarehouseDB();

// Fungsi untuk inisialisasi data awal (Seeding)
export const seedDatabase = async () => {
  const userCount = await db.users.count();
  
  if (userCount === 0) {
    // Default Admin
    await db.users.add({
      id: crypto.randomUUID(),
      username: 'admin',
      password: 'admin',
      role: 'admin'
    });

    // Default Locations
    const locId1 = crypto.randomUUID();
    const locId2 = crypto.randomUUID();
    await db.locations.bulkAdd([
      { id: locId1, kode_lokasi: 'WH-A1', nama_lokasi: 'Gudang Utama - Zone A' },
      { id: locId2, kode_lokasi: 'WH-B2', nama_lokasi: 'Gudang Elektronik - Lt 2' }
    ]);

    // Default Items
    await db.items.bulkAdd([
      { 
        id: crypto.randomUUID(), 
        sku: 'BRG-001', 
        nama_barang: 'Laptop ThinkPad X1', 
        kategori: 'Elektronik', 
        stok: 15, 
        lokasi_id: locId2, 
        poto_barang: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?auto=format&fit=crop&q=80&w=1000' 
      },
      { 
        id: crypto.randomUUID(), 
        sku: 'BRG-002', 
        nama_barang: 'Safety Helmet Kuning', 
        kategori: 'Safety Gear', 
        stok: 50, 
        lokasi_id: locId1, 
        poto_barang: 'https://images.unsplash.com/photo-1585834952674-d40b85292445?auto=format&fit=crop&q=80&w=1000' 
      }
    ]);

    // Default Branding
    await db.settings.put({
      id: 'branding',
      value: {
        title: 'SmartWarehouse Pro', 
        primaryColor: '#4f46e5', 
        logo: '',
        description: 'Sistem Manajemen Pergudangan Terpadu (Local Mode).',
        footerText: 'Local Database v2.0',
        copyrightText: '© 2026 Enterprise Resource'
      }
    });
  }
};
