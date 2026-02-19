
import React, { useState, useEffect } from 'react';
import { useStore } from './store';
import PublicView from './components/PublicView';
import AdminView from './components/AdminView';
import { Package, LayoutDashboard, Search, LogIn, LogOut } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<'public' | 'admin'>('public');
  const { auth, login, logout } = useStore();
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      login(username);
      setShowLogin(false);
      setView('admin');
    } else {
      alert('Invalid Credentials! Try admin/admin');
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
                Search Inventory
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
                    onClick={() => logout()}
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Admin Login</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="admin"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="admin"
                  required
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button 
                  type="submit" 
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
                >
                  Sign In
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowLogin(false)}
                  className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-lg font-medium hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
            <p className="mt-4 text-xs text-slate-500 text-center">Demo: use admin / admin</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
