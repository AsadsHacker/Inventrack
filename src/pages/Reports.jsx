import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Loader2, Download, FileSpreadsheet, Info, Lock, Database, 
  ShieldAlert, BarChart3, Clock, HelpCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_URL || '';

const Reports = () => {
  const [reportType, setReportType] = useState('stock');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ itemId: '', categoryId: '', startDate: '', endDate: '' });
  const [lastQueryTime, setLastQueryTime] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/items`);
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    }
  };

  const generateReport = async (e) => {
    if (e) e.preventDefault();
    if (reportType === 'ledger' && !filters.itemId) {
      toast.error('Item selection is required for Stock Ledger report');
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams({ type: reportType });
      if (filters.itemId) params.append('itemId', filters.itemId);
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      const res = await axios.get(`${BASE_URL}/api/reports?${params.toString()}`);
      setReportData(Array.isArray(res.data) ? res.data : []);
      setLastQueryTime(Date.now());
      toast.success('Report compiled successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to generate report');
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!reportData.length) {
      toast.error('No data to export');
      return;
    }
    const headers = Object.keys(reportData[0]).join(',');
    const rows = reportData.map(r => Object.values(r).map(val => `"${val}"`).join(',')).join('\n');
    const blob = new Blob([headers + '\n' + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}_report_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('CSV exported successfully');
  };

  // Dynamic relative time calculator for query activity
  const getQueryAge = () => {
    if (!lastQueryTime) return "Never";
    const diff = Date.now() - lastQueryTime;
    const diffMins = Math.floor(diff / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const getReportName = (type) => {
    if (type === 'stock') return 'Stock Status Report';
    if (type === 'ledger') return 'Stock Movement Ledger';
    if (type === 'stockin') return 'Inbound Receipts Report';
    return 'Outbound Issues Report';
  };

  const renderTable = () => {
    if (!reportData.length) {
      return (
        <div className="p-12 text-center text-[#8B949E] font-mono text-xs">
          No records compiled. Adjust filter configuration and run query compilation.
        </div>
      );
    }
    const cols = Object.keys(reportData[0]);
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#1C2128]/50 text-[#8B949E] text-[10px] font-mono uppercase tracking-wider border-b border-white/5">
              {cols.map(c => (
                <th key={c} className="px-6 py-3.5">
                  {c.replace(/([A-Z])/g, ' $1').trim()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {reportData.map((row, i) => (
              <tr key={i} className="hover:bg-[#2563EB]/5 transition-colors group">
                {cols.map(c => {
                  let cellContent = row[c];
                  let isDateVal = c.toLowerCase().includes('date');
                  let displayVal = isDateVal && cellContent ? new Date(cellContent).toLocaleDateString() : cellContent;
                  
                  if (c === 'status') {
                    const isLow = String(cellContent).toLowerCase() === 'low';
                    return (
                      <td key={c} className="px-6 py-3 text-xs whitespace-nowrap">
                        <span className={`px-2 py-0.5 text-[9px] font-mono rounded font-bold uppercase tracking-wider ${
                          isLow 
                            ? 'bg-[#EF4444]/10 text-red-400 border border-red-500/20' 
                            : 'bg-[#22C55E]/10 text-green-400 border border-green-500/20'
                        }`}>
                          {cellContent}
                        </span>
                      </td>
                    );
                  }

                  return (
                    <td key={c} className={`px-6 py-3 text-xs whitespace-nowrap ${
                      c === 'qty' || c === 'qtyReceived' || c === 'qtyIssued' || c === 'qtyTransferred' || c === 'currentStock'
                        ? 'font-bold font-mono text-[#E6EDF3]'
                        : 'text-[#8B949E]'
                    }`}>
                      {displayVal === null || displayVal === undefined ? 'N/A' : String(displayVal)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6 text-[#E6EDF3] animate-fade-in pb-10">
      
      {/* Console Header */}
      <section className="flex justify-between items-center bg-[#161B22]/40 p-4 border border-white/5 rounded-xl">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#E6EDF3]">Reports Console</h2>
          <p className="text-xs font-mono text-[#8B949E] mt-0.5">Inventory Intelligence Reporting • [v.2.4.0]</p>
        </div>
        <button 
          onClick={exportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#22C55E]/10 text-green-400 border border-green-500/20 hover:bg-[#22C55E]/25 rounded-lg text-xs font-mono transition-all"
        >
          <FileSpreadsheet size={14} />
          <span>Export CSV</span>
        </button>
      </section>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column - Report configuration Form Card */}
        <div className="col-span-12 lg:col-span-4 bg-[#161B22] border border-white/5 rounded-xl p-6 skeuo-shadow">
          <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
            <span className="text-[10px] font-mono tracking-widest text-[#8B949E] uppercase font-bold flex items-center gap-1.5">
              <Database size={12} className="text-[#58A6FF]" />
              REPORT FILTER CONFIG
            </span>
          </div>

          <form onSubmit={generateReport} className="space-y-4">
            <div>
              <label className="text-[10px] font-mono text-[#E6EDF3] uppercase tracking-wider mb-1.5 block">
                Report Type <span className="text-red-400">*</span>
              </label>
              <select 
                value={reportType}
                onChange={(e) => { setReportType(e.target.value); setReportData([]); }}
                required
                className="w-full bg-[#1C2128] border border-white/5 rounded-lg py-2 px-3 text-xs text-[#E6EDF3] focus:ring-1 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all"
              >
                <option value="stock" className="bg-[#161B22]">Stock Report</option>
                <option value="ledger" className="bg-[#161B22]">Stock Ledger</option>
                <option value="stockin" className="bg-[#161B22]">Stock In Report</option>
                <option value="stockout" className="bg-[#161B22]">Stock Out Report</option>
              </select>
            </div>

            {reportType === 'ledger' && (
              <div>
                <label className="text-[10px] font-mono text-[#E6EDF3] uppercase tracking-wider mb-1.5 block">
                  Target Catalog Item <span className="text-red-400">*</span>
                </label>
                <select 
                  value={filters.itemId}
                  onChange={(e) => setFilters({ ...filters, itemId: e.target.value })}
                  required
                  className="w-full bg-[#1C2128] border border-white/5 rounded-lg py-2 px-3 text-xs text-[#E6EDF3] focus:ring-1 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all"
                >
                  <option value="" className="bg-[#161B22]">Select Item</option>
                  {items.map(i => (
                    <option key={i._id} value={i._id} className="bg-[#161B22]">{i.itemName}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="text-[10px] font-mono text-[#E6EDF3] uppercase tracking-wider mb-1.5 block">
                Boundary Start Date
              </label>
              <input 
                type="date" 
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full bg-[#1C2128] border border-white/5 rounded-lg py-2 px-3 text-xs text-[#E6EDF3] focus:ring-1 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-[#E6EDF3] uppercase tracking-wider mb-1.5 block">
                Boundary End Date
              </label>
              <input 
                type="date" 
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full bg-[#1C2128] border border-white/5 rounded-lg py-2 px-3 text-xs text-[#E6EDF3] focus:ring-1 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="bg-[#1C2128] border border-white/5 p-3 rounded-lg flex items-start gap-2.5 text-[10px] text-[#8B949E]">
              <Info size={14} className="text-[#58A6FF] shrink-0 mt-0.5" />
              <span>Provide optional date range constraints to segment database ingestion ledger entries.</span>
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#2563EB] hover:bg-[#2563EB]/85 text-white font-medium py-2.5 rounded-lg transition-all text-xs font-mono uppercase tracking-wider skeuo-shadow flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {loading ? <Loader2 size={12} className="animate-spin" /> : <BarChart3 size={14} />}
                <span>Generate Report</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column - Data Results Card */}
        <div className="col-span-12 lg:col-span-8 bg-[#161B22] border border-white/5 rounded-xl overflow-hidden skeuo-shadow">
          <div className="p-6 border-b border-white/5 bg-white/2">
            <h3 className="text-sm font-bold text-[#E6EDF3] font-mono uppercase tracking-wider flex items-center gap-2">
              <Database size={14} className="text-[#58A6FF]" />
              {getReportName(reportType)}
            </h3>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center p-12 text-[#2563EB]">
                <Loader2 size={36} className="animate-spin" />
              </div>
            ) : renderTable()}
          </div>
        </div>

      </div>

      {/* Bottom Stats Card Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        
        {/* Rows Count */}
        <div className="bg-[#161B22] border border-white/5 rounded-xl p-4 flex items-center gap-4 skeuo-shadow">
          <div className="w-10 h-10 bg-white/2 rounded-lg flex items-center justify-center shrink-0 border border-white/5 text-[#58A6FF]">
            <Database size={18} />
          </div>
          <div>
            <p className="text-[9px] font-mono text-[#8B949E] uppercase tracking-wider">Report Rows Compiled</p>
            <h4 className="text-xl font-bold tracking-tight text-[#E6EDF3] mt-0.5">
              {loading ? '...' : String(reportData.length).padStart(2, '0')}
            </h4>
          </div>
        </div>

        {/* Last Query Age */}
        <div className="bg-[#161B22] border border-white/5 rounded-xl p-4 flex items-center gap-4 skeuo-shadow">
          <div className="w-10 h-10 bg-white/2 rounded-lg flex items-center justify-center shrink-0 border border-white/5 text-[#22C55E]">
            <Clock size={18} />
          </div>
          <div>
            <p className="text-[9px] font-mono text-[#8B949E] uppercase tracking-wider">Last compiled query</p>
            <h4 className="text-xl font-bold tracking-tight text-[#E6EDF3] mt-0.5">
              {getQueryAge()}
            </h4>
          </div>
        </div>

        {/* System Alert Status */}
        <div className="bg-[#161B22] border border-white/5 rounded-xl p-4 flex items-center gap-4 skeuo-shadow">
          <div className="w-10 h-10 bg-white/2 rounded-lg flex items-center justify-center shrink-0 border border-white/5 text-[#EF4444]">
            <ShieldAlert size={18} />
          </div>
          <div>
            <p className="text-[9px] font-mono text-[#8B949E] uppercase tracking-wider">Ledger Health</p>
            <h4 className="text-xl font-bold tracking-tight text-[#E6EDF3] mt-0.5">
              Consistent
            </h4>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Reports;
