import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; //merah doang g ngaruh
import { createPost, fetchCategories } from '../services/api';
import { supabase } from '../services/supabaseClient'; 
// PERBAIKAN: Menambahkan AlertCircle ke dalam import
import { 
  ArrowLeft, UploadCloud, MapPin, Calendar, FileText, 
  HelpCircle, Camera, Loader2, X, AlertTriangle, CheckCircle, Info, AlertCircle 
} from 'lucide-react';

const LaporBarang = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  // Default tipe dari navigasi sebelumnya, atau default 'kehilangan'
  const tipe = state?.tipe || 'kehilangan'; 
  
  // State Form
  const [form, setForm] = useState({
    nama_barang: '',
    id_kategori: '',
    deskripsi: '',
    lokasi: '',
    waktu_kejadian: '',
    pertanyaan_keamanan: '', 
    foto_barang: null, 
    tipe_postingan: tipe
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
      
      {/* Header Area */}
      <div className="bg-[#0a1e3f] pb-32 pt-8 px-4 relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors mb-6 text-sm font-medium"
          >
            <ArrowLeft size={18} /> Kembali ke Dashboard
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">Formulir Pelaporan</h1>
          <p className="text-blue-200">Isi detail barang dengan lengkap untuk mempercepat proses pencarian.</p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
      </div>

      {/* Main Content (Floating Card) */}
      <div className="max-w-5xl mx-auto px-4 -mt-24 relative z-20">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* KOLOM KIRI: Input Data */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
              <div className="p-8">
                
                {/* 1. Toggle Tipe Laporan */}
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Info size={18} className="text-[#f97316]" /> Jenis Laporan
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <label className={`cursor-pointer border-2 rounded-2xl p-4 text-center transition-all duration-300 relative overflow-hidden group
                    ${isLost ? 'border-red-500 bg-red-50' : 'border-slate-100 hover:border-red-200 hover:bg-slate-50'}`}>
                    <input 
                      type="radio" name="tipe_postingan" value="kehilangan" 
                      checked={isLost} onChange={(e) => setForm({...form, tipe_postingan: e.target.value})} className="hidden" 
                    />
                    <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 transition-colors ${isLost ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      <AlertTriangle size={20} />
                    </div>
                    <span className={`font-bold block ${isLost ? 'text-red-700' : 'text-slate-600'}`}>Kehilangan</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Saya Mencari Barang</span>
                  </label>

                  <label className={`cursor-pointer border-2 rounded-2xl p-4 text-center transition-all duration-300 relative overflow-hidden group
                    ${!isLost ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 hover:border-emerald-200 hover:bg-slate-50'}`}>
                    <input 
                      type="radio" name="tipe_postingan" value="ditemukan" 
                      checked={!isLost} onChange={(e) => setForm({...form, tipe_postingan: e.target.value})} className="hidden" 
                    />
                    <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 transition-colors ${!isLost ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      <CheckCircle size={20} />
                    </div>
                    <span className={`font-bold block ${!isLost ? 'text-emerald-700' : 'text-slate-600'}`}>Menemukan</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Saya Menemukan Barang</span>
                  </label>
                </div>

                {/* 2. Form Input Fields */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Nama Barang</label>
                    <input type="text" required 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#f97316] focus:ring-4 focus:ring-orange-100 outline-none transition font-medium"
                      placeholder={isLost ? "Contoh: Laptop ASUS ROG" : "Contoh: Kunci Motor Honda"}
                      value={form.nama_barang} onChange={e => setForm({...form, nama_barang: e.target.value})} 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Kategori</label>
                    <div className="relative">
                      <select 
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#f97316] focus:ring-4 focus:ring-orange-100 outline-none transition appearance-none cursor-pointer"
                        value={form.id_kategori} onChange={e => setForm({...form, id_kategori: e.target.value})}
                      >
                        <option value="">Pilih Kategori Barang...</option>
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
                    <label className="block text-sm font-bold text-slate-700 mb-2">Deskripsi Detail</label>
                    <textarea rows="4" required 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#f97316] focus:ring-4 focus:ring-orange-100 outline-none transition resize-none"
                      placeholder="Jelaskan ciri-ciri khusus, warna, isi barang, nomor seri, dll..."
                      value={form.deskripsi} onChange={e => setForm({...form, deskripsi: e.target.value})} 
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                        <MapPin size={16} className="text-[#f97316]" /> Lokasi
                      </label>
                      <input type="text" required 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#f97316] focus:ring-4 focus:ring-orange-100 outline-none transition"
                        placeholder="Gedung / Ruangan"
                        value={form.lokasi} onChange={e => setForm({...form, lokasi: e.target.value})} 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                        <Calendar size={16} className="text-[#f97316]" /> Waktu
                      </label>
                      <input type="datetime-local" required 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#f97316] focus:ring-4 focus:ring-orange-100 outline-none transition text-slate-600"
                        value={form.waktu_kejadian} onChange={e => setForm({...form, waktu_kejadian: e.target.value})} 
                      />
                    </div>
                  </div>

                  {/* Pertanyaan Keamanan (Khusus Temuan) */}
                  {!isLost && (
                    <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 mt-4">
                      <label className="block text-sm font-bold text-[#0a1e3f] mb-2 flex items-center gap-2">
                        <HelpCircle size={18} /> Pertanyaan Validasi (Opsional)
                      </label>
                      <p className="text-xs text-blue-400 mb-3">
                        Pertanyaan rahasia untuk memverifikasi pemilik asli barang. Contoh: "Apa gambar wallpaper HP-nya?"
                      </p>
                      <input type="text" 
                        className="w-full px-4 py-3 rounded-xl border border-blue-200 bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition"
                        placeholder="Tulis pertanyaan validasi..."
                        value={form.pertanyaan_keamanan} onChange={e => setForm({...form, pertanyaan_keamanan: e.target.value})} 
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* KOLOM KANAN: Upload Foto & Submit */}
          <div className="space-y-6">
            
            {/* Card Upload */}
            <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 p-6">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Camera size={20} className="text-[#f97316]" /> Foto Barang
              </h3>
              
              <div className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300 relative group
                ${form.foto_barang ? 'border-green-400 bg-green-50/30' : 'border-slate-300 hover:border-[#f97316] hover:bg-orange-50/30'}`}>
                
                <input 
                  type="file" accept="image/*" onChange={handleFileChange} disabled={uploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />

                {uploading ? (
                  <div className="py-8 flex flex-col items-center">
                    <Loader2 className="animate-spin text-[#f97316] mb-2" size={32} />
                    <span className="text-sm font-medium text-slate-500">Mengupload...</span>
                  </div>
                ) : form.foto_barang ? (
                  <div className="relative">
                    <img src={form.foto_barang} alt="Preview" className="w-full h-48 object-contain rounded-lg bg-white shadow-sm p-2" />
                    <button 
                      onClick={(e) => { e.preventDefault(); setForm(f => ({...f, foto_barang: null})); }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md hover:bg-red-600 z-20"
                    >
                      <X size={14} />
                    </button>
                    <div className="mt-3 flex items-center justify-center gap-1 text-green-600 text-sm font-bold">
                      <CheckCircle size={16} /> Foto Terupload
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Klik untuk mengganti</p>
                  </div>
                ) : (
                  <div className="py-8">
                    <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-white group-hover:text-[#f97316] transition-colors shadow-sm">
                      <UploadCloud size={28} />
                    </div>
                    <p className="text-sm font-bold text-slate-700">Upload Foto</p>
                    <p className="text-xs text-slate-400 mt-1">Max 2MB (JPG/PNG)</p>
                  </div>
                )}
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-orange-50 rounded-2xl p-5 border border-orange-100">
              <h4 className="text-orange-800 font-bold text-sm flex items-center gap-2 mb-2"><AlertCircle size={16} /> Penting!</h4>
              <ul className="text-xs text-orange-700 space-y-2 list-disc list-inside opacity-90">
                <li>Pastikan data yang Anda masukkan jujur & akurat.</li>
                <li>Laporan palsu dapat dikenakan sanksi akademik.</li>
              </ul>
            </div>

            {/* Tombol Submit */}
            <button 
              type="submit" 
              disabled={loading || uploading}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-xl transition-all transform active:scale-[0.98] flex justify-center items-center gap-2
                ${isLost ? 'bg-[#0a1e3f] hover:bg-[#1e3a8a] shadow-blue-900/20' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20'}
                ${(loading || uploading) ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <><Loader2 className="animate-spin" /> Memproses...</>
              ) : (
                isLost ? 'PUBLIKASIKAN KEHILANGAN' : 'PUBLIKASIKAN TEMUAN'
              )}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
};

export default LaporBarang;