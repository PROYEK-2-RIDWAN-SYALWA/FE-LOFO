import { useState, useEffect } from 'react';
import { fetchPosts, deletePostByAdmin } from '../../services/api';
// PERBAIKAN: Menambahkan 'User' ke dalam import
import { Search, Trash2, MapPin, Calendar, Loader2, User } from 'lucide-react';

const AdminPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchPosts();
        setPosts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('PERINGATAN: Tindakan ini permanen. Hapus laporan ini?')) return;
    setDeletingId(id);
    try {
      await deletePostByAdmin(id);
      setPosts(posts.filter(p => p.id_postingan !== id));
    } catch (error) {
      alert('Gagal menghapus: ' + error.message);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredPosts = posts.filter(p => 
    p.nama_barang.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.deskripsi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center text-slate-400">Memuat laporan...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Moderasi Laporan</h1>
          <p className="text-slate-500 text-sm">Pantau dan hapus laporan yang melanggar aturan.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
          <input 
            type="text" placeholder="Cari barang..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a1e3f]"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((item) => (
          <div key={item.id_postingan} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition">
            <div className="h-40 bg-slate-100 relative group">
              <img 
                src={item.foto_barang || 'https://placehold.co/600x400?text=No+Image'} 
                alt={item.nama_barang} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition"></div>
              <div className={`absolute top-3 left-3 px-2 py-1 rounded text-[10px] font-bold text-white uppercase shadow
                ${item.tipe_postingan === 'kehilangan' ? 'bg-red-500' : 'bg-green-600'}`}>
                {item.tipe_postingan}
              </div>
            </div>
            
            <div className="p-5">
              <h3 className="font-bold text-slate-800 mb-1 line-clamp-1">{item.nama_barang}</h3>
              <p className="text-xs text-slate-500 mb-3 line-clamp-2 min-h-[2.5em]">{item.deskripsi}</p>
              
              <div className="space-y-1 mb-4">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  {/* Ikon User yang sebelumnya menyebabkan error */}
                  <User size={14} /> 
                  <span className="font-medium text-slate-700">{item.akun_pengguna?.nama_lengkap || 'Anonim'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <MapPin size={14} /> {item.lokasi_terlapor}
                </div>
              </div>

              <button 
                onClick={() => handleDelete(item.id_postingan)}
                disabled={deletingId === item.id_postingan}
                className="w-full py-2 rounded-lg border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {deletingId === item.id_postingan ? <Loader2 className="animate-spin" size={14}/> : <Trash2 size={14} />}
                Hapus Laporan
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPosts;