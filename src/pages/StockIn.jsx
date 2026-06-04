import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Trash2, Search, Loader2, Info, Lock, Download, Database, 
  ShieldAlert, Calendar, User, Tag, MapPin, ClipboardList, Hash
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_URL || '';

const StockIn = () => {
  const [data, setData] = useState([]);
  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Form State
  const [formData, setFormData] = useState({
    grnNo: 'Auto-generated',
    grnDate: new Date().toISOString().split('T')[0],
    supplierName: '',
    purchaseOrderRef: '',
    itemName: '',
    qtyReceived: '',
    location: '',
    remarks: ''
  });

  // Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    fetchData();
    fetchDropdowns();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/stockin`);
      setData(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      toast.error('Failed to fetch GRN records');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [itemRes, locRes, supRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/items`),
        axios.get(`${BASE_URL}/api/locations`),
        axios.get(`${BASE_URL}/api/suppliers`)
      ]);
      setItems(Array.isArray(itemRes.data) ? itemRes.data : []);
      setLocations(Array.isArray(locRes.data) ? locRes.data : []);
      setSuppliers(Array.isArray(supRes.data) ? supRes.data : []);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.supplierName || !formData.itemName || !formData.qtyReceived || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      await axios.post(`${BASE_URL}/api/stockin`, {
        ...formData,
        qtyReceived: Number(formData.qtyReceived)
      });
      toast.success('GRN saved successfully');
      setFormData({
        grnNo: 'Auto-generated',
        grnDate: new Date().toISOString().split('T')[0],
        supplierName: '',
        purchaseOrderRef: '',
        itemName: '',
        qtyReceived: '',
        location: '',
        remarks: ''
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'An error occurred while saving the GRN record');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (item) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${BASE_URL}/api/stockin/${itemToDelete._id}`);
      toast.success('GRN record deleted successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete GRN record');
    } finally {
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const downloadCSV = () => {
    if (!data || !data.length) {
      toast.error("No data to export");
      return;
    }
    const headers = ["GRN NO", "DATE", "SUPPLIER", "ITEM", "QTY RECEIVED", "LOCATION", "REMARKS"];
    const csvRows = [
      headers.join(','),
      ...data.map(item => [
        `"${item.grnNo || 'N/A'}"`,
        `"${item.grnDate ? new Date(item.grnDate).toLocaleDateString() : 'N/A'}"`,
        `"${item.supplierName || 'N/A'}"`,
        `"${item.itemName?.itemName || 'N/A'}"`,
        `"${item.qtyReceived || 0}"`,
        `"${item.location?.locationName || 'N/A'}"`,
        `"${item.remarks || ''}"`
      ].join(','))
    ];
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'stock_in_ledger.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV file downloaded");
  };

  const filtered = data.filter(d => 
    d.grnNo?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.itemName?.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.supplierName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination bounds
  const totalRecords = filtered.length;
  const totalPages = Math.ceil(totalRecords / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalRecords);
  const paginatedData = filtered.slice(startIndex, endIndex);

  const handlePageChange = (direction) => {
    if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Stats calculators
  const getLastIngestion = () => {
    if (!data || !data.length) return "N/A";
    const dates = data.map(d => d.createdAt ? new Date(d.createdAt).getTime() : 0).filter(d => d > 0);
    if (!dates.length) return "N/A";
    const latest = Math.max(...dates);
    const diff = Date.now() - latest;
    const diffMins = Math.floor(diff / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const getTotalQtyReceived = () => {
    return data.reduce((sum, item) => sum + (item.qtyReceived || 0), 0);
  };

  return (
    <div className="space-y-6 text-[#E6EDF3] animate-fade-in pb-10">
      
      {/* Console Header */}
      <section className="flex justify-between items-center bg-[#161B22]/40 p-4 border border-white/5 rounded-xl">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#E6EDF3]">Goods Receiving Console</h2>
          <p className="text-xs font-mono text-[#8B949E] mt-0.5">Stock Ingestion (GRN) • [v.2.4.0]</p>
        </div>
        <button 
          onClick={downloadCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1C2128] hover:bg-white/5 border border-white/5 rounded-lg text-xs font-mono text-[#E6EDF3] transition-all"
        >
          <Download size={14} />
          <span>Export CSV</span>
        </button>
      </section>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column - Form Card */}
        <div className="col-span-12 lg:col-span-4 bg-[#161B22] border border-white/5 rounded-xl p-6 skeuo-shadow">
          <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
            <span className="text-[10px] font-mono tracking-widest text-[#8B949E] uppercase font-bold flex items-center gap-1.5">
              <Database size={12} className="text-[#58A6FF]" />
              NEW ENTRY
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider mb-1.5 block">
                GRN Identifier
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  value={formData.grnNo}
                  readOnly
                  className="w-full bg-[#1C2128] border border-white/5 rounded-lg py-2 pl-3 pr-10 text-xs font-mono text-[#8B949E] outline-none cursor-not-allowed"
                />
                <Lock size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B949E]/50" />
              </div>
              <span className="text-[9px] font-mono text-[#8B949E]/70 mt-1 block">
                Auto-assigned sequentially upon submission.
              </span>
            </div>

            <div>
              <label className="text-[10px] font-mono text-[#E6EDF3] uppercase tracking-wider mb-1.5 block">
                GRN Date <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input 
                  type="date" 
                  value={formData.grnDate}
                  onChange={(e) => setFormData({ ...formData, grnDate: e.target.value })}
                  required
                  className="w-full bg-[#1C2128] border border-white/5 rounded-lg py-2 px-3 text-xs text-[#E6EDF3] focus:ring-1 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono text-[#E6EDF3] uppercase tracking-wider mb-1.5 block">
                Supplier Source <span className="text-red-400">*</span>
              </label>
              <select 
                value={formData.supplierName}
                onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                required
                className="w-full bg-[#1C2128] border border-white/5 rounded-lg py-2 px-3 text-xs text-[#E6EDF3] focus:ring-1 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all"
              >
                <option value="" className="bg-[#161B22]">Select Supplier</option>
                <option value="In House Production" className="bg-[#161B22]">In House Production</option>
                {suppliers.map(s => (
                  <option key={s._id} value={s.supplierName} className="bg-[#161B22]">{s.supplierName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono text-[#E6EDF3] uppercase tracking-wider mb-1.5 block">
                PO Reference
              </label>
              <input 
                type="text" 
                value={formData.purchaseOrderRef}
                onChange={(e) => setFormData({ ...formData, purchaseOrderRef: e.target.value })}
                placeholder="E.g. PO-2026-001"
                className="w-full bg-[#1C2128] border border-white/5 rounded-lg py-2 px-3 text-xs text-[#E6EDF3] placeholder:text-[#8B949E]/30 focus:ring-1 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-[#E6EDF3] uppercase tracking-wider mb-1.5 block">
                Target Item <span className="text-red-400">*</span>
              </label>
              <select 
                value={formData.itemName}
                onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                required
                className="w-full bg-[#1C2128] border border-white/5 rounded-lg py-2 px-3 text-xs text-[#E6EDF3] focus:ring-1 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all"
              >
                <option value="" className="bg-[#161B22]">Select Item</option>
                {items.map(i => (
                  <option key={i._id} value={i._id} className="bg-[#161B22]">{i.itemName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono text-[#E6EDF3] uppercase tracking-wider mb-1.5 block">
                Quantity Received <span className="text-red-400">*</span>
              </label>
              <input 
                type="number" 
                min="1"
                value={formData.qtyReceived}
                onChange={(e) => setFormData({ ...formData, qtyReceived: e.target.value })}
                required
                placeholder="Units received count"
                className="w-full bg-[#1C2128] border border-white/5 rounded-lg py-2 px-3 text-xs text-[#E6EDF3] placeholder:text-[#8B949E]/30 focus:ring-1 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-[#E6EDF3] uppercase tracking-wider mb-1.5 block">
                Warehouse Location <span className="text-red-400">*</span>
              </label>
              <select 
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                className="w-full bg-[#1C2128] border border-white/5 rounded-lg py-2 px-3 text-xs text-[#E6EDF3] focus:ring-1 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all"
              >
                <option value="" className="bg-[#161B22]">Select Location</option>
                {locations.map(l => (
                  <option key={l._id} value={l._id} className="bg-[#161B22]">{l.locationName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono text-[#E6EDF3] uppercase tracking-wider mb-1.5 block">
                Operational Remarks
              </label>
              <input 
                type="text" 
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="Optional notes"
                className="w-full bg-[#1C2128] border border-white/5 rounded-lg py-2 px-3 text-xs text-[#E6EDF3] placeholder:text-[#8B949E]/30 focus:ring-1 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="bg-[#1C2128] border border-white/5 p-3 rounded-lg flex items-start gap-2.5 text-[10px] text-[#8B949E]">
              <Info size={14} className="text-[#58A6FF] shrink-0 mt-0.5" />
              <span>Submitting a GRN directly updates inventory balances at the selected warehouse location.</span>
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={saving}
                className="w-full bg-[#2563EB] hover:bg-[#2563EB]/85 text-white font-medium py-2.5 rounded-lg transition-all text-xs font-mono uppercase tracking-wider skeuo-shadow flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {saving && <Loader2 size={12} className="animate-spin" />}
                <span>Save GRN Entry</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column - Data Table Card */}
        <div className="col-span-12 lg:col-span-8 bg-[#161B22] border border-white/5 rounded-xl overflow-hidden skeuo-shadow">
          <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/2">
            <h3 className="text-sm font-bold text-[#E6EDF3] font-mono uppercase tracking-wider flex items-center gap-2">
              <Database size={14} className="text-[#58A6FF]" />
              Goods Receipt Registry
            </h3>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Filter registry..." 
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="bg-[#1C2128] border border-white/5 rounded-full py-1.5 pl-8 pr-4 text-xs font-mono text-[#E6EDF3] focus:ring-1 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all placeholder:text-[#8B949E]/40"
              />
              <Search className="absolute left-2.5 top-2 text-[#8B949E]" size={14} />
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center p-12 text-[#2563EB]">
                <Loader2 size={36} className="animate-spin" />
              </div>
            ) : paginatedData.length > 0 ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#1C2128]/50 text-[#8B949E] text-[10px] font-mono uppercase tracking-wider border-b border-white/5">
                    <th className="px-6 py-3.5">GRN No</th>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5">Supplier</th>
                    <th className="px-6 py-3.5">Item</th>
                    <th className="px-6 py-3.5">Qty</th>
                    <th className="px-6 py-3.5">Location</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paginatedData.map((item) => (
                    <tr key={item._id} className="hover:bg-[#2563EB]/5 transition-colors group">
                      <td className="px-6 py-3 text-xs font-bold text-[#58A6FF] font-mono whitespace-nowrap">{item.grnNo}</td>
                      <td className="px-6 py-3 text-xs text-[#E6EDF3] font-mono whitespace-nowrap">
                        {item.grnDate ? new Date(item.grnDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-3 text-xs text-[#E6EDF3] whitespace-nowrap">{item.supplierName}</td>
                      <td className="px-6 py-3 text-xs font-bold text-[#E6EDF3] whitespace-nowrap">{item.itemName?.itemName || 'N/A'}</td>
                      <td className="px-6 py-3 text-xs font-bold text-[#22C55E] font-mono whitespace-nowrap">+{item.qtyReceived}</td>
                      <td className="px-6 py-3 text-xs text-[#8B949E] whitespace-nowrap">{item.location?.locationName || 'N/A'}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end">
                          <button 
                            onClick={() => confirmDelete(item)}
                            className="p-1.5 bg-[#EF4444]/10 text-red-400 rounded hover:bg-[#EF4444]/25 border border-red-500/20 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center text-[#8B949E] font-mono text-xs">
                {searchTerm ? 'No matching receipt entries found.' : 'No goods received logs. Capture new stock in entries.'}
              </div>
            )}
          </div>

          {!loading && totalRecords > 0 && (
            <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between bg-[#1C2128]/35">
              <span className="text-xs font-mono text-[#8B949E]">
                Showing <span className="font-semibold text-[#E6EDF3]">{startIndex + 1}</span> to <span className="font-semibold text-[#E6EDF3]">{endIndex}</span> of <span className="font-semibold text-[#E6EDF3]">{totalRecords}</span> records
              </span>
              <div className="flex gap-1">
                <button 
                  onClick={() => handlePageChange('prev')}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-xs font-mono border border-white/5 rounded transition-all bg-[#1C2128] text-[#E6EDF3] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5"
                >
                  Prev
                </button>
                <button 
                  onClick={() => handlePageChange('next')}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-xs font-mono border border-white/5 rounded transition-all bg-[#1C2128] text-[#E6EDF3] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Bottom Stats Card Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        
        {/* Total Receipts */}
        <div className="bg-[#161B22] border border-white/5 rounded-xl p-4 flex items-center gap-4 skeuo-shadow">
          <div className="w-10 h-10 bg-white/2 rounded-lg flex items-center justify-center shrink-0 border border-white/5 text-[#58A6FF]">
            <Hash size={18} />
          </div>
          <div>
            <p className="text-[9px] font-mono text-[#8B949E] uppercase tracking-wider">Total GRNs</p>
            <h4 className="text-xl font-bold tracking-tight text-[#E6EDF3] mt-0.5">
              {loading ? '...' : String(data.length).padStart(2, '0')}
            </h4>
          </div>
        </div>

        {/* Aggregate Qty */}
        <div className="bg-[#161B22] border border-white/5 rounded-xl p-4 flex items-center gap-4 skeuo-shadow">
          <div className="w-10 h-10 bg-white/2 rounded-lg flex items-center justify-center shrink-0 border border-white/5 text-[#22C55E]">
            <Database size={18} />
          </div>
          <div>
            <p className="text-[9px] font-mono text-[#8B949E] uppercase tracking-wider">Total Received</p>
            <h4 className="text-xl font-bold tracking-tight text-[#E6EDF3] mt-0.5">
              {loading ? '...' : String(getTotalQtyReceived()).padStart(2, '0')}
            </h4>
          </div>
        </div>

        {/* Ingestion Time */}
        <div className="bg-[#161B22] border border-white/5 rounded-xl p-4 flex items-center gap-4 skeuo-shadow">
          <div className="w-10 h-10 bg-white/2 rounded-lg flex items-center justify-center shrink-0 border border-white/5 text-[#EF4444]">
            <ShieldAlert size={18} />
          </div>
          <div>
            <p className="text-[9px] font-mono text-[#8B949E] uppercase tracking-wider">Last Activity</p>
            <h4 className="text-xl font-bold tracking-tight text-[#E6EDF3] mt-0.5">
              {loading ? '...' : getLastIngestion()}
            </h4>
          </div>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#161B22] border border-white/5 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-4 mx-auto border border-red-500/20">
                <Trash2 size={24} />
              </div>
              <h3 className="text-lg font-bold text-[#E6EDF3] mb-2 font-mono uppercase tracking-wider">Delete GRN Record</h3>
              <p className="text-sm text-[#8B949E] mb-6">
                Are you sure you want to delete <span className="font-bold text-[#E6EDF3] font-mono">{itemToDelete?.grnNo}</span>? This action cannot be undone and will revert the stock levels for the items.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setDeleteModalOpen(false)}
                  className="flex-1 py-2.5 bg-transparent hover:bg-white/5 border border-white/5 text-[#E6EDF3] font-medium rounded-lg transition-colors font-mono text-xs uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors font-mono text-xs uppercase tracking-wider"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StockIn;
