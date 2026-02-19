
import React, { useState, useEffect } from 'react';
import { useStore } from './store';
import PublicView from './components/PublicView';
import AdminView from './components/AdminView';
import { Package, LogIn, LogOut, AlertCircle, ShieldCheck, User as UserIcon, Loader2, Lock } from 'lucide-react';

const App: React.FC = () => {
  const { auth, users, login, logout, branding, fetchData, isLoading } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);

    setTimeout(() => {
      const cleanUsername = username.trim().toLowerCase();
      const cleanPassword = password.trim();

      const foundUser = users.find(u => 
        u.username.toLowerCase() === cleanUsername && 
        u.password === cleanPassword
      );

      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser;
        login(userWithoutPassword as any);
        setUsername('');
        setPassword('');
      } else {
        setError('Kredensial tidak valid. Silakan periksa kembali.');
      }
      setIsLoggingIn(false);
    }, 500);
  };

  if (isLoading && users.length === 0 && !auth.user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 size={48} className="text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium tracking-wide">Mempersiapkan Dashboard...</p>
      </div>
    );
  }

  if (!auth.user) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 sm:p-12">
        <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-12 bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden animate-in fade-in zoom-in duration-700">
          
          <div 
            className="hidden md:flex md:col-span-5 flex-col justify-between p-12 text-white relative overflow-hidden"
            style={{ backgroundColor: branding.primaryColor }}
          >
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <div className="inline-flex items-center justify-center p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 mb-8">
                {branding.logo ? (
                  <img src={branding.logo} alt="Logo" className="w-10 h-10 object-contain" />
                ) : (
                  <Package size={40} className="text-white" />
                )}
              </div>
              <h1 className="text-4xl font-black leading-tight tracking-tight mb-4">
                {branding.title}
              </h1>
              <p className="text-white/80 text-lg leading-relaxed max-w-xs">
                {branding.description || 'Sistem Manajemen Pergudangan Terpadu dengan Kontrol Inventaris Real-time.'}
              </p>
            </div>

            <div className="relative z-10 space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-1.5 h-1.5 bg-white/50 rounded-full"></div>
                <p className="text-sm font-medium text-white/70">Akurasi Stok 100%</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-1.5 h-1.5 bg-white/50 rounded-full"></div>
                <p className="text-sm font-medium text-white/70">Multi-Gudang Terintegrasi</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-1.5 h-1.5 bg-white/50 rounded-full"></div>
                <p className="text-sm font-medium text-white/70">Keamanan Cloud Terenkripsi</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-7 p-10 md:p-20 flex flex-col justify-center bg-white">
            <div className="mb-10">
              <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs uppercase tracking-widest mb-2">
                <Lock size={12} />
                <span>Gerbang Akses Aman</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Sign In</h2>
              <p className="text-slate-500 mt-2">Masukkan identitas Anda untuk mengelola gudang</p>
            </div>

            {error && (
              <div className="mb-8 p-4 bg-rose-50 text-rose-700 rounded-2xl flex items-center text-sm font-bold border border-rose-100 animate-in slide-in-from-top-2">
                <AlertCircle size={18} className="mr-3 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-2.5 ml-1">Username</label>
                <div className="relative group">
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoCapitalize="none"
                    autoCorrect="off"
                    disabled={isLoggingIn}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all pl-14 text-slate-800 placeholder:text-slate-400 disabled:opacity-50"
                    placeholder="Contoh: admin"
                    required
                  />
                  <UserIcon size={20} className="absolute left-5 top-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-2.5 ml-1">Password</label>
                <div className="relative group">
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoggingIn}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all pl-14 text-slate-800 placeholder:text-slate-400 disabled:opacity-50"
                    placeholder="••••••••"
                    required
                  />
                  <ShieldCheck size={20} className="absolute left-5 top-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoggingIn}
                className="w-full text-white py-5 rounded-2xl font-bold transition-all shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_24px_-4px_rgba(0,0,0,0.2)] active:scale-[0.98] mt-4 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ backgroundColor: branding.primaryColor }}
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 size={20} className="animate-spin mr-2" />
                    Memverifikasi...
                  </>
                ) : (
                  'Masuk ke Dashboard'
                )}
              </button>
            </form>

            <div className="mt-12 pt-8 border-t border-slate-100">
              <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                <span>© 2024 Enterprise Resource</span>
                <span className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  System Online
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
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

      <main className="flex-grow">
        {auth.user.role === 'admin' ? <AdminView /> : <PublicView />}
      </main>

      <footer className="bg-white border-t py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm font-medium">
            &copy; 2024 {branding.title}. {branding.footerText || 'Cloud Warehouse v1.1'}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
