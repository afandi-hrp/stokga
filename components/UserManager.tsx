
import React, { useState } from 'react';
import { useStore } from '../store';
import { Plus, Trash2, UserPlus, Shield, X, Save, User as UserIcon } from 'lucide-react';

const UserManager: React.FC = () => {
  const { users, addUser, deleteUser, auth } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'admin' as const
  });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    addUser(formData);
    setIsModalOpen(false);
    setFormData({ username: '', password: '', role: 'admin' });
    alert(`User ${formData.username} created successfully!`);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">User Management</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
        >
          <UserPlus size={18} />
          <span>Add New User</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b text-slate-500 text-xs font-bold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Username</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700">
                      <UserIcon size={16} />
                    </div>
                    <span className="font-medium text-slate-800">{user.username}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="flex items-center text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full uppercase">
                    <Shield size={12} className="mr-1" /> {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  {user.username !== auth.user?.username ? (
                    <button 
                      onClick={() => { if(confirm(`Hapus user ${user.username}?`)) deleteUser(user.id); }}
                      className="text-rose-600 hover:bg-rose-50 p-1.5 rounded transition"
                      title="Delete User"
                    >
                      <Trash2 size={16} />
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium italic">Your account</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-50 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Add New System User</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Username</label>
                <input 
                  type="text" required
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. gudang_staff"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Temporary Password</label>
                <input 
                  type="password" required
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="********"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">User Role</label>
                <select 
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value as any})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="admin">Administrator</option>
                  <option value="staff">Staff Warehouse</option>
                </select>
              </div>
              <div className="pt-4 flex space-x-3">
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 transition flex items-center justify-center space-x-2">
                  <Save size={18} />
                  <span>Create User</span>
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-lg font-bold hover:bg-slate-200 transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;
