import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPostDetail } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, MapPin, Calendar, MessageCircle, Clock, User, Shield } from 'lucide-react';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();//ini gpp merah juga
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDetail = async () => {
      try {
        const data = await fetchPostDetail(id);
        setPost(data);
      } catch (error) {
        console.error("Gagal load detail:", error);
        alert("Postingan tidak ditemukan atau sudah dihapus.");
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    loadDetail();
  }, [id, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Memuat detail...</div>;
  if (!post) return null;

  // Format Nomor WhatsApp (08xx -> 628xx)
  const rawNo = post.akun_pengguna?.no_wa || '';
  const cleanNo = rawNo.startsWith('0') ? '62' + rawNo.slice(1) : rawNo;
  
  const waMessage = `Halo ${post.akun_pengguna?.nama_lengkap}, saya melihat laporan ${post.tipe_postingan} barang "${post.nama_barang}" di ULBI LOFO. Apakah masih available?`;
  const waLink = `https://wa.me/${cleanNo}?text=${encodeURIComponent(waMessage)}`;

  const isLost = post.tipe_postingan === 'kehilangan';

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      
      {/* Navbar Simple */}
      <div className="bg-white px-6 py-4 shadow-sm sticky top-0 z-50 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition">
          <ArrowLeft size={20} className="text-slate-700"/>
        </button>
        <h1 className="font-bold text-lg text-slate-800">Detail Laporan</h1>
      </div>

      <div className="max-w-5xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Kiri: Foto Besar */}
        <div className="space-y-4">
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden relative group h-96 flex items-center justify-center bg-slate-100">
            {post.foto_barang && post.foto_barang.length > 10 ? (
              <img src={post.foto_barang} alt={post.nama_barang} className="w-full h-full object-contain" />
            ) : (
              <div className="text-slate-400 font-medium">Tidak ada foto tersedia</div>
            )}
            
            <div className={`absolute top-4 left-4 px-4 py-1.5 rounded-xl text-xs font-black text-white uppercase tracking-wider shadow-lg backdrop-blur-md
              ${isLost ? 'bg-red-500/90' : 'bg-emerald-500/90'}`}>
              {post.tipe_postingan}
            </div>
          </div>
        </div>

        {/* Kanan: Informasi & Kontak */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-md border border-blue-200 uppercase tracking-wide">
                {post.master_kategori?.nama_kategori || 'UMUM'}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                <Clock size={14} /> Diposting {new Date(post.created_at).toLocaleDateString('id-ID')}
              </span>
            </div>
            
            <h1 className="text-4xl font-black text-slate-800 mb-6 leading-tight">{post.nama_barang}</h1>
            
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
              <div className="flex items-start gap-4">
                <div className="bg-orange-50 p-3 rounded-2xl text-orange-500"><MapPin size={24} /></div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase mb-1">Lokasi Kejadian</p>
                  <p className="text-slate-800 font-bold text-lg">{post.lokasi_terlapor}</p>
                </div>
              </div>
              <div className="border-t border-slate-50"></div>
              <div className="flex items-start gap-4">
                <div className="bg-blue-50 p-3 rounded-2xl text-blue-500"><Calendar size={24} /></div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase mb-1">Waktu Kejadian</p>
                  <p className="text-slate-800 font-bold text-lg">
                    {post.waktu_kejadian 
                      ? new Date(post.waktu_kejadian).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })
                      : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-100 p-6 rounded-3xl">
            <h3 className="font-bold text-slate-800 text-lg mb-2">Deskripsi Barang</h3>
            <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-line">
              {post.deskripsi}
            </p>
          </div>

          {/* Kartu Kontak Pelapor */}
          <div className="bg-[#0a1e3f] p-6 rounded-3xl text-white shadow-xl shadow-blue-900/20 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center font-black text-xl backdrop-blur-sm border border-white/20">
                  {post.akun_pengguna?.nama_lengkap?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs text-blue-300 uppercase tracking-wider font-bold mb-1">Dilaporkan Oleh</p>
                  <p className="font-bold text-xl">{post.akun_pengguna?.nama_lengkap}</p>
                  <div className="flex items-center gap-1 text-xs text-blue-200 mt-1">
                    <Shield size={12} />
                    <span className="capitalize">{post.akun_pengguna?.master_roles?.nama_role || 'User'} Terverifikasi</span>
                  </div>
                </div>
              </div>

              <a 
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-4 bg-green-500 text-white rounded-xl font-bold hover:bg-green-400 transition shadow-lg active:scale-95 group"
              >
                <MessageCircle size={20} className="group-hover:rotate-12 transition-transform"/> 
                Hubungi via WhatsApp
              </a>
            </div>
            
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10 pointer-events-none"></div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PostDetail;