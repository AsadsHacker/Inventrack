import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Edit2, Trash2, Search, Loader2, Lock, Download, Database, 
  ShieldAlert, Shield, ShieldCheck, UserCheck, Key
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_URL || '';

const UserAccess = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Form State
  const [formData, setFormData] = useState({ 
    userId: 'Auto-generated',
    username: '', 
    password: '', 
    role: 'Viewer' 
  });

  // Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/users`);
      setData(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username.trim()) {
      toast.error('Username is required');
      return;
    }
    if (!isEditing && !formData.password.trim()) {
      toast.error('Password is required');
      return;
    }

    try {
      setSaving(true);
      if (isEditing) {
        const payload = { role: formData.role };
        if (formData.password) payload.password = formData.password;
        await axios.put(`${BASE_URL}/api/users/${editId}`, payload);
        toast.success('User access profile updated successfully');
      } else {
        await axios.post(`${BASE_URL}/api/users`, {
          username: formData.username,
          password: formData.password,
          role: formData.role
        });
        toast.success('New user account created successfully');
      }
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'An error occurred while saving user data');
    } finally {
      setSaving(false);
    }
  };

  const editItem = (item) => {
    setIsEditing(true);
    setEditId(item._id);
    setFormData({
      userId: item.userId || 'Auto-generated',
      username: item.username,
      password: '',
      role: item.role
    });
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({
      userId: 'Auto-generated',
      username: '',
      password: '',
      role: 'Viewer'
    });
  };

  const confirmDelete = (item) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${BASE_URL}/api/users/${itemToDelete._id}`);
      toast.success('User account revoked successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete user');
    } finally {
      setDeleteModalOpen(false);
      setItemToDelete(null);
      if (isEditing && editId === itemToDelete?._id) {
        resetForm();
      }
    }
  };

  const downloadCSV = () => {
    if (!data || !data.length) {
      toast.error("No data to export");
      return;
    }
    const headers = ["USER ID", "USERNAME", "ROLE", "STATUS"];
    const csvRows = [
      headers.join(','),
      ...data.map(item => [
        `"${item.userId || 'N/A'}"`,
        `"${item.username || 'N/A'}"`,
        `"${item.role || 'Viewer'}"`,
        `"${item.isActive ? 'Active' : 'Inactive'}"`
      ].join(','))
    ];
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'users_security_matrix.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV file downloaded");
  };

  const filtered = data.filter(d => 
    d.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.userId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination bounds
  const totalRecords = filtered.length;
  const totalPages = Math.ceil(totalRecords / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalRecords);
  const paginatedData = filtered.slice(startIndex, endIndex);

  const handlePageChange = (direction) => {
    if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Role pill styles
  const getRoleBadgeClass = (role) => {
    if (role === 'Admin') return 'bg-[#EF4444]/10 text-red-400 border border-red-500/20';
    if (role === 'Manager') return 'bg-[#2563EB]/10 text-[#58A6FF] border border-[#2563EB]/20';
    return 'bg-[#1C2128]/50 text-[#8B949E] border border-white/5';
  };

  const getAdminsCount = () => {
    return data.filter(d => d.role === 'Admin').length;
  };

  return (
    <div className="space-y-6 text-[#E6EDF3] animate-fade-in pb-10">
      
      {/* Console Header */}
      <section className="flex justify-between items-center bg-[#161B22]/40 p-4 border border-white/5 rounded-xl">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#E6EDF3]">Access Control Matrix</h2>
          <p className="text-xs font-mono text-[#8B949E] mt-0.5">User Accounts & Roles Directory • [v.2.4.0]</p>
        </div>
        <button 
          onClick={downloadCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1C2128] hover:bg-white/5 border border-white/5 rounded-lg text-xs font-mono text-[#E6EDF3] transition-all"
        >
          <Download size={14} />
          <span>Export CSV</span>
        </button>
      </section>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column - Form Card */}
        <div className="col-span-12 lg:col-span-4 bg-[#161B22] border border-white/5 rounded-xl p-6 skeuo-shadow">
          <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
            <span className="text-[10px] font-mono tracking-widest text-[#8B949E] uppercase font-bold flex items-center gap-1.5">
              <Database size={12} className="text-[#58A6FF]" />
              {isEditing ? 'EDIT SECURITY RECORD' : 'NEW USER ENTRY'}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider mb-1.5 block">
                User Access Identifier
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  value={formData.userId}
                  readOnly
                  className="w-full bg-[#1C2128] border border-white/5 rounded-lg py-2 pl-3 pr-10 text-xs font-mono text-[#8B949E] outline-none cursor-not-allowed"
                />
                <Lock size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B949E]/50" />
              </div>
              <span className="text-[9px] font-mono text-[#8B949E]/70 mt-1 block">
                Security key generated automatically.
              </span>
            </div>

            <div>
              <label className="text-[10px] font-mono text-[#E6EDF3] uppercase tracking-wider mb-1.5 block">
                Username <span className="text-red-400">*</span>
              </label>
              <input 
                type="text" 
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="e.g. john_doe"
                required
                disabled={isEditing}
                className={`w-full bg-[#1C2128] border border-white/5 rounded-lg py-2 px-3 text-xs text-[#E6EDF3] focus:ring-1 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-[#E6EDF3] uppercase tracking-wider mb-1.5 block">
                {isEditing ? 'New Password (Optional)' : 'Password'} {!isEditing && <span className="text-red-400">*</span>}
              </label>
              <div className="relative">
                <input 
                  type="password" 
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={isEditing ? 'Leave blank to keep current' : 'Enter password'}
                  required={!isEditing}
                  className="w-full bg-[#1C2128] border border-white/5 rounded-lg py-2 px-3 text-xs text-[#E6EDF3] placeholder:text-[#8B949E]/30 focus:ring-1 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all"
                />
                <Key size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B949E]/50" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono text-[#E6EDF3] uppercase tracking-wider mb-1.5 block">
                User Role <span className="text-red-400">*</span>
              </label>
              <select 
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
                className="w-full bg-[#1C2128] border border-white/5 rounded-lg py-2 px-3 text-xs text-[#E6EDF3] focus:ring-1 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all"
              >
                <option value="Admin" className="bg-[#161B22]">Admin</option>
                <option value="Manager" className="bg-[#161B22]">Manager</option>
                <option value="Viewer" className="bg-[#161B22]">Viewer</option>
              </select>
            </div>

            <div className="bg-[#1C2128] border border-white/5 p-3 rounded-lg flex items-start gap-2.5 text-[10px] text-[#8B949E]">
              <Lock size={14} className="text-[#58A6FF] shrink-0 mt-0.5" />
              <span>Roles strictly enforce view, creation, update and depletion permissions across all consoles.</span>
            </div>

            <div className="pt-2">
              {isEditing ? (
                <div className="flex gap-3">
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="flex-1 bg-[#2563EB] hover:bg-[#2563EB]/85 text-white font-medium py-2.5 rounded-lg transition-all text-xs font-mono uppercase tracking-wider skeuo-shadow flex items-center justify-center gap-1.5"
                  >
                    {saving && <Loader2 size={12} className="animate-spin" />}
                    <span>Update</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={resetForm}
                    className="flex-1 bg-transparent hover:bg-white/5 border border-white/5 text-[#E6EDF3] font-medium py-2.5 rounded-lg transition-all text-xs font-mono uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button 
                  type="submit" 
                  disabled={saving}
                  className="w-full bg-[#2563EB] hover:bg-[#2563EB]/85 text-white font-medium py-2.5 rounded-lg transition-all text-xs font-mono uppercase tracking-wider skeuo-shadow flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {saving && <Loader2 size={12} className="animate-spin" />}
                  <span>Create User</span>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right Column - Data Table Card */}
        <div className="col-span-12 lg:col-span-8 bg-[#161B22] border border-white/5 rounded-xl overflow-hidden skeuo-shadow">
          <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/2">
            <h3 className="text-sm font-bold text-[#E6EDF3] font-mono uppercase tracking-wider flex items-center gap-2">
              <Database size={14} className="text-[#58A6FF]" />
              Authorized Personnel Directory
            </h3>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Filter registry..." 
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="bg-[#1C2128] border border-white/5 rounded-full py-1.5 pl-8 pr-4 text-xs font-mono text-[#E6EDF3] focus:ring-1 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all placeholder:text-[#8B949E]/40"
              />
              <Search className="absolute left-2.5 top-2 text-[#8B949E]" size={14} />
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center p-12 text-[#2563EB]">
                <Loader2 size={36} className="animate-spin" />
              </div>
            ) : paginatedData.length > 0 ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#1C2128]/50 text-[#8B949E] text-[10px] font-mono uppercase tracking-wider border-b border-white/5">
                    <th className="px-6 py-3.5">User ID</th>
                    <th className="px-6 py-3.5">Username</th>
                    <th className="px-6 py-3.5">Role</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paginatedData.map((item) => (
                    <tr key={item._id} className="hover:bg-[#2563EB]/5 transition-colors group">
                      <td className="px-6 py-3 text-xs font-mono text-[#8B949E] whitespace-nowrap">{item.userId}</td>
                      <td className="px-6 py-3 text-xs font-bold text-[#E6EDF3] whitespace-nowrap">{item.username}</td>
                      <td className="px-6 py-3 text-xs whitespace-nowrap">
                        <span className={`px-2 py-0.5 text-[9px] font-mono rounded font-bold uppercase tracking-wider ${getRoleBadgeClass(item.role)}`}>
                          {item.role}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-xs whitespace-nowrap">
                        <span className={`px-2 py-0.5 text-[9px] font-mono rounded font-bold uppercase tracking-wider border ${
                          item.isActive 
                            ? 'bg-[#22C55E]/10 text-green-400 border-green-500/20' 
                            : 'bg-[#EF4444]/10 text-red-400 border-red-500/20'
                        }`}>
                          {item.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <button 
                            onClick={() => editItem(item)}
                            className="p-1.5 bg-[#2563EB]/10 text-[#58A6FF] rounded hover:bg-[#2563EB]/25 border border-[#2563EB]/20 transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button 
                            onClick={() => confirmDelete(item)}
                            className="p-1.5 bg-[#EF4444]/10 text-red-400 rounded hover:bg-[#EF4444]/25 border border-red-500/20 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center text-[#8B949E] font-mono text-xs">
                {searchTerm ? 'No matching user accounts found.' : 'Security matrix is empty. Authorize new user accounts.'}
              </div>
            )}
          </div>

          {!loading && totalRecords > 0 && (
            <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between bg-[#1C2128]/35">
              <span className="text-xs font-mono text-[#8B949E]">
                Showing <span className="font-semibold text-[#E6EDF3]">{startIndex + 1}</span> to <span className="font-semibold text-[#E6EDF3]">{endIndex}</span> of <span className="font-semibold text-[#E6EDF3]">{totalRecords}</span> records
              </span>
              <div className="flex gap-1">
                <button 
                  onClick={() => handlePageChange('prev')}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-xs font-mono border border-white/5 rounded transition-all bg-[#1C2128] text-[#E6EDF3] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5"
                >
                  Prev
                </button>
                <button 
                  onClick={() => handlePageChange('next')}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-xs font-mono border border-white/5 rounded transition-all bg-[#1C2128] text-[#E6EDF3] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Bottom Stats Card Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        
        {/* Total Users */}
        <div className="bg-[#161B22] border border-white/5 rounded-xl p-4 flex items-center gap-4 skeuo-shadow">
          <div className="w-10 h-10 bg-white/2 rounded-lg flex items-center justify-center shrink-0 border border-white/5 text-[#58A6FF]">
            <Shield size={18} />
          </div>
          <div>
            <p className="text-[9px] font-mono text-[#8B949E] uppercase tracking-wider">Authorized Users</p>
            <h4 className="text-xl font-bold tracking-tight text-[#E6EDF3] mt-0.5">
              {loading ? '...' : String(data.length).padStart(2, '0')}
            </h4>
          </div>
        </div>

        {/* Admins Count */}
        <div className="bg-[#161B22] border border-white/5 rounded-xl p-4 flex items-center gap-4 skeuo-shadow">
          <div className="w-10 h-10 bg-white/2 rounded-lg flex items-center justify-center shrink-0 border border-white/5 text-[#EF4444]">
            <ShieldAlert size={18} />
          </div>
          <div>
            <p className="text-[9px] font-mono text-[#8B949E] uppercase tracking-wider">Administrators</p>
            <h4 className="text-xl font-bold tracking-tight text-[#E6EDF3] mt-0.5">
              {loading ? '...' : String(getAdminsCount()).padStart(2, '0')}
            </h4>
          </div>
        </div>

        {/* Status */}
        <div className="bg-[#161B22] border border-white/5 rounded-xl p-4 flex items-center gap-4 skeuo-shadow">
          <div className="w-10 h-10 bg-white/2 rounded-lg flex items-center justify-center shrink-0 border border-white/5 text-[#22C55E]">
            <ShieldCheck size={18} />
          </div>
          <div>
            <p className="text-[9px] font-mono text-[#8B949E] uppercase tracking-wider">Access Security</p>
            <h4 className="text-xl font-bold tracking-tight text-[#E6EDF3] mt-0.5">
              Secure
            </h4>
          </div>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#161B22] border border-white/5 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-4 mx-auto border border-red-500/20">
                <Trash2 size={24} />
              </div>
              <h3 className="text-lg font-bold text-[#E6EDF3] mb-2 font-mono uppercase tracking-wider">Revoke Access</h3>
              <p className="text-sm text-[#8B949E] mb-6">
                Are you sure you want to delete and revoke authorization for <span className="font-bold text-[#E6EDF3] font-mono">{itemToDelete?.username}</span>? This user will no longer be able to log in.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setDeleteModalOpen(false)}
                  className="flex-1 py-2.5 bg-transparent hover:bg-white/5 border border-white/5 text-[#E6EDF3] font-medium rounded-lg transition-colors font-mono text-xs uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors font-mono text-xs uppercase tracking-wider"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserAccess;
