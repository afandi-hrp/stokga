
import React, { useState } from 'react';
import { useStore } from './store';
import PublicView from './components/PublicView';
import AdminView from './components/AdminView';
import { Package, LogIn, LogOut, AlertCircle, ShieldCheck, User as UserIcon } from 'lucide-react';

const App: React.FC = () => {
  const { auth, users, login, logout, branding } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // PERBAIKAN: Gunakan .trim() untuk menghapus spasi tak sengaja dari keyboard mobile
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    const foundUser = users.find(u => 
      u.username.toLowerCase() === cleanUsername.toLowerCase() && 
      u.password === cleanPassword
    );

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      login(userWithoutPassword as any);
      setUsername('');
      setPassword('');
    } else {
      setError('Username atau password salah!');
    }
  };

  // If not logged in, show Login Screen
  if (!auth.user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
          {/* Brand/Illustration Side */}
          <div 
            className="hidden md:flex flex-col justify-center items-center p-12 text-white text-center transition-colors duration-500"
            style={{ backgroundColor: branding.primaryColor }}
          >
            <div className="bg-white/20 p-6 rounded-3xl backdrop-blur-md mb-8 flex items-center justify-center min-w-[120px] min-h-[120px]">
              {branding.logo ? (
                <img src={branding.logo} alt="Logo" className="max-w-[80px] max-h-[80px] object-contain" />
              ) : (
                <Package size={64} className="text-white" />
              )}
            </div>
            <h1 className="text-3xl font-extrabold mb-4">{branding.title}</h1>
            <p className="text-indigo-50 text-lg opacity-90">Manajemen inventaris modern, cepat, dan terorganisir untuk bisnis Anda.</p>
            <div className="mt-12 space-y-4 text-sm text-white/70">
              <p>✓ Pelacakan Stok Real-time</p>
              <p>✓ Multi-lokasi Warehouse</p>
              <p>✓ Manajemen User Terpusat</p>
            </div>
          </div>

          {/* Login Form Side */}
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <div className="mb-8 text-center md:text-left">
              <h2 className="text-2xl font-bold text-slate-800">Selamat Datang</h2>
              <p className="text-slate-500">Silakan masuk untuk mengakses sistem</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-2xl flex items-center text-sm font-semibold border border-rose-100 animate-shake">
                <AlertCircle size={20} className="mr-3" />
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Username</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    // PERBAIKAN: Tambahkan atribut untuk mencegah gangguan keyboard iOS
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 outline-none transition-all pl-12"
                    style={{ '--tw-ring-color': `${branding.primaryColor}1A` } as any}
                    placeholder="Masukkan username..."
                    required
                  />
                  <UserIcon size={18} className="absolute left-4 top-3.5 text-slate-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                <div className="relative">
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoCapitalize="none"
                    autoCorrect="off"
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 outline-none transition-all pl-12"
                    style={{ '--tw-ring-color': `${branding.primaryColor}1A` } as any}
                    placeholder="••••••••"
                    required
                  />
                  <ShieldCheck size={18} className="absolute left-4 top-3.5 text-slate-400" />
                </div>
              </div>
              <button 
                type="submit" 
                className="w-full text-white py-4 rounded-2xl font-bold transition shadow-lg active:scale-[0.98]"
                style={{ backgroundColor: branding.primaryColor, boxShadow: `0 10px 15px -3px ${branding.primaryColor}33` }}
              >
                Sign In
              </button>
            </form>

            <div className="mt-8 pt-8 border-t text-center">
               <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Akses Sistem</p>
               <div className="mt-3 flex flex-wrap justify-center gap-2 text-[10px] text-slate-500">
                  <span className="bg-slate-100 px-2 py-1 rounded">Admin: admin/admin</span>
                  <span className="bg-slate-100 px-2 py-1 rounded">Staff: staff/staff</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center space-x-3">
              <div 
                className="p-2 rounded-2xl shadow-lg flex items-center justify-center min-w-[40px] min-h-[40px]"
                style={{ backgroundColor: branding.primaryColor, boxShadow: `0 10px 15px -3px ${branding.primaryColor}33` }}
              >
                {branding.logo ? (
                  <img src={branding.logo} alt="Logo" className="w-6 h-6 object-contain" />
                ) : (
                  <Package className="text-white" size={24} />
                )}
              </div>
              <span className="text-xl font-black text-slate-800 tracking-tight">{branding.title}</span>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex flex-col items-end mr-2 hidden sm:flex">
                <span className="text-sm font-bold text-slate-800">{auth.user.username}</span>
                <span 
                  className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${branding.primaryColor}1A`, color: branding.primaryColor }}
                >
                  {auth.user.role}
                </span>
              </div>
              <button 
                onClick={logout}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-sm font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 transition active:scale-95"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Role-based View */}
      <main className="flex-grow">
        {auth.user.role === 'admin' ? <AdminView /> : <PublicView />}
      </main>

      <footer className="bg-white border-t py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm font-medium">
            &copy; 2024 {branding.title}. Enterprise Edition v1.0
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
