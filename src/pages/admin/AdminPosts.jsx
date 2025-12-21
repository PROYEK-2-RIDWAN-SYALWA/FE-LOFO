import { useState, useEffect } from 'react';
import { fetchAdminPosts, deletePostByAdmin, fetchCategories, approvePost, rejectPost } from '../../services/api';
import { 
  Search, Trash2, MapPin, Calendar, 
  CheckCircle, Eye, Loader2, Filter, X, XCircle, Clock, AlertTriangle
} from 'lucide-react';

const AdminPosts = () => {
  // STATE DATA
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // STATE UI & FILTER
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('pending_admin'); // Default ke pending
  const [deletingId, setDeletingId] = useState(null);
  const [processingId, setProcessingId] = useState(null); // Untuk approve/reject
  
  // STATE MODAL DETAIL
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  
  // STATE MODAL REJECT
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [postToReject, setPostToReject] = useState(null);

  // STATUS OPTIONS
  const statusOptions = [
    { value: 'pending_admin', label: 'Menunggu Verifikasi', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    { value: 'aktif', label: 'Aktif', color: 'bg-green-100 text-green-700 border-green-200' },
    { value: 'ditolak_admin', label: 'Ditolak', color: 'bg-red-100 text-red-700 border-red-200' },
    { value: 'menunggu_validasi', label: 'Menunggu Validasi', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { value: 'selesai', label: 'Selesai', color: 'bg-slate-100 text-slate-600 border-slate-200' },
    { value: 'all', label: 'Semua Status', color: 'bg-white text-slate-700 border-slate-300' },
  ];

  // --- INIT DATA ---
  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadPosts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedCategory, selectedStatus]); 

  const loadPosts = async () => {
    setLoading(true);
    try {
      const response = await fetchAdminPosts(selectedStatus);
      let data = response.data || [];
      
      // Filter lokal berdasarkan search dan kategori
      if (searchTerm) {
        data = data.filter(p => 
          p.nama_barang.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      if (selectedCategory) {
        data = data.filter(p => p.id_kategori == selectedCategory);
      }
      
      setPosts(data);
    } catch (error) {
      console.error("Gagal load postingan admin:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus postingan ini secara permanen?')) return;
    setDeletingId(id);
    try {
      await deletePostByAdmin(id);
      setPosts(prev => prev.filter(p => p.id_postingan !== id));
    } catch (error) {
      alert('Gagal menghapus.');
    } finally {
      setDeletingId(null);
    }
  };

  // === APPROVE POST ===
  const handleApprove = async (post) => {
    if (!window.confirm(`Setujui postingan "${post.nama_barang}"?`)) return;
    setProcessingId(post.id_postingan);
    try {
      await approvePost(post.id_postingan);
      // Hapus dari list jika sedang filter pending
      if (selectedStatus === 'pending_admin') {
        setPosts(prev => prev.filter(p => p.id_postingan !== post.id_postingan));
      } else {
        loadPosts(); // Reload untuk update status
      }
    } catch (error) {
      alert(error.message || 'Gagal menyetujui postingan');
    } finally {
      setProcessingId(null);
    }
  };

  // === REJECT POST ===
  const openRejectModal = (post) => {
    setPostToReject(post);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (!rejectReason || rejectReason.trim().length < 10) {
      alert('Alasan penolakan minimal 10 karakter');
      return;
    }
    setProcessingId(postToReject.id_postingan);
    try {
      await rejectPost(postToReject.id_postingan, rejectReason);
      setIsRejectModalOpen(false);
      // Hapus dari list jika sedang filter pending
      if (selectedStatus === 'pending_admin') {
        setPosts(prev => prev.filter(p => p.id_postingan !== postToReject.id_postingan));
      } else {
        loadPosts();
      }
    } catch (error) {
      alert(error.message || 'Gagal menolak postingan');
    } finally {
      setProcessingId(null);
      setPostToReject(null);
    }
  };

  const openDetail = (post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending_admin': { label: 'Pending', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
      'aktif': { label: 'Aktif', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
      'ditolak_admin': { label: 'Ditolak', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
      'menunggu_validasi': { label: 'Menunggu Validasi', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock },
      'selesai': { label: 'Selesai', color: 'bg-slate-100 text-slate-600 border-slate-200', icon: CheckCircle },
      'klaim_ditolak': { label: 'Klaim Ditolak', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: AlertTriangle },
    };
    const config = statusConfig[status] || { label: status, color: 'bg-slate-100 text-slate-500', icon: Clock };
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${config.color}`}>
        <Icon size={10} />
        {config.label}
      </span>
    );
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* === HEADER & FILTER TOOLS === */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Verifikasi Postingan</h1>
            <p className="text-slate-500 text-sm mt-1">Review dan moderasi laporan yang masuk.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Filter Status */}
            <div className="relative">
              <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full sm:w-52 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1e3f] appearance-none cursor-pointer font-medium"
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Filter Kategori */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-48 pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1e3f] appearance-none cursor-pointer"
              >
                <option value="">Semua Kategori</option>
                {categories.map(cat => (
                  <option key={cat.id_kategori} value={cat.id_kategori}>{cat.nama_kategori}</option>
                ))}
              </select>
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Cari barang..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0a1e3f] transition-all text-sm"
              />
            </div>
          </div>
        </div>

        {/* === CONTENT === */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <Loader2 className="animate-spin mb-2" size={32} />
            <p className="text-sm font-medium">Memuat data...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-700">Tidak ada postingan</h3>
            <p className="text-slate-400 text-sm">
              {selectedStatus === 'pending_admin' 
                ? 'Semua postingan sudah diverifikasi.' 
                : 'Tidak ada data untuk filter ini.'}
            </p>
          </div>
        ) : (
          <>
            {/* === TAMPILAN TABLE (DESKTOP) === */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-bold tracking-wider">
                  <tr>
                    <th className="p-4 w-16 text-center">No</th>
                    <th className="p-4">Barang</th>
                    <th className="p-4">Kategori</th>
                    <th className="p-4">Pelapor</th>
                    <th className="p-4">Lokasi & Waktu</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {posts.map((post, index) => (
                    <tr key={post.id_postingan} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-4 text-center text-slate-400 font-medium text-sm">
                        {index + 1}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200 cursor-pointer" onClick={() => openDetail(post)}>
                            {post.foto_barang && post.foto_barang.length > 10 ? (
                              <img src={post.foto_barang} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[8px] text-slate-400">N/A</div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-700 text-sm line-clamp-1">{post.nama_barang}</div>
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded mt-1
                              ${post.tipe_postingan === 'kehilangan' ? 'text-red-600 bg-red-50' : 'text-emerald-600 bg-emerald-50'}`}>
                              {post.tipe_postingan}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                          {post.master_kategori?.nama_kategori || 'Umum'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700">{post.akun_pengguna?.nama_lengkap}</span>
                          <span className="text-[10px] text-slate-400">@{post.akun_pengguna?.username}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <MapPin size={12} className="text-orange-500" />
                            <span className="truncate max-w-[120px]">{post.lokasi_terlapor}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                            <Calendar size={10} />
                            {formatDate(post.tgl_postingan)}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        {getStatusBadge(post.status_postingan)}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-1">
                          {/* Tombol Approve - Hanya untuk pending */}
                          {post.status_postingan === 'pending_admin' && (
                            <button 
                              onClick={() => handleApprove(post)}
                              disabled={processingId === post.id_postingan}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all disabled:opacity-50"
                              title="Setujui"
                            >
                              {processingId === post.id_postingan ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                            </button>
                          )}
                          {/* Tombol Reject - Hanya untuk pending */}
                          {post.status_postingan === 'pending_admin' && (
                            <button 
                              onClick={() => openRejectModal(post)}
                              disabled={processingId === post.id_postingan}
                              className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-all disabled:opacity-50"
                              title="Tolak"
                            >
                              <XCircle size={18} />
                            </button>
                          )}
                          <button 
                            onClick={() => openDetail(post)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                            title="Lihat Detail"
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(post.id_postingan)}
                            disabled={deletingId === post.id_postingan}
                            className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all disabled:opacity-50"
                            title="Hapus"
                          >
                            {deletingId === post.id_postingan ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* === TAMPILAN MOBILE (CARD VIEW) === */}
            <div className="md:hidden space-y-4">
              {posts.map((post, index) => (
                <div key={post.id_postingan} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex gap-4">
                    {/* Foto Kiri */}
                    <div className="w-24 h-24 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0" onClick={() => openDetail(post)}>
                      {post.foto_barang && post.foto_barang.length > 10 ? (
                        <img src={post.foto_barang} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">No Img</div>
                      )}
                    </div>

                    {/* Info Kanan */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-slate-800 line-clamp-1">{post.nama_barang}</h3>
                        <span className="text-[10px] text-slate-400">#{index + 1}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase border ${post.tipe_postingan === 'kehilangan' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                          {post.tipe_postingan}
                        </span>
                        {getStatusBadge(post.status_postingan)}
                      </div>

                      <div className="text-xs text-slate-500 mt-2">
                        {post.akun_pengguna?.nama_lengkap}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {post.status_postingan === 'pending_admin' && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                      <button 
                        onClick={() => handleApprove(post)}
                        disabled={processingId === post.id_postingan}
                        className="flex-1 py-2 px-4 bg-green-500 text-white rounded-lg font-medium text-sm hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {processingId === post.id_postingan ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                        Setujui
                      </button>
                      <button 
                        onClick={() => openRejectModal(post)}
                        className="flex-1 py-2 px-4 bg-orange-500 text-white rounded-lg font-medium text-sm hover:bg-orange-600 flex items-center justify-center gap-2"
                      >
                        <XCircle size={16} />
                        Tolak
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* === MODAL DETAIL POPUP === */}
      {isModalOpen && selectedPost && (
        <div className="fixed inset-0 z-[99] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl relative animate-[scaleIn_0.3s_ease-out]">
            
            {/* Tombol Close */}
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 z-10 bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/40 transition-all md:text-slate-800 md:bg-white md:shadow-lg"
            >
              <X size={24} />
            </button>

            {/* Bagian Gambar Besar */}
            <div className="w-full md:w-1/2 bg-black flex items-center justify-center h-64 md:h-auto relative">
              {selectedPost.foto_barang && selectedPost.foto_barang.length > 10 ? (
                <img src={selectedPost.foto_barang} alt="Detail" className="max-w-full max-h-full object-contain" />
              ) : (
                <span className="text-white/50">Tidak ada gambar</span>
              )}
              <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-lg text-xs font-black text-white uppercase tracking-wider shadow-lg backdrop-blur-md
                ${selectedPost.tipe_postingan === 'kehilangan' ? 'bg-red-600/90' : 'bg-emerald-600/90'}`}>
                {selectedPost.tipe_postingan}
              </div>
            </div>

            {/* Bagian Detail Informasi */}
            <div className="w-full md:w-1/2 p-6 md:p-10 overflow-y-auto bg-white">
              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-2">{selectedPost.nama_barang}</h2>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wide">
                    {selectedPost.master_kategori?.nama_kategori || 'Umum'}
                  </span>
                  {getStatusBadge(selectedPost.status_postingan)}
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Detail Kejadian</h4>
                  <div className="flex items-start gap-3 mb-2">
                    <MapPin className="text-orange-500 mt-0.5" size={18} />
                    <div>
                      <span className="block text-xs text-slate-400">Lokasi</span>
                      <span className="font-medium text-slate-700">{selectedPost.lokasi_terlapor}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="text-blue-500 mt-0.5" size={18} />
                    <div>
                      <span className="block text-xs text-slate-400">Waktu</span>
                      <span className="font-medium text-slate-700">
                        {formatDate(selectedPost.tgl_postingan)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Deskripsi</h4>
                  <p className="text-slate-600 leading-relaxed text-sm bg-white border border-slate-100 p-4 rounded-2xl">
                    {selectedPost.deskripsi || "Tidak ada deskripsi tambahan."}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Informasi Pelapor</h4>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#0a1e3f] text-white flex items-center justify-center font-bold text-lg">
                      {selectedPost.akun_pengguna?.nama_lengkap?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">{selectedPost.akun_pengguna?.nama_lengkap}</div>
                      <div className="text-sm text-slate-500">@{selectedPost.akun_pengguna?.username}</div>
                      <div className="text-xs text-blue-600 mt-0.5 font-medium">{selectedPost.akun_pengguna?.no_wa || 'No Kontak'}</div>
                    </div>
                  </div>
                </div>

                {/* Tombol Aksi di Modal */}
                {selectedPost.status_postingan === 'pending_admin' && (
                  <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <button 
                      onClick={() => { handleApprove(selectedPost); setIsModalOpen(false); }}
                      className="flex-1 py-3 px-4 bg-green-500 text-white rounded-xl font-bold text-sm hover:bg-green-600 flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} />
                      Setujui Postingan
                    </button>
                    <button 
                      onClick={() => { setIsModalOpen(false); openRejectModal(selectedPost); }}
                      className="flex-1 py-3 px-4 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 flex items-center justify-center gap-2"
                    >
                      <XCircle size={18} />
                      Tolak
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === MODAL REJECT (Alasan Penolakan) === */}
      {isRejectModalOpen && postToReject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Tolak Postingan</h3>
            <p className="text-slate-500 text-sm mb-4">
              Berikan alasan penolakan untuk "{postToReject.nama_barang}"
            </p>
            
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Tulis alasan penolakan (minimal 10 karakter)..."
              className="w-full p-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none h-32"
            />
            
            <div className="flex gap-3 mt-4">
              <button 
                onClick={() => setIsRejectModalOpen(false)}
                className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 rounded-xl font-medium text-sm hover:bg-slate-200"
              >
                Batal
              </button>
              <button 
                onClick={handleReject}
                disabled={processingId === postToReject.id_postingan || rejectReason.trim().length < 10}
                className="flex-1 py-3 px-4 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processingId === postToReject.id_postingan ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <XCircle size={16} />
                )}
                Tolak Postingan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ANIMASI CSS */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
};

export default AdminPosts;