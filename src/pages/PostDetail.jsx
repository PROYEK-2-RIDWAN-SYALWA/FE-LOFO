import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPostDetail, updatePostStatus, createClaim, fetchClaimsByPost, approveClaim, rejectClaim, uploadFile, getStorageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft, MapPin, Calendar, MessageCircle, Clock,
  User, Shield, CheckCircle2, AlertTriangle, Upload, X, Loader2,
  FileCheck, XCircle, Package, Eye
} from 'lucide-react';
import VerificationBadge from '../components/VerificationBadge';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  // State untuk klaim
  const [claims, setClaims] = useState([]);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimForm, setClaimForm] = useState({ file_bukti: '', catatan_klaim: '' });
  const [submittingClaim, setSubmittingClaim] = useState(false);

  // State untuk validasi klaim (oleh penemu)
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processingClaim, setProcessingClaim] = useState(false);

  // 1. Load Data Detail
  useEffect(() => {
    const loadDetail = async () => {
      try {
        const data = await fetchPostDetail(id);
        setPost(data);

        // Load claims jika owner
        if (user?.id === data.akun_pengguna?.auth_id) {
          try {
            const claimsData = await fetchClaimsByPost(id);
            setClaims(claimsData || []);
          } catch (e) {
            console.log('No claims yet');
          }
        }
      } catch (error) {
        console.error("Gagal load detail:", error);
        alert("Postingan tidak ditemukan atau sudah dihapus.");
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    loadDetail();
  }, [id, navigate, user]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Memuat detail...</div>;
  if (!post) return null;

  // 2. Logic & Helper
  const rawNo = post.akun_pengguna?.no_wa || '';
  const cleanNo = rawNo.startsWith('0') ? '62' + rawNo.slice(1) : rawNo;

  const waMessage = `Halo ${post.akun_pengguna?.nama_lengkap}, saya melihat laporan ${post.tipe_postingan} barang "${post.nama_barang}" di ULBI LOFO. Apakah masih available?`;
  const waLink = `https://wa.me/${cleanNo}?text=${encodeURIComponent(waMessage)}`;

  const isLost = post.tipe_postingan === 'kehilangan';
  const isFound = post.tipe_postingan === 'ditemukan';
  const isOwner = user?.id === post.akun_pengguna?.auth_id;
  const isSolved = post.status_postingan === 'selesai';
  const isActive = post.status_postingan === 'aktif';
  const isWaitingValidation = post.status_postingan === 'menunggu_validasi';

  // Cek apakah user bisa mengklaim (bukan owner, postingan ditemukan, status aktif)
  const canClaim = !isOwner && isFound && isActive && user;

  // Cek apakah ada klaim pending untuk di-validasi owner
  const pendingClaims = claims.filter(c => c.tindakan_validasi === null);

  // 3. Handle Update Status (Mark as Solved)
  const handleMarkAsSolved = async () => {
    if (!confirm("Apakah barang ini benar-benar sudah kembali/ditemukan? Status akan diubah menjadi 'Selesai' dan hilang dari beranda.")) return;

    try {
      await updatePostStatus(post.id_postingan, 'selesai');
      setPost({ ...post, status_postingan: 'selesai' });
      alert("Alhamdulillah! Status laporan berhasil diperbarui.");
    } catch (error) {
      alert("Gagal update status: " + error.message);
    }
  };

  // 4. Handle Submit Klaim
  const handleSubmitClaim = async () => {
    if (!claimForm.file_bukti) {
      alert('Silakan upload foto bukti kepemilikan');
      return;
    }
    if (!claimForm.catatan_klaim || claimForm.catatan_klaim.length < 10) {
      alert('Catatan bukti minimal 10 karakter');
      return;
    }

    setSubmittingClaim(true);
    try {
      let finalPath = '';

      // 1. Upload File jika ada fileObj
      if (claimForm.fileObj) {
        finalPath = await uploadFile(claimForm.fileObj, 'claim-images');
      } else {
        // Fallback jika user pakai URL manual (legacy support) atau error
        finalPath = claimForm.file_bukti;
        if (finalPath.startsWith('blob:')) throw new Error("File belum terupload sempurna. Coba lagi.");
      }

      await createClaim({
        id_postingan: post.id_postingan,
        file_bukti: finalPath,
        catatan_klaim: claimForm.catatan_klaim
      });

      setIsClaimModalOpen(false);
      setClaimForm({ file_bukti: '', catatan_klaim: '' });
      setPost({ ...post, status_postingan: 'menunggu_validasi' });
      alert('Klaim berhasil diajukan! Menunggu validasi dari penemu.');
    } catch (error) {
      alert(error.message || 'Gagal mengajukan klaim');
    } finally {
      setSubmittingClaim(false);
    }
  };

  // 5. Handle Validasi Klaim (oleh Penemu)
  // 5. Handle Validasi Klaim (oleh Penemu)
  const handleApproveClaim = async (claim) => {
    if (!confirm('Setujui klaim ini? Barang akan ditandai selesai dan notifikasi dikirim ke pengklaim.')) return;

    setProcessingClaim(true);
    try {
      await approveClaim(claim.id_klaim);
      alert('Klaim disetujui! Status barang diperbarui menjadi SELESAI.');
      setPost({ ...post, status_postingan: 'selesai' });
      const claimsRes = await fetchClaimsByPost(id);
      setClaims(claimsRes);
    } catch (error) {
      alert('Gagal menyetujui klaim: ' + error.message);
    } finally {
      setProcessingClaim(false);
    }
  };

  const handleRejectClaim = async () => {
    // Gunakan parameter claim langsung jika ada, atau fallback variable lain jika sebelumnya pakai state
    const targetId = selectedClaim?.id_klaim;
    if (!targetId) return;

    // AMBIL ALASAN DARI STATE MODAL (Bukan prompt browser lagi)
    const alasan = rejectReason;

    if (!alasan) return alert("Mohon isi alasan penolakan.");
    if (alasan.length < 10) return alert("Alasan terlalu pendek (min. 10 karakter).");

    setProcessingClaim(true);
    try {
      await rejectClaim(targetId, alasan);
      alert('Klaim ditolak. Status barang kembali AKTIF.');
      setPost({ ...post, status_postingan: 'aktif' });
      const claimsRes = await fetchClaimsByPost(id);
      setClaims(claimsRes);

      // Close modal if exists
      setIsValidationModalOpen(false);
    } catch (error) {
      alert('Gagal menolak klaim: ' + error.message);
    } finally {
      setProcessingClaim(false);
    }
  };

  // Status badge helper
  const getStatusBadge = (status) => {
    const config = {
      'aktif': { label: 'Aktif', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
      'menunggu_validasi': { label: 'Menunggu Validasi', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
      'selesai': { label: 'Selesai', color: 'bg-blue-100 text-blue-700', icon: CheckCircle2 },
      'pending_admin': { label: 'Menunggu Review', color: 'bg-slate-100 text-slate-600', icon: Clock },
    };
    const cfg = config[status] || { label: status, color: 'bg-slate-100 text-slate-600', icon: AlertTriangle };
    const Icon = cfg.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.color}`}>
        <Icon size={12} />
        {cfg.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">

      {/* Navbar Simple */}
      <div className="bg-white px-6 py-4 shadow-sm sticky top-0 z-50 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition">
          <ArrowLeft size={20} className="text-slate-700" />
        </button>
        <h1 className="font-bold text-lg text-slate-800">Detail Laporan</h1>
        <div className="ml-auto">
          {getStatusBadge(post.status_postingan)}
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* KOLOM KIRI: Foto Besar */}
        <div className="space-y-4">
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden relative group h-96 flex items-center justify-center bg-slate-100">
            {post.foto_barang && post.foto_barang.length > 10 ? (
              <img src={post.foto_barang} alt={post.nama_barang} className="w-full h-full object-contain" />
            ) : (
              <div className="text-slate-400 font-medium">Tidak ada foto tersedia</div>
            )}

            {/* Badge Tipe (Kehilangan/Ditemukan) */}
            <div className={`absolute top-4 left-4 px-4 py-1.5 rounded-xl text-xs font-black text-white uppercase tracking-wider shadow-lg backdrop-blur-md
              ${isLost ? 'bg-red-500/90' : 'bg-emerald-500/90'}`}>
              {post.tipe_postingan}
            </div>

            {/* Badge Status Selesai (Overlay) */}
            {isSolved && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                <div className="bg-green-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-2xl flex items-center gap-2 transform -rotate-6 border-4 border-white">
                  <CheckCircle2 size={28} /> KASUS SELESAI
                </div>
              </div>
            )}
          </div>

          {/* SECTION KLAIM MASUK (UNTUK OWNER/PENEMU) */}
          {isOwner && pendingClaims.length > 0 && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="text-yellow-600" size={20} />
                <h3 className="font-bold text-yellow-800">Klaim Masuk ({pendingClaims.length})</h3>
              </div>
              <div className="space-y-3">
                {pendingClaims.map(claim => (
                  <div key={claim.id_klaim} className="bg-white rounded-xl p-4 border border-yellow-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600">
                        {claim.akun_pengguna?.nama_lengkap?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{claim.akun_pengguna?.nama_lengkap}</p>
                        <p className="text-xs text-slate-500">@{claim.akun_pengguna?.username}</p>
                      </div>
                    </div>

                    {claim.file_bukti && (
                      <div className="mb-3">
                        <p className="text-xs text-slate-500 mb-1">Bukti Kepemilikan:</p>
                        <img src={getStorageUrl(claim.file_bukti)} alt="Bukti" className="w-full h-32 object-cover rounded-lg border" />
                      </div>
                    )}

                    <p className="text-sm text-slate-600 mb-4 p-3 bg-slate-50 rounded-lg">
                      "{claim.catatan_validasi || 'Tidak ada catatan'}"
                    </p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveClaim(claim)}
                        disabled={processingClaim}
                        className="flex-1 py-2 px-4 bg-green-500 text-white rounded-lg font-medium text-sm hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {processingClaim ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                        Setujui
                      </button>
                      <button
                        onClick={() => { setSelectedClaim(claim); setIsValidationModalOpen(true); }}
                        className="flex-1 py-2 px-4 bg-orange-500 text-white rounded-lg font-medium text-sm hover:bg-orange-600 flex items-center justify-center gap-2"
                      >
                        <XCircle size={16} />
                        Tolak
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* KOLOM KANAN: Informasi & Kontak */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-md border border-blue-200 uppercase tracking-wide">
                {post.master_kategori?.nama_kategori || 'UMUM'}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                <Clock size={14} /> Diposting {new Date(post.tgl_postingan).toLocaleDateString('id-ID')}
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

          {/* AREA INTERAKSI (KONTAK / UPDATE STATUS / KLAIM) */}
          <div className={`p-6 rounded-3xl text-white shadow-xl shadow-blue-900/20 relative overflow-hidden transition-all
            ${isSolved ? 'bg-green-600' : 'bg-[#0a1e3f]'}`}>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 overflow-hidden flex items-center justify-center">
                  {post.akun_pengguna?.foto_profil ? (
                    <img
                      src={getStorageUrl(post.akun_pengguna.foto_profil)}
                      alt="User"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-black text-xl text-white">
                      {post.akun_pengguna?.nama_lengkap?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-xs text-white/70 uppercase tracking-wider font-bold mb-1">Dilaporkan Oleh</p>
                  <p className="font-bold text-xl">{post.akun_pengguna?.nama_lengkap}</p>
                  <div className="flex items-center gap-1 text-xs text-white/60 mt-1">
                    <Shield size={12} />
                    <span className="capitalize flex items-center gap-1">
                      {post.akun_pengguna?.master_roles?.nama_role || 'User'}
                      <VerificationBadge status={post.akun_pengguna?.status_akun} />
                    </span>
                  </div>
                </div>
              </div>

              {/* LOGIKA TOMBOL BERDASARKAN KONDISI */}
              {isSolved ? (
                // KONDISI 1: SUDAH SELESAI
                <div className="bg-white/20 border border-white/30 text-white p-4 rounded-xl flex items-center justify-center gap-2 font-bold backdrop-blur-md">
                  <CheckCircle2 size={24} />
                  Kasus Selesai (Barang Kembali)
                </div>
              ) : isWaitingValidation ? (
                // KONDISI: MENUNGGU VALIDASI
                <div className="bg-yellow-500/20 border border-yellow-400/40 text-yellow-100 p-4 rounded-xl flex items-center justify-center gap-2 font-bold backdrop-blur-md">
                  <Clock size={24} />
                  Menunggu Validasi Penemu
                </div>
              ) : isOwner ? (
                // KONDISI 2: PEMILIK POSTINGAN (BELUM SELESAI)
                <div className="space-y-3">
                  <button
                    onClick={handleMarkAsSolved}
                    className="w-full py-4 bg-white text-[#0a1e3f] rounded-xl font-bold hover:bg-slate-200 transition shadow-lg flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={20} />
                    Tandai Sebagai Selesai
                  </button>
                  <p className="text-center text-[10px] text-white/50">
                    Klik tombol di atas jika barang sudah ditemukan/dikembalikan untuk menutup laporan ini.
                  </p>
                </div>
              ) : canClaim ? (
                // KONDISI 3: BISA MENGKLAIM (Barang Ditemukan + User Login + Bukan Owner)
                <div className="space-y-3">
                  <button
                    onClick={() => setIsClaimModalOpen(true)}
                    className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold hover:from-amber-600 hover:to-orange-600 transition shadow-lg flex items-center justify-center gap-2"
                  >
                    <Package size={20} />
                    Klaim Barang Ini
                  </button>
                  <p className="text-center text-[10px] text-white/50">
                    Jika ini adalah barang Anda, klik untuk mengajukan klaim dengan bukti kepemilikan.
                  </p>
                  <div className="border-t border-white/10 pt-3">
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition text-sm"
                    >
                      <MessageCircle size={18} /> Atau Hubungi via WhatsApp
                    </a>
                  </div>
                </div>
              ) : (
                // KONDISI 4: PENGUNJUNG LAIN (TOMBOL WA)
                <a
                  href={waLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-4 bg-green-500 text-white rounded-xl font-bold hover:bg-green-400 transition shadow-lg active:scale-95 group"
                >
                  <MessageCircle size={20} className="group-hover:rotate-12 transition-transform" />
                  Hubungi via WhatsApp
                </a>
              )}
            </div>

            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl opacity-50 -mr-10 -mt-10 pointer-events-none"></div>
          </div>

        </div>
      </div>

      {/* === MODAL KLAIM BARANG === */}
      {isClaimModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-800">Klaim Barang</h3>
              <button onClick={() => setIsClaimModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <p className="text-slate-500 text-sm mb-6">
              Upload bukti bahwa barang ini milik Anda (foto struk, foto dengan barang, serial number, dll)
            </p>

            <div className="space-y-4">
              {/* Input URL Foto Bukti */}
              {/* Input FILE Foto Bukti (GANTI URL) */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Upload Foto Bukti *</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-orange-500 transition-colors bg-slate-50 cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        // Simpan file object untuk upload nanti
                        // Preview menggunakan URL.createObjectURL
                        setClaimForm({ ...claimForm, fileObj: file, file_bukti: URL.createObjectURL(file) });
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Upload size={32} />
                    <span className="text-sm font-medium">Klik untuk upload foto bukti</span>
                    <span className="text-xs">JPG, PNG (Max 2MB)</span>
                  </div>
                </div>
              </div>

              {/* Preview Gambar */}
              {claimForm.file_bukti && (
                <div className="relative">
                  <img
                    src={claimForm.file_bukti}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-xl border"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
              )}

              {/* Catatan */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Catatan Bukti *</label>
                <textarea
                  value={claimForm.catatan_klaim}
                  onChange={(e) => setClaimForm({ ...claimForm, catatan_klaim: e.target.value })}
                  placeholder="Jelaskan bukti kepemilikan Anda (min. 10 karakter)"
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none h-24"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsClaimModalOpen(false)}
                className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                onClick={handleSubmitClaim}
                disabled={submittingClaim}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submittingClaim ? <Loader2 size={18} className="animate-spin" /> : <FileCheck size={18} />}
                Ajukan Klaim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === MODAL TOLAK KLAIM === */}
      {isValidationModalOpen && selectedClaim && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Tolak Klaim</h3>
            <p className="text-slate-500 text-sm mb-4">
              Berikan alasan mengapa klaim dari {selectedClaim.akun_pengguna?.nama_lengkap} ditolak.
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Tulis alasan penolakan (minimal 10 karakter)..."
              className="w-full p-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none h-32"
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setIsValidationModalOpen(false); setRejectReason(''); }}
                className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                onClick={handleRejectClaim}
                disabled={processingClaim || rejectReason.length < 10}
                className="flex-1 py-3 px-4 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processingClaim ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                Tolak Klaim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetail;