import { useState, useEffect } from 'react';
import { fetchProdiList, createProdi, updateProdi, deleteProdi } from '../../services/api';
import { 
  Plus, Pencil, Trash2, Loader2, Search, Building, X, CheckCircle
} from 'lucide-react';

const AdminProdi = () => {
  const [prodiList, setProdiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ id: null, nama_prodi: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProdi();
  }, []);

  const loadProdi = async () => {
    setLoading(true);
    try {
      const data = await fetchProdiList();
      setProdiList(data);
    } catch (error) {
      console.error('Gagal load prodi:', error);
    } finally {
      setLoading(false);
    }
  };

  // Open modal for add/edit
  const openModal = (prodi = null) => {
    if (prodi) {
      setEditMode(true);
      setFormData({ id: prodi.id_prodi, nama_prodi: prodi.nama_prodi });
    } else {
      setEditMode(false);
      setFormData({ id: null, nama_prodi: '' });
    }
    setIsModalOpen(true);
  };

  // Handle submit (create/update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama_prodi.trim()) return;

    setSubmitting(true);
    try {
      if (editMode) {
        await updateProdi(formData.id, formData.nama_prodi);
        setProdiList(prodiList.map(p => 
          p.id_prodi === formData.id ? { ...p, nama_prodi: formData.nama_prodi } : p
        ));
      } else {
        const result = await createProdi(formData.nama_prodi);
        setProdiList([...prodiList, result.data]);
      }
      setIsModalOpen(false);
    } catch (error) {
      alert(error.message || 'Gagal menyimpan');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (prodi) => {
    if (!confirm(`Hapus program studi "${prodi.nama_prodi}"?\n\nPeringatan: Prodi yang sudah digunakan oleh mahasiswa/dosen akan tetap tersimpan di data mereka.`)) return;

    setProcessingId(prodi.id_prodi);
    try {
      await deleteProdi(prodi.id_prodi);
      setProdiList(prodiList.filter(p => p.id_prodi !== prodi.id_prodi));
    } catch (error) {
      alert(error.message || 'Gagal menghapus');
    } finally {
      setProcessingId(null);
    }
  };

  // Filtered list
  const filtered = prodiList.filter(p => 
    p.nama_prodi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <Loader2 className="animate-spin mr-2" /> Memuat program studi...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kelola Program Studi</h1>
          <p className="text-slate-500 text-sm">Total {prodiList.length} program studi.</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Cari prodi..."
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
              <th className="p-4">Nama Program Studi</th>
              <th className="p-4 text-center w-32">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="3" className="p-8 text-center text-slate-400">
                  Tidak ada program studi ditemukan
                </td>
              </tr>
            ) : (
              filtered.map((prodi, index) => (
                <tr key={prodi.id_prodi} className="hover:bg-slate-50 transition">
                  <td className="p-4 text-slate-400 font-medium">{index + 1}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                        <Building size={18} />
                      </div>
                      <span className="font-bold text-slate-700">{prodi.nama_prodi}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => openModal(prodi)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(prodi)}
                        disabled={processingId === prodi.id_prodi}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                        title="Hapus"
                      >
                        {processingId === prodi.id_prodi ? (
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
                {editMode ? 'Edit Program Studi' : 'Tambah Program Studi'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Nama Program Studi</label>
                <input
                  type="text"
                  value={formData.nama_prodi}
                  onChange={(e) => setFormData({ ...formData, nama_prodi: e.target.value })}
                  placeholder="Contoh: Sistem Informasi, Teknik Informatika..."
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
                  disabled={submitting || !formData.nama_prodi.trim()}
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

export default AdminProdi;
