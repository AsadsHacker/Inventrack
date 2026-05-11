import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Ruler, Tag, Truck, Package, MapPin, 
  ArrowDownCircle, ArrowUpCircle, ArrowLeftRight, BarChart3, Users, LogOut, X 
} from 'lucide-react';

const Sidebar = ({ onLogout, sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Unit Entry', path: '/unit-entry', icon: Ruler },
    { name: 'Category Entry', path: '/category-entry', icon: Tag },
    { name: 'Supplier Entry', path: '/supplier-entry', icon: Truck },
    { name: 'Item Entries', path: '/item-entries', icon: Package },
    { name: 'Location Entries', path: '/location-entries', icon: MapPin },
    { name: 'Stock In - GRN', path: '/stock-in', icon: ArrowDownCircle },
    { name: 'Stock Out', path: '/stock-out', icon: ArrowUpCircle },
    { name: 'Stock Transfer', path: '/stock-transfer', icon: ArrowLeftRight },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'User Access', path: '/user-access', icon: Users },
  ];

  return (
    <aside className={`w-[260px] h-screen fixed top-0 left-0 bg-[#1a1a1a] text-white flex flex-col py-6 shadow-xl z-30 transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
      <div className="mb-8 text-center flex flex-col items-center px-4 relative">
        <button 
          onClick={() => setSidebarOpen(false)}
          className="absolute top-0 right-4 p-1 text-gray-400 hover:text-white lg:hidden"
        >
          <X size={20} />
        </button>
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mb-2 mt-2 lg:mt-0">
          <Package size={22} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-wide">InvenTrack</h1>
        <p className="text-xs text-gray-400 mt-1">Inventory System</p>
      </div>
      
      <nav className="w-full flex-1 overflow-y-auto px-4 custom-scrollbar">
        <ul className="space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path || (location.pathname === '/' && link.path === '/dashboard');
            return (
              <li key={link.name}>
                <Link 
                  to={link.path} 
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-[#2a2a2a] hover:text-white'}`}
                >
                  <Icon size={18} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-white transition-colors'} />
                  <span className="font-medium text-sm">{link.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-4 mt-4">
        <button onClick={onLogout} className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-400 hover:bg-red-600/20 hover:text-red-400 transition-all w-full">
          <LogOut size={18} /><span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
