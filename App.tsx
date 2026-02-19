
import React, { useState } from 'react';
import { useStore } from './store';
import PublicView from './components/PublicView';
import AdminView from './components/AdminView';
import { Package, LogIn, LogOut, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<'public' | 'admin'>('public');
  const { auth, users, login, logout } = useStore();
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Dynamic lookup in the users array
    const foundUser = users.find(u => u.username === username && u.password === password);

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      login(userWithoutPassword as any);
      setShowLogin(false);
      setView('admin');
      setUsername('');
      setPassword('');
    } else {
      setError('Username atau password salah!');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-indigo-700 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setView('public')}>
              <div className="bg-white p-2 rounded-lg">
                <Package className="text-indigo-700" size={24} />
              </div>
              <span className="text-xl font-bold tracking-tight">SmartWarehouse</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setView('public')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${view === 'public' ? 'bg-indigo-800' : 'hover:bg-indigo-600'}`}
              >
                Cari Inventaris
              </button>
              
              {auth.user ? (
                <>
                  <button 
                    onClick={() => setView('admin')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition ${view === 'admin' ? 'bg-indigo-800' : 'hover:bg-indigo-600'}`}
                  >
                    Dashboard
                  </button>
                  <button 
                    onClick={() => { logout(); setView('public'); }}
                    className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium bg-red-500 hover:bg-red-600 transition"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setShowLogin(true)}
                  className="flex items-center space-x-1 px-4 py-2 rounded-md text-sm font-medium bg-white text-indigo-700 hover:bg-indigo-50 transition"
                >
                  <LogIn size={16} />
                  <span>Admin Login</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow">
        {view === 'public' ? <PublicView /> : <AdminView />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-slate-400 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <p>&copy; 2024 SmartWarehouse Management System. All Rights Reserved.</p>
        </div>
      </footer>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Admin Login</h2>
            <p className="text-slate-500 mb-6 text-sm">Masuk untuk mengelola stok gudang</p>
            
            {error && (
              <div className="mb-6 p-3 bg-rose-50 text-rose-600 rounded-lg flex items-center text-sm font-medium border border-rose-100">
                <AlertCircle size={18} className="mr-2" />
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Username</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50"
                  placeholder="admin"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button 
                  type="submit" 
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
                >
                  Sign In
                </button>
                <button 
                  type="button" 
                  onClick={() => { setShowLogin(false); setError(''); }}
                  className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
            <div className="mt-6 pt-6 border-t text-center">
               <p className="text-xs text-slate-400">Default: admin / admin</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
