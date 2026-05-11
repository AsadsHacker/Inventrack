import { useState, useRef, useEffect } from 'react';
import { Bell, AlertTriangle, Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '';

const TopBar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [lowStockItems, setLowStockItems] = useState([]);
  const dropdownRef = useRef(null);

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
      '/dashboard': 'Dashboard', '/': 'Dashboard', '/unit-entry': 'Unit Entry', '/category-entry': 'Category Entry',
      '/supplier-entry': 'Supplier Entry', '/item-entries': 'Item Entries', '/location-entries': 'Location Entries',
      '/stock-in': 'Stock In - GRN', '/stock-out': 'Stock Out', '/stock-transfer': 'Stock Transfer',
      '/reports': 'Reports', '/user-access': 'User Access',
    };
    return titles[location.pathname] || '';
  };

  const user = JSON.parse(localStorage.getItem('user') || '{"username":"Admin"}');

  return (
    <header className="h-[70px] bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 shrink-0">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setSidebarOpen(true)}
          className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg lg:hidden transition-colors"
        >
          <Menu size={24} />
        </button>
        <h2 className="text-xl font-semibold text-[#1a1a1a] truncate max-w-[150px] sm:max-w-none">{getPageTitle()}</h2>
      </div>
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="relative" ref={dropdownRef}>
          <button onClick={() => hasLowStock && setDropdownOpen(!dropdownOpen)} className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-white text-xs sm:text-sm font-medium transition-transform active:scale-95 ${hasLowStock ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 cursor-default'}`}>
            {hasLowStock ? (<><AlertTriangle size={16} className="sm:w-[18px] sm:h-[18px]" /><span className="hidden sm:inline">⚠ Low Stock Alert! ({lowStockItems.length})</span><span className="sm:hidden">{lowStockItems.length}</span></>) : (<><Bell size={16} className="sm:w-[18px] sm:h-[18px]" /><span className="hidden sm:inline">All Stock OK</span></>)}
          </button>
          {dropdownOpen && hasLowStock && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-20">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-100"><h4 className="text-sm font-semibold text-gray-700">Low Stock Items</h4></div>
              <ul className="max-h-60 overflow-y-auto">
                {lowStockItems.map((item, i) => (
                  <li key={i} className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50">
                    <p className="text-sm font-medium text-gray-800">{item.itemName}</p>
                    <div className="flex justify-between text-xs mt-1"><span className="text-red-500 font-semibold">Current: {item.currentStock}</span><span className="text-gray-500">Min: {item.minimumStockLevel}</span></div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 pl-4 sm:pl-6 border-l border-gray-200">
          <div className="text-right hidden sm:block"><p className="text-sm font-semibold text-[#1a1a1a]">{user.username || 'Admin'}</p><p className="text-xs text-gray-500">{user.role || 'Administrator'}</p></div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200 shrink-0">{(user.username || 'A')[0].toUpperCase()}</div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
