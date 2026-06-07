import { useState, useRef, useEffect } from 'react';
import { Bell, AlertTriangle, Menu, Search, Settings } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { getUser } from '../utils/auth';

const BASE_URL = import.meta.env.VITE_API_URL || '';

const TopBar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [lowStockItems, setLowStockItems] = useState([]);
  const dropdownRef = useRef(null);
  const user = getUser();
  const isViewer = user?.role === 'Viewer';

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/dashboard`);
        setLowStockItems(res.data?.lowStockItems || []);
      } catch { /* silent */ }
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const hasLowStock = lowStockItems.length > 0;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getPageTitle = () => {
    const titles = {
      '/dashboard': 'Dashboard', 
      '/': 'Dashboard', 
      '/unit-entry': 'Unit Entry', 
      '/category-entry': 'Category Entry',
      '/supplier-entry': 'Supplier Entry', 
      '/item-entries': 'Item Entries', 
      '/location-entries': 'Location Entries',
      '/stock-in': 'Stock In', 
      '/stock-out': 'Stock Out', 
      '/stock-transfer': 'Stock Transfer',
      '/reports': 'Reports', 
      '/user-access': 'User Access',
    };
    return titles[location.pathname] || 'InvenTrack';
  };

  const isDashboard = location.pathname === '/dashboard' || location.pathname === '/';

  return (
    <header className="h-[70px] bg-[#0D1117]/70 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 md:px-8 sticky top-0 z-20 shrink-0">
      <div className="flex items-center gap-3 flex-1">
        <button 
          onClick={() => setSidebarOpen(true)}
          className="p-1.5 text-[#8B949E] hover:bg-[#161B22] rounded-lg lg:hidden transition-colors"
        >
          <Menu size={24} />
        </button>

        {isDashboard ? (
          <div className="relative w-full max-w-md hidden sm:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B949E]" />
            <input 
              className="w-full bg-[#161B22] border border-white/5 rounded-full py-2 pl-10 pr-4 text-xs font-mono text-[#E6EDF3] focus:ring-1 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all placeholder:text-[#8B949E]/50" 
              placeholder="Search Inventory, Units, or Assets..." 
              type="text" 
            />
          </div>
        ) : (
          <h2 className="text-lg font-bold tracking-tight text-[#E6EDF3] truncate">{getPageTitle()}</h2>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Mobile Search input placeholder */}
        {isDashboard && (
          <div className="relative block sm:hidden max-w-[120px]">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8B949E]" />
            <input 
              className="w-full bg-[#161B22] border border-white/5 rounded-full py-1.5 pl-8 pr-2 text-[10px] font-mono text-[#E6EDF3] outline-none" 
              placeholder="Search..." 
              type="text" 
            />
          </div>
        )}

        {/* Viewer indicator badge */}
        {isViewer && (
          <span className="bg-[#EAB308]/10 text-[#F59E0B] border border-[#EAB308]/20 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider">
            View Only Mode
          </span>
        )}

        {/* Low Stock Alert Badge Button */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => hasLowStock && setDropdownOpen(!dropdownOpen)} 
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all ${
              hasLowStock 
                ? 'bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20 active:scale-95' 
                : 'bg-green-500/10 border border-green-500/30 text-green-500 cursor-default'
            }`}
          >
            <AlertTriangle size={14} className={hasLowStock ? "animate-pulse" : ""} />
            <span className="hidden md:inline">{hasLowStock ? "Low Stock Alert" : "All Stock OK"}</span>
            {hasLowStock && (
              <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                {lowStockItems.length}
              </span>
            )}
          </button>
          
          {dropdownOpen && hasLowStock && (
            <div className="absolute right-0 mt-2 w-72 bg-[#161B22] rounded-lg shadow-xl border border-white/5 overflow-hidden z-30">
              <div className="bg-[#1C2128] px-4 py-2 border-b border-white/5">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#8B949E]">Low Stock Items</h4>
              </div>
              <ul className="max-h-60 overflow-y-auto custom-scrollbar">
                {lowStockItems.map((item, i) => (
                  <li key={i} className="px-4 py-3 border-b border-white/5 hover:bg-white/5">
                    <p className="text-sm font-semibold text-[#E6EDF3]">{item.itemName}</p>
                    <div className="flex justify-between text-xs mt-1 font-mono">
                      <span className="text-red-400 font-semibold">Current: {item.currentStock}</span>
                      <span className="text-[#8B949E]">Min: {item.minimumStockLevel}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Notifications Icon */}
        <button className="p-2 text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#161B22] rounded-full transition-colors">
          <Bell size={18} />
        </button>

        {/* Settings Icon */}
        <button className="p-2 text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#161B22] rounded-full transition-colors">
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
};

export default TopBar;
