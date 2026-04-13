import { Package, AlertTriangle, ArrowDownCircle, ArrowUpCircle, Warehouse } from 'lucide-react';

const Dashboard = () => {
  // Mock Data
  const stats = [
    { 
      title: "Total Stock", 
      value: "14,520", 
      icon: Package, 
      color: "blue" 
    },
    { 
      title: "Low Stock Items", 
      value: "0", 
      icon: AlertTriangle, 
      color: "green" // green when 0, normally red if > 0
    },
    { 
      title: "Daily Stock", 
      value: "In: 45 | Out: 12", 
      inOut: { in: 45, out: 12 },
      icon: ArrowDownCircle, 
      color: "purple" 
    },
    { 
      title: "Warehouses", 
      value: "3", 
      icon: Warehouse, 
      color: "blue" 
    }
  ];

  const recentActivity = [
    { id: 'TRX-101', date: '2023-11-20', item: 'Cement 50kg', type: 'IN', qty: 200, location: 'Main Warehouse', ref: 'PO-2023-45' },
    { id: 'TRX-102', date: '2023-11-20', item: 'Steel Rods 10mm', type: 'OUT', qty: 50, location: 'Site A', ref: 'REQ-012' },
    { id: 'TRX-103', date: '2023-11-19', item: 'Paint White 20L', type: 'IN', qty: 30, location: 'Warehouse 2', ref: 'PO-2023-46' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="glass-card p-6 flex flex-col justify-between h-36 border border-white/50 shadow-sm relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 text-blue-50 opacity-50 group-hover:scale-110 transition-transform duration-500">
                 <Icon size={120} />
              </div>
              <div className="flex justify-between items-start relative z-10">
                <h3 className="text-gray-600 font-medium">{stat.title}</h3>
                <div className={`p-2 rounded-lg bg-${stat.color}-50 text-${stat.color}-600`}>
                  <Icon size={20} />
                </div>
              </div>
              <div className="relative z-10">
                {stat.inOut ? (
                  <div className="flex gap-4">
                    <span className="text-green-600 font-bold text-2xl">In: {stat.inOut.in}</span>
                    <span className="text-red-500 font-bold text-2xl">Out: {stat.inOut.out}</span>
                  </div>
                ) : (
                  <h2 className="text-3xl font-bold text-gray-800">{stat.value}</h2>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">Recent Stock Activity</h3>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
            View All
          </button>
        </div>
        
        <div className="overflow-x-auto">
          {recentActivity.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Item Name</th>
                  <th className="px-6 py-4 font-semibold">Type</th>
                  <th className="px-6 py-4 font-semibold">Quantity</th>
                  <th className="px-6 py-4 font-semibold">Location</th>
                  <th className="px-6 py-4 font-semibold">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentActivity.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{row.date}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800 whitespace-nowrap">{row.item}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        row.type === 'IN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {row.type === 'IN' ? <ArrowDownCircle size={12}/> : <ArrowUpCircle size={12}/>}
                        {row.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-700 whitespace-nowrap">{row.qty}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{row.location}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{row.ref}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-gray-500">
              No recent activity found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
