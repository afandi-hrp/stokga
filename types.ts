
export interface Location {
  id: string;
  kode_lokasi: string;
  nama_lokasi: string;
}

export interface Item {
  id: string;
  sku: string;
  nama_barang: string;
  kategori: string;
  lokasi_id: string;
  stok: number;
  poto_barang?: string;
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'staff';
}

export interface AuthState {
  user: User | null;
  token: string | null;
}
