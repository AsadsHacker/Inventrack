import { useState, useRef, useEffect } from 'react';
import { Bell, AlertTriangle } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const TopBar = () => {
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Mocking low stock items for now (0 means All OK, > 0 means Alert)
  const lowStockItems = [
    // { id: 1, name: "Cement 50kg", current: 5, min: 10 },
    // { id: 2, name: "Steel Rods", current: 12, min: 20 }
  ];

  const hasLowStock = lowStockItems.length > 0;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard':
      case '/': return 'Dashboard';
      case '/unit-entry': return 'Unit Entry';
      case '/category': return 'Category Name';
      case '/supplier': return 'Supplier Entry';
      case '/items': return 'Item Entries';
      case '/locations': return 'Location Entries';
      case '/stock-in': return 'Stock In - GRN';
      case '/stock-out': return 'Stock Out';
      case '/stock-transfer': return 'Stock Transfer';
      case '/reports': return 'Reports';
      case '/users': return 'User Access';
      default: return '';
    }
  };

  return (
    <header className="h-[70px] bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
      <div>
        <h2 className="text-xl font-semibold text-[#1a1a1a]">{getPageTitle()}</h2>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => hasLowStock && setDropdownOpen(!dropdownOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-medium transition-transform active:scale-95 ${
              hasLowStock ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 cursor-default'
            }`}
          >
            {hasLowStock ? (
              <>
                <AlertTriangle size={18} />
                <span>⚠ Low Stock Alert! ({lowStockItems.length})</span>
              </>
            ) : (
              <>
                <Bell size={18} />
                <span>All Stock OK</span>
              </>
            )}
          </button>

          {/* Dropdown */}
          {dropdownOpen && hasLowStock && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-20">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                <h4 className="text-sm font-semibold text-gray-700">Low Stock Items</h4>
              </div>
              <ul className="max-h-60 overflow-y-auto">
                {lowStockItems.map((item) => (
                  <li key={item.id} className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <p className="text-sm font-medium text-gray-800">{item.name}</p>
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-red-500 font-semibold">Current: {item.current}</span>
                      <span className="text-gray-500">Min: {item.min}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                <button className="text-blue-600 text-xs font-semibold w-full text-center hover:underline">
                  View All Alerts
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
          <div className="text-right">
            <p className="text-sm font-semibold text-[#1a1a1a]">Admin User</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
            A
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
