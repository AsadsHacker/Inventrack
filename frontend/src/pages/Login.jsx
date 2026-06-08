import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Package } from 'lucide-react';
import { toast } from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_URL || '';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeUnits, setActiveUnits] = useState('—');

  // Fetch real item count for bottom stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/items`);
        const count = Array.isArray(res.data) ? res.data.length : 0;
        setActiveUnits(count.toLocaleString());
      } catch {
        setActiveUnits('—');
      }
    };
    fetchStats();
  }, []);

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
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>

      {/* ── LEFT SIDE: Warehouse hero ── */}
      <div style={{
        flex: '0 0 50%',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Background image */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(https://media.istockphoto.com/id/1712798955/vector/digital-warehouse.jpg?s=612x612&w=0&k=20&c=ZE_eh1R0gKfJUEXDrO7-vtS1fqAzBkv7OfnCyTpUk_0=)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }} />
        {/* Dark overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.65)',
        }} />

        {/* Logo — top left */}
        <div style={{
          position: 'absolute', top: 32, left: 32,
          display: 'flex', alignItems: 'center', gap: 10, zIndex: 2,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            border: '1.5px solid #2563EB',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Package size={20} color="#2563EB" />
          </div>
          <span style={{ color: '#fff', fontSize: 16, fontWeight: 600, letterSpacing: '0.02em' }}>
            InvenTrack
          </span>
        </div>

        {/* Bottom content */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '0 32px 28px 32px', zIndex: 2,
        }}>
          {/* Heading */}
          <h2 style={{
            color: '#fff', fontWeight: 700, fontSize: 34,
            lineHeight: 1.2, margin: '0 0 12px 0',
          }}>
            Inventory Intelligence<br />
            <span style={{ color: '#fff' }}>for Warehouse Management.</span>
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.55)', fontSize: 14,
            lineHeight: 1.6, margin: '0 0 28px 0', maxWidth: 420,
          }}>
            Secure terminal for the central inventory management system.
          </p>

          {/* Gradient divider */}
          <div style={{
            height: 1, marginBottom: 16,
            background: 'linear-gradient(90deg, #2563EB 0%, transparent 70%)',
          }} />

          {/* Stats bar */}
          <div style={{
            display: 'flex', gap: 40,
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          }}>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.1em', marginBottom: 4 }}>
                ACTIVE UNITS
              </div>
              <div style={{ fontSize: 14, color: '#3B82F6', fontWeight: 600 }}>
                {activeUnits} Units
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.1em', marginBottom: 4 }}>
                SYSTEM STATUS
              </div>
              <div style={{ fontSize: 14, color: '#22C55E', fontWeight: 600 }}>
                Operational
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT SIDE: Login form ── */}
      <div style={{
        flex: '0 0 50%',
        background: '#0D1117',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          {/* Login card */}
          <div style={{
            background: '#161B22',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16,
            padding: 40,
          }}>
            <h1 style={{
              color: '#E6EDF3', fontWeight: 700, fontSize: 22,
              margin: '0 0 8px 0',
            }}>
              Authorize Access
            </h1>
            <p style={{
              color: '#8B949E', fontSize: 13, lineHeight: 1.5,
              margin: '0 0 28px 0',
            }}>
              Enter your credentials to access the system.
            </p>

            <form onSubmit={handleSubmit}>
              {/* Operator ID */}
              <div style={{ marginBottom: 20 }}>
                <label style={{
                  display: 'block', color: '#E6EDF3', fontSize: 13,
                  fontWeight: 500, marginBottom: 8,
                }}>
                  Operator ID
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  required
                  style={{
                    width: '100%', padding: '12px 14px',
                    background: '#1C2128',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 10, color: '#E6EDF3', fontSize: 14,
                    outline: 'none', transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2563EB'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </div>

              {/* Access Key */}
              <div style={{ marginBottom: 28 }}>
                <label style={{
                  display: 'block', color: '#E6EDF3', fontSize: 13,
                  fontWeight: 500, marginBottom: 8,
                }}>
                  Access Key
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%', padding: '12px 14px',
                    background: '#1C2128',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 10, color: '#E6EDF3', fontSize: 14,
                    outline: 'none', transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2563EB'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '12px',
                  background: '#2563EB', color: '#fff',
                  border: 'none', borderRadius: 10,
                  fontSize: 15, fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: 'filter 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
                onMouseEnter={(e) => { if (!loading) e.target.style.filter = 'brightness(1.1)'; }}
                onMouseLeave={(e) => { e.target.style.filter = 'none'; }}
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? 'Authorizing...' : 'Authorize Access'}
              </button>
            </form>

            {/* Card footer */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginTop: 28, paddingTop: 20,
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: '#22C55E',
                  boxShadow: '0 0 6px rgba(34,197,94,0.5)',
                }} />
                <span style={{
                  fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                  fontSize: 12, color: '#8B949E',
                }}>
                  Systems Nominal
                </span>
              </div>
              <span style={{
                fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                fontSize: 10, color: '#8B949E', letterSpacing: '0.05em',
              }}>
                TERMINAL V4.2.0-PRODUCTION
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
