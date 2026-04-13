import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Ruler, 
  Tag, 
  Truck, 
  Package, 
  MapPin, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  ArrowLeftRight, 
  BarChart3, 
  Users 
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Unit Entry', path: '/unit-entry', icon: Ruler },
    { name: 'Category Name', path: '/category', icon: Tag },
    { name: 'Supplier Entry', path: '/supplier', icon: Truck },
    { name: 'Item Entries', path: '/items', icon: Package },
    { name: 'Location Entries', path: '/locations', icon: MapPin },
    { name: 'Stock In - GRN', path: '/stock-in', icon: ArrowDownCircle },
    { name: 'Stock Out', path: '/stock-out', icon: ArrowUpCircle },
    { name: 'Stock Transfer', path: '/stock-transfer', icon: ArrowLeftRight },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'User Access', path: '/users', icon: Users },
  ];

  return (
    <aside className="w-[260px] h-screen fixed top-0 left-0 bg-[#1a1a1a] text-white flex flex-col items-center py-6 shadow-xl z-20">
      <div className="mb-8 text-center flex flex-col items-center">
        <h1 className="text-2xl font-bold tracking-wide">InvenTrack</h1>
        <p className="text-xs text-gray-400 mt-1">Inventory System</p>
      </div>
      
      <nav className="w-full flex-1 overflow-y-auto px-4 custom-scrollbar">
        <ul className="space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path || (location.pathname === '/' && link.path === '/dashboard');
            return (
              <li key={link.name}>
                <Link
                  to={link.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-gray-300 hover:bg-[#2a2a2a] hover:text-white'
                  }`}
                >
                  <Icon size={20} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-white transition-colors'} />
                  <span className="font-medium text-sm">{link.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
