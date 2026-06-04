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
    { name: 'Stock In', path: '/stock-in', icon: ArrowDownCircle },
    { name: 'Stock Out', path: '/stock-out', icon: ArrowUpCircle },
    { name: 'Stock Transfer', path: '/stock-transfer', icon: ArrowLeftRight },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'User Access', path: '/user-access', icon: Users },
  ];

  return (
    <aside className={`w-[260px] h-screen fixed top-0 left-0 bg-[#161B22] text-[#E6EDF3] flex flex-col py-6 border-r border-white/5 z-30 transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
      <div className="mb-8 flex flex-col px-6 relative">
        <button 
          onClick={() => setSidebarOpen(false)}
          className="absolute top-0 right-4 p-1 text-[#8B949E] hover:text-white lg:hidden"
        >
          <X size={20} />
        </button>
        <div className="flex flex-col mt-2 lg:mt-0">
          <h1 className="text-2xl font-bold tracking-tight text-[#58A6FF]">InventTrack</h1>
          <p className="text-xs uppercase tracking-widest text-[#8B949E] mt-0.5 font-mono">Industrial Intel</p>
        </div>
      </div>
      
      <nav className="w-full flex-1 overflow-y-auto px-2 custom-scrollbar">
        <ul className="space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path || (location.pathname === '/' && link.path === '/dashboard');
            return (
              <li key={link.name}>
                <Link 
                  to={link.path} 
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 border-l-4 transition-all duration-150 ${
                    isActive 
                      ? 'border-[#2563EB] bg-white/5 text-[#58A6FF] font-semibold' 
                      : 'border-transparent text-[#8B949E] hover:bg-white/5 hover:text-[#E6EDF3]'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-[#58A6FF]' : 'text-[#8B949E]'} />
                  <span className="text-xs font-mono uppercase tracking-wider">{link.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User profile section at the bottom */}
      <div className="p-4 mt-auto border-t border-white/5">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-lg bg-[#1C2128] flex items-center justify-center border border-white/5 overflow-hidden">
            <img 
              alt="User profile" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCF3Kwe3Ol9xoFKTuke4A2q9PRiab3afmTU6-A4rKyLY0yCiCWl4oU0FZxOWFMMz4RyJQKfVpgWeAtwKa16noJTKNoD20L3n_GXjKHEuMkXC-QOVF4RMmkhdWgc4Pvh_h_Yi_azln0fakXYartMV6YwGO45Bfk4uo-6HWTYEtJgj84FtaFTnEKRHOvr5amQrfhDpOrcpkPByhLV3cLxLD2IRc3V5lC04FHVpIdh25aPDD2G05eXkdBaSNnxs0C2SqLAks8z3W6nuv56"
            />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-mono truncate text-[#E6EDF3]">A. Sterling</p>
            <p className="text-[10px] uppercase tracking-widest text-[#8B949E] font-mono">Admin Rail</p>
          </div>
        </div>

        <button onClick={onLogout} className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-[#8B949E] hover:bg-red-600/10 hover:text-red-400 transition-all w-full text-xs font-mono uppercase tracking-wider">
          <LogOut size={18} /><span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
