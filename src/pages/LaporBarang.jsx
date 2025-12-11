import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createPost, fetchKategoriList } from '../services/api';
import { supabase } from '../services/supabaseClient'; // Import Client Supabase untuk Storage
import { 
  ArrowLeft, UploadCloud, MapPin, Calendar, FileText, 
  HelpCircle, AlertCircle, Camera, Loader2, X
} from 'lucide-react';

const LaporBarang = () => {
  const { state } = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const tipe = state?.tipe || 'kehilangan'; 
  const isLost = tipe === 'kehilangan';

  // State Form
  const [form, setForm] = useState({
    nama_barang: '',
    id_kategori: '', // Menggunakan ID (Integer)
    deskripsi: '',
    lokasi: '',
    waktu_kejadian: '',
    pertanyaan_keamanan: '', 
    foto_url: '' 
  });

  // State Pendukung
  const [file, setFile] = useState(null); // File mentah
  const [previewUrl, setPreviewUrl] = useState(null); // Preview gambar lokal
  const [kategoriList, setKategoriList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 1. Load Kategori dari Database (Bukan Hardcode)
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchKategoriList();
        setKategoriList(data);
      } catch (err) {
        console.error("Gagal load kategori", err);
      }
    };
    loadData();
  }, []);

  // 2. Handle File Selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validasi Ukuran (Max 2MB)
    if (selectedFile.size > 2 * 1024 * 1024) {
      alert("Ukuran file terlalu besar! Maksimal 2MB.");
      return;
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  // 3. Upload ke Supabase Storage
  const uploadImage = async (file) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('post-images') // Pastikan nama bucket sesuai di Dashboard Supabase
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Ambil Public URL
      const { data } = supabase.storage
        .from('post-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error("Upload Error:", error);
      throw new Error("Gagal mengupload gambar. " + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.id_kategori) return alert('Harap pilih kategori barang!');
    
    if (!confirm('Apakah data yang Anda masukkan sudah benar?')) return;

    setLoading(true);
    try {
      let finalFotoUrl = form.foto_url;

      // Jika ada file yang dipilih, upload dulu
      if (file) {
        setUploading(true);
        finalFotoUrl = await uploadImage(file);
        setUploading(false);
      }

      // Kirim data ke Backend Express
      await createPost({
        auth_id: user.id,
        tipe_postingan: tipe,
        nama_barang: form.nama_barang,
        id_kategori: form.id_kategori, // Kirim ID Kategori
        deskripsi: form.deskripsi,
        lokasi: form.lokasi,
        waktu_kejadian: form.waktu_kejadian, 
        foto_barang: finalFotoUrl
      });
      
      alert('Laporan berhasil dipublikasikan!');
      navigate('/dashboard');
    } catch (error) {
      alert('Gagal: ' + error.message);
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans py-10 px-4">
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-[#0a1e3f] font-medium bg-white px-4 py-2 rounded-full shadow-sm border">
          <ArrowLeft size={18} /> Batal
        </Link>
        <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${isLost ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
          {isLost ? 'Lapor Kehilangan' : 'Lapor Penemuan'}
        </div>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* KOLOM KIRI: Form Input */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className={`h-2 w-full ${isLost ? 'bg-red-500' : 'bg-green-500'}`}></div>
            <div className="p-8">
              <h2 className="text-2xl font-bold text-[#0a1e3f] mb-6">Detail Barang</h2>

              <form id="laporForm" onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Nama Barang</label>
                  <input type="text" required className="input-field w-full p-3 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder={isLost ? "Contoh: Laptop ASUS ROG" : "Contoh: Kunci Motor"}
                    value={form.nama_barang} onChange={e => setForm({...form, nama_barang: e.target.value})} />
                </div>

                {/* Kategori Dinamis */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">Kategori Barang</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {kategoriList.length > 0 ? kategoriList.map((cat) => (
                      <button
                        key={cat.id_kategori}
                        type="button"
                        onClick={() => setForm({...form, id_kategori: cat.id_kategori})}
                        className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                          form.id_kategori === cat.id_kategori
                            ? 'bg-[#0a1e3f] text-white border-[#0a1e3f] shadow-md' 
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {cat.nama_kategori}
                      </button>
                    )) : (
                      <div className="col-span-3 text-center text-slate-400 text-sm py-4">Memuat Kategori...</div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Deskripsi Detail</label>
                  <textarea rows="4" required className="w-full p-3 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Warna, ciri khusus, nomor seri, isi, dll..."
                    value={form.deskripsi} onChange={e => setForm({...form, deskripsi: e.target.value})} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2"><MapPin size={16} className="inline text-orange-500 mr-1"/> Lokasi</label>
                    <input type="text" required className="w-full p-3 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Gedung / Ruangan"
                      value={form.lokasi} onChange={e => setForm({...form, lokasi: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2"><Calendar size={16} className="inline text-blue-500 mr-1"/> Waktu</label>
                    <input type="datetime-local" required className="w-full p-3 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none text-slate-600"
                      value={form.waktu_kejadian} onChange={e => setForm({...form, waktu_kejadian: e.target.value})} />
                  </div>
                </div>

                {/* Pertanyaan Keamanan (Hanya untuk Temuan agar validasi pemilik mudah) */}
                {!isLost && (
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <label className="block text-sm font-bold text-[#0a1e3f] mb-2 flex items-center gap-2">
                      <HelpCircle size={16} /> Pertanyaan Validasi
                    </label>
                    <input type="text" className="w-full bg-white border border-blue-200 rounded-lg p-3 outline-none"
                      placeholder="Contoh: Apa isi wallpaper HP-nya?"
                      value={form.pertanyaan_keamanan} onChange={e => setForm({...form, pertanyaan_keamanan: e.target.value})} />
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: Upload Foto */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-[#0a1e3f] mb-4 flex items-center gap-2"><Camera size={20} /> Foto Barang</h3>
            
            {/* Upload Area */}
            {!previewUrl ? (
              <label className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer flex flex-col items-center justify-center h-48">
                <div className="w-12 h-12 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-3">
                  <UploadCloud size={24} />
                </div>
                <p className="text-sm font-medium text-slate-600">Klik untuk upload foto</p>
                <p className="text-xs text-slate-400 mt-1">Maksimal 2MB (JPG/PNG)</p>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            ) : (
              <div className="relative rounded-xl overflow-hidden h-48 border border-slate-200 group">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                <button 
                  onClick={() => { setFile(null); setPreviewUrl(null); }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          <div className="bg-orange-50 rounded-2xl p-5 border border-orange-100">
            <h4 className="text-orange-800 font-bold text-sm flex items-center gap-2 mb-2"><AlertCircle size={16} /> Penting!</h4>
            <ul className="text-xs text-orange-700 space-y-1.5 list-disc list-inside">
              <li>Pastikan data jujur & akurat.</li>
              <li>Laporan palsu dapat dikenakan sanksi.</li>
            </ul>
          </div>

          <button type="submit" form="laporForm" disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 flex justify-center items-center gap-2 ${
              isLost ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
            }`}>
            {loading ? (
              <><Loader2 className="animate-spin" /> {uploading ? 'Mengupload Foto...' : 'Memproses...'}</>
            ) : (
              isLost ? 'PUBLIKASIKAN KEHILANGAN' : 'PUBLIKASIKAN TEMUAN'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LaporBarang;