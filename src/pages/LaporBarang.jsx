import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import { createPost, fetchCategories } from '../services/api';
import { supabase } from '../services/supabaseClient'; 
import { 
  ArrowLeft, UploadCloud, MapPin, Calendar, FileText, 
  HelpCircle, Camera, Loader2, X, AlertTriangle, CheckCircle2, Info
} from 'lucide-react';

const LaporBarang = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Default tipe dari navigasi sebelumnya, atau default 'kehilangan'
  const defaultTipe = state?.tipe || 'kehilangan';
  
  // State Form
  const [form, setForm] = useState({
    nama_barang: '',
    id_kategori: '',
    deskripsi: '',
    lokasi: '',
    waktu_kejadian: '',
    pertanyaan_keamanan: '', 
    foto_barang: null, 
    tipe_postingan: defaultTipe
  });

  // State Pendukung
  const [kategoriList, setKategoriList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 1. Load Kategori
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchCategories();
        setKategoriList(data);
      } catch (err) {
        console.error("Gagal load kategori", err);
      }
    };
    loadData();
  }, []);

  // 2. Handle File Upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran file terlalu besar! Maksimal 2MB.");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `post-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('lofo-images') 
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('lofo-images').getPublicUrl(filePath);
      setForm(prev => ({ ...prev, foto_barang: data.publicUrl }));
      
    } catch (error) {
      alert("Gagal upload gambar: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.id_kategori) return alert('Harap pilih kategori barang!');
    if (!confirm('Apakah data yang Anda masukkan sudah benar?')) return;

    setLoading(true);
    try {
      await createPost({
        tipe_postingan: form.tipe_postingan,
        nama_barang: form.nama_barang,
        id_kategori: parseInt(form.id_kategori),
        deskripsi: form.deskripsi,
        lokasi: form.lokasi,
        waktu_kejadian: form.waktu_kejadian || new Date().toISOString(), 
        foto_barang: form.foto_barang,
        ...(form.tipe_postingan === 'ditemukan' && { pertanyaan_keamanan: form.pertanyaan_keamanan })
      });
      
      alert('Laporan berhasil dipublikasikan!');
      navigate('/dashboard');
    } catch (error) {
      alert('Gagal: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const isLost = form.tipe_postingan === 'kehilangan';

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      
      {/* --- HEADER --- */}
      <div className="bg-[#0a1e3f] pb-32 pt-8 px-4 relative overflow-hidden shadow-lg">
        {/* Dekorasi Latar Belakang */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-10 -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500 rounded-full blur-3xl opacity-10 -ml-20 -mb-20 pointer-events-none"></div>

        <div className="max-w-5xl mx-auto relative z-10">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors mb-8 text-sm font-bold bg-white/10 px-4 py-2 rounded-full w-fit hover:bg-white/20"
          >
            <ArrowLeft size={18} /> Kembali ke Dashboard
          </button>
          
          <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">
                Buat Laporan <span className="text-[#f97316]">Baru</span>
              </h1>
              <p className="text-blue-100 text-lg max-w-2xl font-light">
                Isi formulir di bawah ini dengan detail yang akurat untuk membantu proses pencarian atau pengembalian barang.
              </p>
            </div>
            {/* Info User Singkat */}
            <div className="hidden md:flex items-center gap-3 bg-[#0f2952] px-4 py-2 rounded-xl border border-blue-800">
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-xs">
                    {user?.user_metadata?.full_name?.charAt(0) || 'U'}
                </div>
                <div className="text-right">
                    <p className="text-xs text-blue-200 font-bold">Pelapor</p>
                    <p className="text-xs text-white truncate max-w-[150px]">{user?.email}</p>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN FORM CARD --- */}
      <div className="max-w-5xl mx-auto px-4 -mt-24 relative z-20">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* KOLOM KIRI: Input Data Utama */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
              {/* Progress Line */}
              <div className={`h-1.5 w-full ${isLost ? 'bg-orange-500' : 'bg-[#0a1e3f]'}`}></div>
              
              <div className="p-8">
                
                {/* 1. Toggle Jenis Laporan */}
                <h3 className="font-bold text-[#0a1e3f] mb-4 flex items-center gap-2 text-lg">
                  <Info size={20} className={isLost ? "text-orange-500" : "text-blue-600"} /> 
                  Jenis Laporan
                </h3>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {/* Tombol Kehilangan */}
                  <label className={`cursor-pointer border-2 rounded-2xl p-5 text-center transition-all duration-300 relative overflow-hidden group
                    ${isLost ? 'border-orange-500 bg-orange-50 shadow-md' : 'border-slate-100 hover:border-orange-200 hover:bg-slate-50'}`}>
                    <input 
                      type="radio" name="tipe_postingan" value="kehilangan" 
                      checked={isLost} onChange={(e) => setForm({...form, tipe_postingan: e.target.value})} className="hidden" 
                    />
                    <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 transition-colors ${isLost ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400 group-hover:text-orange-500'}`}>
                      <AlertTriangle size={24} />
                    </div>
                    <span className={`font-bold block text-lg ${isLost ? 'text-orange-700' : 'text-slate-600'}`}>Kehilangan</span>
                    <span className="text-xs text-slate-400 font-medium">Saya mencari barang</span>
                    {isLost && <div className="absolute top-3 right-3 text-orange-500"><CheckCircle2 size={20} /></div>}
                  </label>

                  {/* Tombol Ditemukan */}
                  <label className={`cursor-pointer border-2 rounded-2xl p-5 text-center transition-all duration-300 relative overflow-hidden group
                    ${!isLost ? 'border-[#0a1e3f] bg-blue-50 shadow-md' : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50'}`}>
                    <input 
                      type="radio" name="tipe_postingan" value="ditemukan" 
                      checked={!isLost} onChange={(e) => setForm({...form, tipe_postingan: e.target.value})} className="hidden" 
                    />
                    <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 transition-colors ${!isLost ? 'bg-[#0a1e3f] text-white' : 'bg-slate-100 text-slate-400 group-hover:text-[#0a1e3f]'}`}>
                      <CheckCircle2 size={24} />
                    </div>
                    <span className={`font-bold block text-lg ${!isLost ? 'text-[#0a1e3f]' : 'text-slate-600'}`}>Menemukan</span>
                    <span className="text-xs text-slate-400 font-medium">Saya menemukan barang</span>
                    {!isLost && <div className="absolute top-3 right-3 text-[#0a1e3f]"><CheckCircle2 size={20} /></div>}
                  </label>
                </div>

                {/* 2. Form Input Fields */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Nama Barang</label>
                    <input type="text" required 
                      className={`w-full px-5 py-3.5 rounded-xl border bg-slate-50 focus:bg-white outline-none transition font-medium
                        ${isLost ? 'focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10' : 'focus:border-[#0a1e3f] focus:ring-4 focus:ring-blue-900/10'} border-slate-200`}
                      placeholder={isLost ? "Contoh: Dompet Kulit Coklat" : "Contoh: Kunci Motor Honda"}
                      value={form.nama_barang} onChange={e => setForm({...form, nama_barang: e.target.value})} 
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Kategori</label>
                        <div className="relative">
                        <select 
                            required
                            className={`w-full px-5 py-3.5 rounded-xl border bg-slate-50 focus:bg-white outline-none transition appearance-none cursor-pointer
                            ${isLost ? 'focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10' : 'focus:border-[#0a1e3f] focus:ring-4 focus:ring-blue-900/10'} border-slate-200`}
                            value={form.id_kategori} onChange={e => setForm({...form, id_kategori: e.target.value})}
                        >
                            <option value="">Pilih Kategori...</option>
                            {kategoriList.map((cat) => (
                            <option key={cat.id_kategori} value={cat.id_kategori}>{cat.nama_kategori}</option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                            <Calendar size={16} className={isLost ? "text-orange-500" : "text-[#0a1e3f]"} /> Waktu Kejadian
                        </label>
                        <input type="datetime-local" required 
                            className={`w-full px-5 py-3.5 rounded-xl border bg-slate-50 focus:bg-white outline-none transition text-slate-600
                            ${isLost ? 'focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10' : 'focus:border-[#0a1e3f] focus:ring-4 focus:ring-blue-900/10'} border-slate-200`}
                            value={form.waktu_kejadian} onChange={e => setForm({...form, waktu_kejadian: e.target.value})} 
                        />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                        <MapPin size={16} className={isLost ? "text-orange-500" : "text-[#0a1e3f]"} /> Lokasi Detail
                    </label>
                    <input type="text" required 
                      className={`w-full px-5 py-3.5 rounded-xl border bg-slate-50 focus:bg-white outline-none transition
                        ${isLost ? 'focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10' : 'focus:border-[#0a1e3f] focus:ring-4 focus:ring-blue-900/10'} border-slate-200`}
                      placeholder="Contoh: Gedung Rektorat Lantai 1, dekat Lift"
                      value={form.lokasi} onChange={e => setForm({...form, lokasi: e.target.value})} 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Deskripsi Lengkap</label>
                    <textarea rows="4" required 
                      className={`w-full px-5 py-3.5 rounded-xl border bg-slate-50 focus:bg-white outline-none transition resize-none
                        ${isLost ? 'focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10' : 'focus:border-[#0a1e3f] focus:ring-4 focus:ring-blue-900/10'} border-slate-200`}
                      placeholder="Jelaskan ciri-ciri khusus, warna, isi barang, nomor seri, atau kondisi barang..."
                      value={form.deskripsi} onChange={e => setForm({...form, deskripsi: e.target.value})} 
                    />
                  </div>

                  {/* Pertanyaan Keamanan (Khusus Temuan) */}
                  {!isLost && (
                    <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 mt-4">
                      <label className="block text-sm font-bold text-[#0a1e3f] mb-2 flex items-center gap-2">
                        <HelpCircle size={18} /> Pertanyaan Validasi (Opsional)
                      </label>
                      <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                        Untuk keamanan, buatlah satu pertanyaan yang hanya bisa dijawab oleh pemilik asli barang. 
                        <br/><i>Contoh: "Apa gambar wallpaper HP-nya?" atau "Apa isi gantungan kuncinya?"</i>
                      </p>
                      <input type="text" 
                        className="w-full px-5 py-3.5 rounded-xl border border-blue-200 bg-white focus:border-[#0a1e3f] focus:ring-4 focus:ring-blue-900/10 outline-none transition"
                        placeholder="Tulis pertanyaan validasi..."
                        value={form.pertanyaan_keamanan} onChange={e => setForm({...form, pertanyaan_keamanan: e.target.value})} 
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* KOLOM KANAN: Upload & Actions */}
          <div className="space-y-6">
            
            {/* Card Upload */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6">
              <h3 className="font-bold text-[#0a1e3f] mb-4 flex items-center gap-2">
                <Camera size={20} className={isLost ? "text-orange-500" : "text-blue-600"} /> Foto Barang
              </h3>
              
              <div className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300 relative group overflow-hidden
                ${form.foto_barang 
                    ? 'border-green-400 bg-green-50/20' 
                    : isLost 
                        ? 'border-slate-300 hover:border-orange-400 hover:bg-orange-50/20' 
                        : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50/20'}`}>
                
                <input 
                  type="file" accept="image/*" onChange={handleFileChange} disabled={uploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />

                {uploading ? (
                  <div className="py-10 flex flex-col items-center">
                    <Loader2 className={`animate-spin mb-3 ${isLost ? 'text-orange-500' : 'text-[#0a1e3f]'}`} size={36} />
                    <span className="text-sm font-bold text-slate-600">Sedang Mengupload...</span>
                  </div>
                ) : form.foto_barang ? (
                  <div className="relative">
                    <img src={form.foto_barang} alt="Preview" className="w-full h-56 object-contain rounded-xl bg-white shadow-sm border border-slate-100 p-2" />
                    <button 
                      onClick={(e) => { e.preventDefault(); setForm(f => ({...f, foto_barang: null})); }}
                      className="absolute top-2 right-2 bg-white text-red-500 p-2 rounded-full shadow-md hover:bg-red-50 transition z-20"
                    >
                      <X size={18} />
                    </button>
                    <div className="mt-4 flex items-center justify-center gap-2 text-green-700 text-sm font-bold bg-green-100 py-2 rounded-lg">
                      <CheckCircle2 size={18} /> Foto Berhasil Diupload
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Klik area ini untuk mengganti foto</p>
                  </div>
                ) : (
                  <div className="py-10">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors
                        ${isLost ? 'bg-orange-50 text-orange-500 group-hover:bg-orange-500 group-hover:text-white' : 'bg-blue-50 text-blue-600 group-hover:bg-[#0a1e3f] group-hover:text-white'}`}>
                      <UploadCloud size={32} />
                    </div>
                    <p className="text-base font-bold text-slate-700">Upload Foto Barang</p>
                    <p className="text-xs text-slate-400 mt-1">Format JPG/PNG, Maksimal 2MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Info Card */}
            <div className={`rounded-2xl p-6 border ${isLost ? 'bg-orange-50 border-orange-100' : 'bg-blue-50 border-blue-100'}`}>
              <h4 className={`font-bold text-sm flex items-center gap-2 mb-3 ${isLost ? 'text-orange-800' : 'text-blue-900'}`}>
                <AlertTriangle size={18} /> Penting!
              </h4>
              <ul className={`text-xs space-y-2 list-disc list-inside ${isLost ? 'text-orange-700' : 'text-blue-800'}`}>
                <li>Pastikan data yang Anda masukkan jujur & akurat.</li>
                <li>Gunakan bahasa yang sopan dan jelas.</li>
                <li>Laporan palsu dapat dikenakan sanksi akademik.</li>
              </ul>
            </div>

            {/* Tombol Submit */}
            <button 
              type="submit" 
              disabled={loading || uploading}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-xl transition-all transform active:scale-[0.98] flex justify-center items-center gap-3 text-lg
                ${isLost 
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-orange-500/30' 
                  : 'bg-gradient-to-r from-[#0a1e3f] to-blue-900 hover:from-blue-900 hover:to-blue-950 shadow-blue-900/30'}
                ${(loading || uploading) ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <><Loader2 className="animate-spin" /> Memproses...</>
              ) : (
                isLost ? <>PUBLIKASIKAN KEHILANGAN <ArrowLeft className="rotate-180" size={20}/></> : <>PUBLIKASIKAN TEMUAN <CheckCircle2 size={20}/></>
              )}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
};

export default LaporBarang;