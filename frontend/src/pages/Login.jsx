import { useState } from 'react';
import axios from 'axios';
import { Loader2, Package } from 'lucide-react';
import { toast } from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_URL || '';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) { toast.error('Please enter both fields'); return; }
    try {
      setLoading(true);
      const res = await axios.post(`${BASE_URL}/api/auth/login`, { username, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      toast.success('Login successful!');
      onLogin(res.data.user);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center font-inter">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-[#1a1a1a] px-8 py-8 text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Package size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-wide">InvenTrack</h1>
            <p className="text-gray-400 text-sm mt-1">Inventory Management System</p>
          </div>
          <form onSubmit={handleSubmit} className="p-8">
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
              {loading ? <Loader2 size={20} className="animate-spin" /> : null}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            <p className="text-center text-xs text-gray-400 mt-4">Default: admin / Admin@123</p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
