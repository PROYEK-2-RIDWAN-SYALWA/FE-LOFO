import { useState, useEffect } from 'react';
import { fetchCategories, createKategori, updateKategori, deleteKategori } from '../../services/api';
import { 
  Plus, Pencil, Trash2, Loader2, Search, Tag, X, CheckCircle, AlertTriangle
} from 'lucide-react';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ id: null, nama_kategori: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (error) {
      console.error('Gagal load kategori:', error);
    } finally {
      setLoading(false);
    }
  };

  // Open modal for add/edit
  const openModal = (category = null) => {
    if (category) {
      setEditMode(true);
      setFormData({ id: category.id_kategori, nama_kategori: category.nama_kategori });
    } else {
      setEditMode(false);
      setFormData({ id: null, nama_kategori: '' });
    }
    setIsModalOpen(true);
  };

  // Handle submit (create/update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama_kategori.trim()) return;

    setSubmitting(true);
    try {
      if (editMode) {
        await updateKategori(formData.id, formData.nama_kategori);
        setCategories(categories.map(c => 
          c.id_kategori === formData.id ? { ...c, nama_kategori: formData.nama_kategori } : c
        ));
      } else {
        const result = await createKategori(formData.nama_kategori);
        setCategories([...categories, result.data]);
      }
      setIsModalOpen(false);
    } catch (error) {
      alert(error.message || 'Gagal menyimpan');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (category) => {
    if (!confirm(`Hapus kategori "${category.nama_kategori}"?`)) return;

    setProcessingId(category.id_kategori);
    try {
      await deleteKategori(category.id_kategori);
      setCategories(categories.filter(c => c.id_kategori !== category.id_kategori));
    } catch (error) {
      alert(error.message || 'Gagal menghapus');
    } finally {
      setProcessingId(null);
    }
  };

  // Filtered categories
  const filtered = categories.filter(c => 
    c.nama_kategori.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <Loader2 className="animate-spin mr-2" /> Memuat kategori...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kelola Kategori</h1>
          <p className="text-slate-500 text-sm">Total {categories.length} kategori barang.</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Cari kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a1e3f] text-sm"
            />
          </div>
          
          {/* Add Button */}
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0a1e3f] text-white rounded-xl font-bold text-sm hover:bg-blue-900 transition shadow-lg"
          >
            <Plus size={18} /> Tambah
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-bold">
            <tr>
              <th className="p-4 w-16">#</th>
              <th className="p-4">Nama Kategori</th>
              <th className="p-4 text-center w-32">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="3" className="p-8 text-center text-slate-400">
                  Tidak ada kategori ditemukan
                </td>
              </tr>
            ) : (
              filtered.map((cat, index) => (
                <tr key={cat.id_kategori} className="hover:bg-slate-50 transition">
                  <td className="p-4 text-slate-400 font-medium">{index + 1}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                        <Tag size={18} />
                      </div>
                      <span className="font-bold text-slate-700">{cat.nama_kategori}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => openModal(cat)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(cat)}
                        disabled={processingId === cat.id_kategori}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                        title="Hapus"
                      >
                        {processingId === cat.id_kategori ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-800">
                {editMode ? 'Edit Kategori' : 'Tambah Kategori'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Nama Kategori</label>
                <input
                  type="text"
                  value={formData.nama_kategori}
                  onChange={(e) => setFormData({ ...formData, nama_kategori: e.target.value })}
                  placeholder="Contoh: Elektronik, Pakaian..."
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1e3f]"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting || !formData.nama_kategori.trim()}
                  className="flex-1 py-3 bg-[#0a1e3f] text-white rounded-xl font-bold hover:bg-blue-900 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <CheckCircle size={16} />
                  )}
                  {editMode ? 'Simpan' : 'Tambah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
