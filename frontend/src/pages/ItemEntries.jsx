import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Edit2, Trash2, Search, Loader2, Info, 
  ShieldAlert, Lock, Download, Database
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getUser, hasPermission } from '../utils/auth';

const BASE_URL = import.meta.env.VITE_API_URL || '';

const ItemEntries = () => {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ 
    recordId: 'Auto-generated', 
    itemName: '', 
    category: '', 
    unit: '', 
    minimumStockLevel: '', 
    description: '' 
  });

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // User permissions
  const user = getUser();
  const role = user?.role || 'Viewer';
  const canAdd = hasPermission(role, 'add');
  const canEdit = hasPermission(role, 'edit');
  const canDelete = hasPermission(role, 'delete');

  useEffect(() => { 
    fetchData(); 
    fetchDropdowns(); 
  }, []);

  const fetchData = async () => {
    try { 
      setLoading(true); 
      const res = await axios.get(`${BASE_URL}/api/items`); 
      setData(Array.isArray(res.data) ? res.data : []); 
    } catch { 
      toast.error('Failed to fetch items'); 
    } finally { 
      setLoading(false); 
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [catRes, unitRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/categories`), 
        axios.get(`${BASE_URL}/api/units`)
      ]);
      setCategories(Array.isArray(catRes.data) ? catRes.data : []);
      setUnits(Array.isArray(unitRes.data) ? unitRes.data : []);
    } catch { /* silent */ }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.itemName.trim() || !formData.category || !formData.unit || formData.minimumStockLevel === '') { 
      toast.error('Fill all required fields'); 
      return; 
    }
    try {
      setSaving(true);
      const payload = { 
        itemName: formData.itemName, 
        category: formData.category, 
        unit: formData.unit, 
        minimumStockLevel: Number(formData.minimumStockLevel), 
        description: formData.description 
      };
      if (isEditing) { 
        await axios.put(`${BASE_URL}/api/items/${editId}`, payload); 
        toast.success('Item updated successfully'); 
      } else { 
        await axios.post(`${BASE_URL}/api/items`, payload); 
        toast.success('Item created successfully'); 
      }
      resetForm(); 
      fetchData();
    } catch (error) { 
      toast.error(error.response?.data?.error || 'An error occurred'); 
    } finally { 
      setSaving(false); 
    }
  };

  const editItem = (item) => {
    setIsEditing(true); 
    setEditId(item._id);
    setFormData({ 
      recordId: item.recordId, 
      itemName: item.itemName, 
      category: item.category?._id || item.category || '', 
      unit: item.unit?._id || item.unit || '', 
      minimumStockLevel: item.minimumStockLevel, 
      description: item.description || '' 
    });
  };

  const resetForm = () => { 
    setIsEditing(false); 
    setEditId(null); 
    setFormData({ 
      recordId: 'Auto-generated', 
      itemName: '', 
      category: '', 
      unit: '', 
      minimumStockLevel: '', 
      description: '' 
    }); 
  };

  const confirmDelete = (item) => { 
    setItemToDelete(item); 
    setDeleteModalOpen(true); 
  };

  const handleDelete = async () => {
    try { 
      await axios.delete(`${BASE_URL}/api/items/${itemToDelete._id}`); 
      toast.success('Item deleted successfully'); 
      fetchData(); 
    } catch (error) { 
      toast.error(error.response?.data?.error || 'Failed to delete'); 
    } finally { 
      setDeleteModalOpen(false); 
      setItemToDelete(null); 
      if (isEditing && editId === itemToDelete?._id) resetForm(); 
    }
  };

  const downloadCSV = () => {
    if (!data || !data.length) {
      toast.error("No data to export");
      return;
    }
    const headers = ["ID", "ITEM NAME", "CATEGORY", "UNIT", "MIN STOCK", "CREATED AT"];
    const csvRows = [
      headers.join(','),
      ...data.map(item => [
        `"${item.recordId}"`,
        `"${item.itemName}"`,
        `"${item.category?.categoryName || 'N/A'}"`,
        `"${item.unit?.unitName || 'N/A'}"`,
        `"${item.minimumStockLevel}"`,
        `"${item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A'}"`
      ].join(','))
    ];
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'catalog_items.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV file downloaded");
  };

  const filteredItems = data.filter(item => 
    item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.recordId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination bounds
  const totalRecords = filteredItems.length;
  const totalPages = Math.ceil(totalRecords / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalRecords);
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  const handlePageChange = (direction) => {
    if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const getLastIngestion = () => {
    if (!data || !data.length) return "N/A";
    const dates = data.map(u => u.createdAt ? new Date(u.createdAt).getTime() : 0).filter(d => d > 0);
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

  const showForm = canAdd || canEdit;

  return (
    <div className="space-y-6 text-[#E6EDF3] animate-fade-in pb-10">
      
      {/* Console Header */}
      <section className="flex justify-between items-center bg-[#161B22]/40 p-4 border border-white/5 rounded-xl">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#E6EDF3]">Data Ingestion Console</h2>
          <p className="text-xs font-mono text-[#8B949E] mt-0.5">Item Configuration Interface • [v.2.4.0]</p>
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
        {showForm && (
          <div className="col-span-12 lg:col-span-4 bg-[#161B22] border border-white/5 rounded-xl p-6 skeuo-shadow">
            <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
              <span className="text-[10px] font-mono tracking-widest text-[#8B949E] uppercase font-bold flex items-center gap-1.5">
                <Database size={12} className="text-[#58A6FF]" />
                {isEditing ? 'EDIT ENTRY' : 'NEW ENTRY'}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider mb-1.5 block">
                  Record Identifier
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={formData.recordId}
                    readOnly
                    className="w-full bg-[#1C2128] border border-white/5 rounded-lg py-2 pl-3 pr-10 text-xs font-mono text-[#8B949E] outline-none cursor-not-allowed"
                  />
                  <Lock size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B949E]/50" />
                </div>
                <span className="text-[9px] font-mono text-[#8B949E]/70 mt-1 block">
                  Automatically generated on commit.
                </span>
              </div>

              <div>
                <label className="text-[10px] font-mono text-[#E6EDF3] uppercase tracking-wider mb-1.5 block">
                  Item Name <span className="text-red-400">*</span>
                </label>
                <input 
                  type="text" 
                  value={formData.itemName}
                  onChange={(e) => setFormData({...formData, itemName: e.target.value})}
                  placeholder="E.g. Steel Rods 10mm"
                  required
                  className="w-full bg-[#1C2128] border border-white/5 rounded-lg py-2 px-3 text-sm text-[#E6EDF3] placeholder:text-[#8B949E]/30 focus:ring-1 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono text-[#E6EDF3] uppercase tracking-wider mb-1.5 block">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <select 
                    value={formData.category} 
                    onChange={(e) => setFormData({...formData, category: e.target.value})} 
                    required 
                    className="w-full bg-[#1C2128] border border-white/5 rounded-lg py-2 px-3 text-xs text-[#E6EDF3] focus:ring-1 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all"
                  >
                    <option value="" className="bg-[#1C2128]">Select Category</option>
                    {categories.map(c => <option key={c._id} value={c._id} className="bg-[#1C2128]">{c.categoryName}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-[#E6EDF3] uppercase tracking-wider mb-1.5 block">
                    Unit <span className="text-red-400">*</span>
                  </label>
                  <select 
                    value={formData.unit} 
                    onChange={(e) => setFormData({...formData, unit: e.target.value})} 
                    required 
                    className="w-full bg-[#1C2128] border border-white/5 rounded-lg py-2 px-3 text-xs text-[#E6EDF3] focus:ring-1 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all"
                  >
                    <option value="" className="bg-[#1C2128]">Select Unit</option>
                    {units.map(u => <option key={u._id} value={u._id} className="bg-[#1C2128]">{u.unitName}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-[#E6EDF3] uppercase tracking-wider mb-1.5 block">
                  Minimum Stock Level <span className="text-red-400">*</span>
                </label>
                <input 
                  type="number" 
                  min="0"
                  value={formData.minimumStockLevel}
                  onChange={(e) => setFormData({...formData, minimumStockLevel: e.target.value})}
                  placeholder="E.g. 50"
                  required
                  className="w-full bg-[#1C2128] border border-white/5 rounded-lg py-2 px-3 text-xs font-mono text-[#E6EDF3] placeholder:text-[#8B949E]/30 focus:ring-1 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-[#E6EDF3] uppercase tracking-wider mb-1.5 block">
                  Description
                </label>
                <input 
                  type="text" 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Optional specifications..."
                  className="w-full bg-[#1C2128] border border-white/5 rounded-lg py-2 px-3 text-xs text-[#E6EDF3] placeholder:text-[#8B949E]/30 focus:ring-1 focus:ring-[#2563EB] focus:border-transparent outline-none transition-all"
                />
              </div>

              <div className="bg-[#1C2128] border border-white/5 p-3 rounded-lg flex items-start gap-2.5 text-[10px] text-[#8B949E]">
                <Info size={14} className="text-[#58A6FF] shrink-0 mt-0.5" />
                <span>Ensure minimum safety stock levels are configured accurately to trigger low-stock alerts before warehouse fulfillment bottlenecks occur.</span>
              </div>

              <div className="pt-2">
                {isEditing ? (
                  <div className="flex gap-3">
                    <button 
                      type="submit" 
                      disabled={saving}
                      className="flex-1 bg-[#2563EB] hover:bg-[#2563EB]/85 text-white font-medium py-2.5 rounded-lg transition-all text-xs font-mono uppercase tracking-wider skeuo-shadow flex items-center justify-center gap-1.5"
                    >
                      {saving && <Loader2 size={12} className="animate-spin" />}
                      <span>Update</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={resetForm}
                      className="flex-1 bg-transparent hover:bg-white/5 border border-white/5 text-[#E6EDF3] font-medium py-2.5 rounded-lg transition-all text-xs font-mono uppercase tracking-wider"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="w-full bg-[#2563EB] hover:bg-[#2563EB]/85 text-white font-medium py-2.5 rounded-lg transition-all text-xs font-mono uppercase tracking-wider skeuo-shadow flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {saving && <Loader2 size={12} className="animate-spin" />}
                    <span>Save Item Entry</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Right Column - Data Table Card */}
        <div className={`col-span-12 ${showForm ? 'lg:col-span-8' : 'lg:col-span-12'} bg-[#161B22] border border-white/5 rounded-xl overflow-hidden skeuo-shadow`}>
          <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/2">
            <h3 className="text-sm font-bold text-[#E6EDF3] font-mono uppercase tracking-wider flex items-center gap-2">
              <Database size={14} className="text-[#58A6FF]" />
              Item Registry
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
            ) : paginatedItems.length > 0 ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#1C2128]/50 text-[#8B949E] text-[10px] font-mono uppercase tracking-wider border-b border-white/5">
                    <th className="px-6 py-3.5">ID</th>
                    <th className="px-6 py-3.5">Item Name</th>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5">Unit</th>
                    <th className="px-6 py-3.5">Min Stock</th>
                    {(canEdit || canDelete) && <th className="px-6 py-3.5 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paginatedItems.map((item) => (
                    <tr key={item._id} className="hover:bg-[#2563EB]/5 transition-colors group">
                      <td className="px-6 py-3 text-sm text-[#8B949E] font-mono whitespace-nowrap">{item.recordId}</td>
                      <td className="px-6 py-3 text-sm font-bold text-[#E6EDF3] whitespace-nowrap">{item.itemName}</td>
                      <td className="px-6 py-3 text-xs text-[#8B949E] whitespace-nowrap">{item.category?.categoryName || 'N/A'}</td>
                      <td className="px-6 py-3 text-xs text-[#8B949E] whitespace-nowrap">{item.unit?.unitName || 'N/A'}</td>
                      <td className="px-6 py-3 text-xs text-[#8B949E] font-mono whitespace-nowrap">{item.minimumStockLevel}</td>
                      {(canEdit || canDelete) && (
                        <td className="px-6 py-3 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2.5">
                            {canEdit && (
                              <button 
                                onClick={() => editItem(item)}
                                className="p-1.5 bg-[#2563EB]/10 text-[#58A6FF] rounded hover:bg-[#2563EB]/25 border border-[#2563EB]/20 transition-colors"
                                title="Edit"
                              >
                                <Edit2 size={13} />
                              </button>
                            )}
                            {canDelete && (
                              <button 
                                onClick={() => confirmDelete(item)}
                                className="p-1.5 bg-[#EF4444]/10 text-red-400 rounded hover:bg-[#EF4444]/25 border border-red-500/20 transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center text-[#8B949E] font-mono text-xs">
                {searchTerm ? 'No matching item records found.' : 'Telemetry ledger empty. Configure new catalog inventory items.'}
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
        
        {/* Total Stats */}
        <div className="bg-[#161B22] border border-white/5 rounded-xl p-4 flex items-center gap-4 skeuo-shadow">
          <div className="w-10 h-10 bg-white/2 rounded-lg flex items-center justify-center shrink-0 border border-white/5 text-[#58A6FF]">
            <Database size={18} />
          </div>
          <div>
            <p className="text-[9px] font-mono text-[#8B949E] uppercase tracking-wider">Total Items</p>
            <h4 className="text-xl font-bold tracking-tight text-[#E6EDF3] mt-0.5">
              {loading ? '...' : String(data.length).padStart(2, '0')}
            </h4>
          </div>
        </div>

        {/* Ingestion Time */}
        <div className="bg-[#161B22] border border-white/5 rounded-xl p-4 flex items-center gap-4 skeuo-shadow">
          <div className="w-10 h-10 bg-white/2 rounded-lg flex items-center justify-center shrink-0 border border-white/5 text-[#22C55E]">
            <Database size={18} />
          </div>
          <div>
            <p className="text-[9px] font-mono text-[#8B949E] uppercase tracking-wider">Last Ingestion</p>
            <h4 className="text-xl font-bold tracking-tight text-[#E6EDF3] mt-0.5">
              {loading ? '...' : getLastIngestion()}
            </h4>
          </div>
        </div>

        {/* System Alerts */}
        <div className="bg-[#161B22] border border-white/5 rounded-xl p-4 flex items-center gap-4 skeuo-shadow">
          <div className="w-10 h-10 bg-white/2 rounded-lg flex items-center justify-center shrink-0 border border-white/5 text-[#EF4444]">
            <ShieldAlert size={18} />
          </div>
          <div>
            <p className="text-[9px] font-mono text-[#8B949E] uppercase tracking-wider">System Alerts</p>
            <h4 className="text-xl font-bold tracking-tight text-[#E6EDF3] mt-0.5">
              {loading ? '...' : '00'}
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
              <h3 className="text-lg font-bold text-[#E6EDF3] mb-2 font-mono uppercase tracking-wider">Delete Item Entry</h3>
              <p className="text-sm text-[#8B949E] mb-6">
                Are you sure you want to delete <span className="font-bold text-[#E6EDF3] font-mono">{itemToDelete?.recordId} ({itemToDelete?.itemName})</span>? This action cannot be undone and will fail if the item is linked to existing transactions.
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

export default ItemEntries;
