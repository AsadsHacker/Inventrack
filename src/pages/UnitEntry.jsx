import { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit2, Trash2, Search, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_URL || '';

const UnitEntry = () => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null); // the _id from mongo
  const [formData, setFormData] = useState({
    recordId: 'Auto-generated',
    unitName: ''
  });

  // Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState(null);

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/units`);
      setUnits(res.data);
    } catch (error) {
      toast.error('Failed to fetch units');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Allow only alphabets and spaces for unit name, convert to uppercase
    if (name === 'unitName') {
      const alphaOnly = value.replace(/[^a-zA-Z\s]/g, '').toUpperCase();
      setFormData({ ...formData, [name]: alphaOnly });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.unitName.trim()) {
      toast.error('Unit Name is required');
      return;
    }

    try {
      setSaving(true);
      
      if (isEditing) {
        await axios.put(`${BASE_URL}/api/units/${editId}`, { unitName: formData.unitName });
        toast.success('Unit updated successfully');
      } else {
        await axios.post(`${BASE_URL}/api/units`, { unitName: formData.unitName });
        toast.success('Unit created successfully');
      }
      
      resetForm();
      fetchUnits();
    } catch (error) {
      toast.error(error.response?.data?.error || 'An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  const editUnit = (unit) => {
    setIsEditing(true);
    setEditId(unit._id);
    setFormData({
      recordId: unit.recordId,
      unitName: unit.unitName
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({
      recordId: 'Auto-generated',
      unitName: ''
    });
  };

  const confirmDelete = (unit) => {
    setUnitToDelete(unit);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${BASE_URL}/api/units/${unitToDelete._id}`);
      toast.success('Unit deleted successfully');
      fetchUnits();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete unit');
    } finally {
      setDeleteModalOpen(false);
      setUnitToDelete(null);
      if (isEditing && editId === unitToDelete?._id) {
        resetForm();
      }
    }
  };

  const filteredUnits = units.filter(unit => 
    unit.unitName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.recordId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wide">
            {isEditing ? 'EDIT UNIT' : 'UNIT ENTRY'}
          </h2>
          {isEditing && (
            <button 
              onClick={resetForm}
              className="text-sm text-gray-500 hover:text-gray-700 font-medium"
            >
              Cancel Edit
            </button>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Record ID</label>
              <input 
                type="text" 
                name="recordId"
                value={formData.recordId}
                readOnly
                className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 focus:outline-none cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit Name <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="unitName"
                value={formData.unitName}
                onChange={handleInputChange}
                placeholder="e.g. KG, LITER, PCS"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors uppercase"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2 min-w-[120px] justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : null}
              {saving ? 'Saving...' : (isEditing ? 'Update Unit' : 'Save Unit')}
            </button>
          </div>
        </form>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-8">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="text-lg font-bold text-gray-800">Units List</h3>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search units..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center p-12 text-blue-600">
              <Loader2 size={40} className="animate-spin" />
            </div>
          ) : filteredUnits.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">ID</th>
                  <th className="px-6 py-4 font-semibold">Unit Name</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUnits.map((unit) => (
                  <tr key={unit._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium whitespace-nowrap">{unit.recordId}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-800 whitespace-nowrap">{unit.unitName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => editUnit(unit)}
                          className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => confirmDelete(unit)}
                          className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-gray-500">
              {searchTerm ? 'No units match your search.' : 'No units found. Add a new unit above.'}
            </div>
          )}
        </div>
        
        {/* Pagination placeholder (assuming max 10/page for visual if real server-side is needed later) */}
        {!loading && filteredUnits.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredUnits.length}</span> of <span className="font-medium">{filteredUnits.length}</span> results
            </span>
            <div className="flex gap-1">
              <button disabled className="px-3 py-1 bg-gray-50 border border-gray-200 text-gray-400 rounded disabled:opacity-50">Prev</button>
              <button disabled className="px-3 py-1 bg-gray-50 border border-gray-200 text-gray-400 rounded disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-4 mx-auto">
                <Trash2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Delete Unit</h3>
              <p className="text-center text-gray-500 mb-6">
                Are you sure you want to delete <span className="font-bold text-gray-800">{unitToDelete?.recordId} ({unitToDelete?.unitName})</span>? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setDeleteModalOpen(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
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

export default UnitEntry;
