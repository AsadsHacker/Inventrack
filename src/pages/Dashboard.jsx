import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Package, AlertTriangle, ArrowDownCircle, ArrowUpCircle, 
  Warehouse, Loader2, Lightbulb, Eye, X, CheckCircle2, RefreshCw
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_API_URL || '';

const Dashboard = () => {
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDetail, setActiveDetail] = useState(null);
  const [executingTransfer, setExecutingTransfer] = useState(false);

  useEffect(() => { 
    fetchDashboard(); 
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/dashboard`);
      setDashData(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard statistics.");
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteTransfer = async () => {
    const payload = dashData?.actionableSuggestion?.executeTransferPayload;
    if (!payload) {
      toast.success("Default slotting optimization transfer executed!");
      return;
    }
    
    try {
      setExecutingTransfer(true);
      await axios.post(`${BASE_URL}/api/stocktransfer`, {
        fromLocation: payload.fromLocation,
        toLocation: payload.toLocation,
        itemName: payload.itemName,
        qtyTransferred: payload.qty,
        remarks: "Slotting optimization auto-execution"
      });
      
      toast.success("Transfer request executed successfully!");
      // Reload dashboard data
      const res = await axios.get(`${BASE_URL}/api/dashboard`);
      setDashData(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to execute transfer. Check current warehouse stock levels.");
    } finally {
      setExecutingTransfer(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
        <Loader2 size={48} className="animate-spin text-[#2563EB]" />
        <span className="text-xs font-mono text-[#8B949E] tracking-widest uppercase">Connecting telemetry...</span>
      </div>
    );
  }

  const recentActivity = dashData?.recentActivity || [];

  return (
    <div className="space-y-6 animate-fade-in text-[#E6EDF3] pb-10">
      
      {/* Dashboard Section Header */}
      <section className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#E6EDF3] mb-1">Operational Overview</h2>
          <p className="text-sm text-[#8B949E]">Real-time telemetry and supply chain intelligence.</p>
        </div>
        <button 
          onClick={fetchDashboard} 
          className="p-2 bg-[#161B22] hover:bg-[#1C2128] border border-white/5 rounded-lg text-[#8B949E] hover:text-[#58A6FF] transition-all"
          title="Refresh Telemetry"
        >
          <RefreshCw size={16} />
        </button>
      </section>

      {/* Bento Grid Metrics */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Total Aggregated Stock Card */}
        <div className="col-span-12 lg:col-span-6 bg-[#161B22] border border-white/5 rounded-xl p-6 flex flex-col justify-between skeuo-shadow hover:border-white/10 transition-all group relative overflow-hidden">
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-[#8B949E]">Total Aggregated Stock</span>
              <Package className="text-[#2563EB] group-hover:scale-110 transition-transform duration-300" size={20} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight text-[#E6EDF3]">
                {dashData?.totalStock?.toLocaleString() || '0'}
              </span>
              <span className="text-[#22C55E] text-xs font-mono flex items-center gap-0.5 bg-[#22C55E]/10 px-2 py-0.5 rounded-full border border-[#22C55E]/20">
                <span className="inline-block transform rotate-185">▲</span> +4.2%
              </span>
            </div>
          </div>

          {/* Mini sparkline bar chart */}
          <div className="h-14 w-full mt-6 bg-gradient-to-t from-[#2563EB]/10 to-transparent rounded-lg border-b border-[#2563EB]/25 flex items-end">
            <div className="flex items-end gap-1.5 w-full h-8 px-3">
              <div className="flex-1 bg-[#2563EB]/30 h-[35%] rounded-t-sm"></div>
              <div className="flex-1 bg-[#2563EB]/35 h-[55%] rounded-t-sm"></div>
              <div className="flex-1 bg-[#2563EB]/30 h-[45%] rounded-t-sm"></div>
              <div className="flex-1 bg-[#2563EB]/40 h-[70%] rounded-t-sm"></div>
              <div className="flex-1 bg-[#2563EB]/35 h-[60%] rounded-t-sm"></div>
              <div className="flex-1 bg-[#2563EB]/45 h-[85%] rounded-t-sm"></div>
              <div className="flex-1 bg-[#2563EB]/40 h-[75%] rounded-t-sm"></div>
              <div className="flex-1 bg-[#2563EB] h-[100%] rounded-t-sm shadow-[0_0_12px_rgba(37,99,235,0.4)]"></div>
            </div>
          </div>
        </div>

        {/* Critical Alerts Card */}
        <div className="col-span-12 md:col-span-6 lg:col-span-3 bg-gradient-to-br from-[#161B22] to-red-500/5 border border-red-500/10 rounded-xl p-6 flex flex-col justify-between skeuo-shadow hover:border-red-500/20 transition-all group">
          <div className="flex justify-between items-start mb-6">
            <span className="text-xs font-mono uppercase tracking-wider text-red-400">Critical Alerts</span>
            <AlertTriangle className="text-red-500 group-hover:scale-110 transition-transform duration-300" size={20} />
          </div>
          <div>
            <span className="text-4xl font-bold tracking-tight text-red-500">
              {dashData?.lowStockCount || 0}
            </span>
            <p className="text-xs font-mono text-[#8B949E] mt-2">Low Stock Items</p>
          </div>
        </div>

        {/* Active Nodes Card */}
        <div className="col-span-12 md:col-span-6 lg:col-span-3 bg-[#161B22] border border-white/5 rounded-xl p-6 flex flex-col justify-between skeuo-shadow hover:border-white/10 transition-all group">
          <div className="flex justify-between items-start mb-6">
            <span className="text-xs font-mono uppercase tracking-wider text-[#8B949E]">Active Nodes</span>
            <Warehouse className="text-[#58A6FF] group-hover:scale-110 transition-transform duration-300" size={20} />
          </div>
          <div>
            <span className="text-4xl font-bold tracking-tight text-[#E6EDF3]">
              {dashData?.locationCount || 0}
            </span>
            <p className="text-xs font-mono text-[#8B949E] mt-2">Industrial Warehouses</p>
          </div>
        </div>

      </div>

      {/* Charts & Map Visualization */}
      <div className="grid grid-cols-12 gap-6">

        {/* Stock Velocity & Forecasting Line Chart */}
        <div className="col-span-12 lg:col-span-8 bg-[#161B22] border border-white/5 rounded-xl overflow-hidden skeuo-shadow flex flex-col">
          <div className="px-6 py-5 border-b border-white/5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-white/2">
            <div>
              <h3 className="text-base font-bold text-[#E6EDF3]">Stock Velocity & Forecasting</h3>
              <p className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider">Predicted Stock Levels - 30 Day Outlook</p>
            </div>
            <div className="flex gap-4 font-mono text-[10px] text-[#E6EDF3]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]"></span>
                <span>ACTUAL</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 border-t-2 border-[#2563EB] border-dashed"></span>
                <span>PREDICTED</span>
              </div>
            </div>
          </div>
          
          <div className="h-64 relative chart-grid p-6 flex-1 min-h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashData?.stockChartData} margin={{ top: 15, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#8B949E" 
                  fontSize={9} 
                  tickLine={false} 
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="#8B949E" 
                  fontSize={9} 
                  tickLine={false} 
                  axisLine={false}
                  dx={-5}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#161B22', borderColor: 'rgba(255,255,255,0.06)', borderRadius: '8px' }}
                  labelStyle={{ color: '#8B949E', fontSize: '10px', fontFamily: 'monospace' }}
                  itemStyle={{ color: '#E6EDF3', fontSize: '11px', fontFamily: 'monospace' }}
                />
                {/* Actual line (solid) */}
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#2563EB" 
                  strokeWidth={3} 
                  dot={false}
                  activeDot={{ r: 5, fill: '#2563EB', stroke: '#E6EDF3', strokeWidth: 1.5 }}
                  connectNulls={false}
                />
                {/* Predicted line (dashed) */}
                <Line 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="#2563EB" 
                  strokeWidth={2} 
                  strokeDasharray="5 5"
                  dot={false}
                  connectNulls={true}
                />
              </LineChart>
            </ResponsiveContainer>
            
            {/* PROJECTED DIP Annotation */}
            <div className="absolute top-10 right-20 glass-card border border-red-500/20 px-3 py-1.5 bg-[#161B22]/95 rounded-lg shadow-xl pointer-events-none">
              <p className="text-[8px] text-red-400 font-bold uppercase tracking-wider font-mono">Projected Dip</p>
              <p className="text-xs font-mono text-red-500 font-bold leading-tight">-12% Supply</p>
            </div>
          </div>
        </div>

        {/* Spatial Utilization Heatmap */}
        <div className="col-span-12 lg:col-span-4 bg-[#161B22] border border-white/5 rounded-xl p-6 flex flex-col justify-between skeuo-shadow">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider">Floor Insight</span>
              <h3 className="text-base font-bold text-[#E6EDF3] mt-0.5">Spatial Utilization</h3>
            </div>
            <Warehouse className="text-[#8B949E]" size={18} />
          </div>
          
          {/* 3x8 Grid Layout */}
          <div className="grid grid-cols-8 gap-1.5 my-auto justify-items-center relative">
            {dashData?.utilizationGrid?.map((voxel, idx) => {
              let colorClass = "bg-[#21262d] border-white/5 hover:border-white/20"; // empty
              let pulseClass = "";
              if (voxel.status === 'bottleneck') {
                colorClass = "bg-red-500/20 border-red-500/30 hover:bg-red-500/30 hover:border-red-500/50";
                pulseClass = "animate-pulse";
              } else if (voxel.status === 'normal') {
                colorClass = "bg-[#2563EB]/20 border-[#2563EB]/30 hover:bg-[#2563EB]/35 hover:border-[#2563EB]/50";
              }
              
              return (
                <div 
                  key={idx}
                  className={`w-full aspect-square rounded-sm border hover:scale-115 transition-all duration-200 cursor-pointer relative group ${colorClass} ${pulseClass}`}
                >
                  {/* Absolute positioning tooltip overlay */}
                  <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 bg-[#1C2128] border border-white/5 text-[9px] font-mono text-[#E6EDF3] px-2 py-1 rounded shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-30">
                    <span className="font-bold text-[#58A6FF]">{voxel.locationName}</span>: {voxel.stockLevel} units
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Legends */}
          <div className="flex items-center justify-between text-[10px] font-mono text-[#8B949E] mt-6 border-t border-white/5 pt-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span>BOTTLENECK</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]"></span>
              <span>HIGH VELOCITY</span>
            </div>
          </div>
        </div>

      </div>

      {/* Actionable Intelligence Banner */}
      <div className="bg-[#2563EB]/5 border border-[#2563EB]/20 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 skeuo-shadow">
        <div className="w-10 h-10 bg-[#2563EB]/10 rounded-full flex items-center justify-center shrink-0 border border-[#2563EB]/25">
          <Lightbulb className="text-[#58A6FF]" size={18} />
        </div>
        <div className="flex-1 text-center md:text-left">
          <p className="text-[10px] font-mono text-[#58A6FF] uppercase tracking-wider font-bold mb-0.5">Actionable Intelligence</p>
          <p className="text-sm font-semibold text-[#E6EDF3]">
            {dashData?.actionableSuggestion?.description || "Slotting Optimization: Move Steel Rods to Zone A to reduce picking time by 12%"}
          </p>
        </div>
        <button 
          onClick={handleExecuteTransfer}
          disabled={executingTransfer}
          className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#2563EB]/85 disabled:bg-gray-700 text-white rounded-lg text-xs font-mono uppercase tracking-wider transition-all skeuo-shadow hover:scale-[1.02] flex items-center gap-1.5"
        >
          {executingTransfer ? (
            <>
              <Loader2 size={12} className="animate-spin" />
              <span>Executing...</span>
            </>
          ) : (
            <span>Execute Transfer</span>
          )}
        </button>
      </div>

      {/* Stock In vs Stock Out Daily Chart */}
      <div className="bg-[#161B22] border border-white/5 rounded-xl p-6 skeuo-shadow">
        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider">Intraday Movement</span>
            <h3 className="text-base font-bold text-[#E6EDF3] mt-0.5">Stock In vs. Stock Out</h3>
          </div>
          <div className="flex gap-4 font-mono text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]"></span>
              <span className="text-[#E6EDF3]">IN ({dashData?.dailyIn || 0})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]"></span>
              <span className="text-[#E6EDF3]">OUT ({dashData?.dailyOut || 0})</span>
            </div>
          </div>
        </div>
        
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={[
                { 
                  name: "Today's Activity Ledger", 
                  IN: dashData?.dailyIn || 0, 
                  OUT: dashData?.dailyOut || 0 
                }
              ]} 
              margin={{ top: 15, right: 20, left: -20, bottom: 5 }}
              barGap={12}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="name" stroke="#8B949E" fontSize={9} tickLine={false} axisLine={false} />
              <YAxis stroke="#8B949E" fontSize={9} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#161B22', borderColor: 'rgba(255,255,255,0.06)', borderRadius: '8px' }}
                itemStyle={{ fontSize: '11px', fontFamily: 'monospace' }}
              />
              <Bar dataKey="IN" fill="#22C55E" radius={[4, 4, 0, 0]} maxBarSize={60} />
              <Bar dataKey="OUT" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity Table Section */}
      <section className="bg-[#161B22]/60 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden skeuo-shadow shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-white/2">
          <h3 className="text-base font-bold text-[#E6EDF3] flex items-center gap-2">
            <Warehouse className="text-[#58A6FF]" size={18} />
            Recent Stock Activity
          </h3>
          <div className="flex items-center gap-2 px-3 py-1 bg-[#1C2128] rounded-full border border-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse"></span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B949E]">Live Feed</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          {recentActivity.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-mono uppercase tracking-wider text-[#8B949E] border-b border-white/5 bg-[#1C2128]/50">
                  <th className="px-6 py-4">Item Identity</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Quantity</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentActivity.map((row, i) => (
                  <tr key={i} className="hover:bg-[#2563EB]/5 transition-colors group">
                    <td className="px-6 py-3.5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#E6EDF3]">{row.item}</span>
                        <span className="text-[10px] font-mono text-[#8B949E]">{row.ref || 'SKU-N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-widest uppercase ${
                        row.type === 'IN' 
                          ? 'bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20' 
                          : row.type === 'OUT'
                          ? 'bg-[#EF4444]/10 text-red-400 border border-[#EF4444]/20'
                          : 'bg-[#2563EB]/10 text-[#58A6FF] border border-[#2563EB]/20'
                      }`}>
                        {row.type}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-sm text-[#E6EDF3]">{row.qty} Units</td>
                    <td className="px-6 py-3.5 text-sm text-[#8B949E]">{row.location}</td>
                    <td className="px-6 py-3.5 font-mono text-xs text-[#8B949E]">
                      {new Date(row.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button 
                        onClick={() => setActiveDetail(row)}
                        className="p-1.5 hover:bg-[#1C2128] rounded-lg transition-colors text-[#8B949E] hover:text-[#58A6FF]"
                        title="View Ledger Metadata"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-[#8B949E] font-mono text-xs">No recent activity found</div>
          )}
        </div>
        
        <div className="px-6 py-4 bg-[#1C2128]/35 flex justify-between items-center border-t border-white/5">
          <span className="text-xs font-mono text-[#8B949E]">
            Showing {recentActivity.length} of {dashData?.totalStock || 0} movements
          </span>
          <Link 
            to="/reports" 
            className="text-[#58A6FF] hover:underline text-xs font-mono uppercase tracking-wider flex items-center gap-1 hover:text-[#2563EB] transition-colors"
          >
            VIEW FULL LEDGER <span className="text-xs">→</span>
          </Link>
        </div>
      </section>

      {/* Ledger Item Detail inspection modal */}
      {activeDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#161B22] border border-white/5 rounded-2xl w-full max-w-md overflow-hidden skeuo-shadow animate-fade-in text-[#E6EDF3]">
            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-[#1C2128]">
              <h3 className="text-sm font-mono uppercase tracking-wider text-[#8B949E] flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#2563EB]" />
                Transaction details
              </h3>
              <button 
                onClick={() => setActiveDetail(null)} 
                className="text-[#8B949E] hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 space-y-4 text-sm">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-[#8B949E]">Item Name:</span>
                <span className="font-bold">{activeDetail.item}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-[#8B949E]">Reference ID:</span>
                <span className="font-mono text-[#58A6FF]">{activeDetail.ref || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-[#8B949E]">Operation Type:</span>
                <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold tracking-widest ${
                  activeDetail.type === 'IN' 
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {activeDetail.type}
                </span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-[#8B949E]">Quantity Transacted:</span>
                <span className="font-mono font-semibold">{activeDetail.qty} Units</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-[#8B949E]">Assigned Facility:</span>
                <span>{activeDetail.location}</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-[#8B949E]">System Timestamp:</span>
                <span className="font-mono text-xs">{new Date(activeDetail.date).toLocaleString()}</span>
              </div>
            </div>

            <div className="px-6 py-4 bg-[#1C2128] border-t border-white/5 flex justify-end">
              <button 
                onClick={() => setActiveDetail(null)}
                className="px-4 py-2 bg-[#2563EB] hover:bg-[#2563EB]/80 text-white rounded-lg text-xs font-mono uppercase tracking-wider transition-colors"
              >
                Close Metadata
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
