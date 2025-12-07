import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createPost } from '../services/api';
import { 
  ArrowLeft, UploadCloud, MapPin, Calendar, Tag, FileText, 
  HelpCircle, AlertCircle, CheckCircle, Camera, Laptop, 
  Briefcase, Key, Watch, Shirt 
} from 'lucide-react';

const LaporBarang = () => {
  const { state } = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Default ke 'kehilangan' jika akses langsung
  const tipe = state?.tipe || 'kehilangan'; 
  const isLost = tipe === 'kehilangan';

  const [form, setForm] = useState({
    nama_barang: '',
    kategori: '',
    deskripsi: '',
    lokasi: '',
    waktu_kejadian: '',
    pertanyaan_keamanan: '', // Fitur baru: Untuk verifikasi pemilik asli
    foto_url: '' 
  });
  
  const [loading, setLoading] = useState(false);

  // Daftar Kategori dengan Ikon
  const categories = [
    { id: 'Elektronik', label: 'Elektronik', icon: <Laptop size={20}/> },
    { id: 'Dokumen', label: 'Dokumen', icon: <FileText size={20}/> },
    { id: 'Tas/Dompet', label: 'Tas & Dompet', icon: <Briefcase size={20}/> },
    { id: 'Kunci', label: 'Kunci', icon: <Key size={20}/> },
    { id: 'Pakaian', label: 'Pakaian', icon: <Shirt size={20}/> },
    { id: 'Aksesoris', label: 'Aksesoris', icon: <Watch size={20}/> },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.kategori) return alert('Harap pilih kategori barang!');
    
    if (!confirm('Apakah data yang Anda masukkan sudah benar?')) return;

    setLoading(true);
    try {
      await createPost({
        auth_id: user.id,
        tipe_postingan: tipe,
        nama_barang: form.nama_barang,
        kategori: form.kategori,
        deskripsi: form.deskripsi,
        lokasi: form.lokasi,
        waktu_kejadian: form.waktu_kejadian, // Field baru (pastikan backend support atau masukkan ke deskripsi)
        foto_barang: form.foto_url
      });
      
      alert('Laporan berhasil dipublikasikan!');
      navigate('/dashboard');
    } catch (error) {
      alert('Gagal: ' + error.message);
      if (error.message.includes('Lengkapi profil')) navigate('/profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans py-10 px-4">
      
      {/* Header & Navigasi Balik */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between">
        <Link 
          to="/dashboard" 
          className="flex items-center gap-2 text-slate-500 hover:text-[#0a1e3f] font-medium transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200"
        >
          <ArrowLeft size={18} /> Batal & Kembali
        </Link>
        <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${isLost ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
          Mode: {isLost ? 'Lapor Kehilangan' : 'Lapor Penemuan'}
        </div>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* KOLOM KIRI: Informasi Utama */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className={`h-2 w-full ${isLost ? 'bg-red-500' : 'bg-green-500'}`}></div>
            <div className="p-8">
              <h2 className="text-2xl font-bold text-[#0a1e3f] mb-1">Detail Barang</h2>
              <p className="text-slate-500 text-sm mb-8">Berikan informasi selengkap mungkin untuk memudahkan pencarian.</p>

              <form id="laporForm" onSubmit={handleSubmit} className="space-y-6">
                
                {/* Nama Barang */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Nama Barang</label>
                  <input 
                    type="text" required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all font-medium text-slate-800 placeholder:text-slate-400"
                    placeholder={isLost ? "Contoh: Laptop ASUS ROG Hitam" : "Contoh: Kunci Motor Honda"}
                    value={form.nama_barang}
                    onChange={e => setForm({...form, nama_barang: e.target.value})}
                  />
                </div>

                {/* Kategori (Pilihan Grid) */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">Kategori Barang</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setForm({...form, kategori: cat.id})}
                        className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                          form.kategori === cat.id 
                            ? 'bg-[#0a1e3f] text-white border-[#0a1e3f] shadow-md' 
                            : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300 hover:bg-orange-50'
                        }`}
                      >
                        {cat.icon} {cat.label}
                        {form.kategori === cat.id && <CheckCircle size={16} className="ml-auto text-orange-400" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Deskripsi */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Deskripsi Detail</label>
                  <textarea 
                    rows="4" required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-slate-800 placeholder:text-slate-400"
                    placeholder="Warna, ciri khusus, nomor seri, isi di dalamnya, goresan, dll..."
                    value={form.deskripsi}
                    onChange={e => setForm({...form, deskripsi: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Lokasi */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-orange-500" /> 
                        {isLost ? 'Lokasi Terakhir Dilihat' : 'Lokasi Ditemukan'}
                      </div>
                    </label>
                    <input 
                      type="text" required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-500 outline-none"
                      placeholder="Gedung / Ruangan"
                      value={form.lokasi}
                      onChange={e => setForm({...form, lokasi: e.target.value})}
                    />
                  </div>

                  {/* Waktu */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-blue-500" /> 
                        Waktu Kejadian
                      </div>
                    </label>
                    <input 
                      type="datetime-local" required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-500 outline-none text-slate-600"
                      value={form.waktu_kejadian}
                      onChange={e => setForm({...form, waktu_kejadian: e.target.value})}
                    />
                  </div>
                </div>

                {/* Pertanyaan Keamanan (Opsional) */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <label className="block text-sm font-bold text-[#0a1e3f] mb-2 flex items-center gap-2">
                    <HelpCircle size={16} /> Pertanyaan Validasi (Opsional)
                  </label>
                  <p className="text-xs text-slate-500 mb-3">
                    Berikan satu pertanyaan unik yang hanya bisa dijawab oleh pemilik asli. (Misal: "Apa warna casing HP-nya?", "Ada stiker apa di laptop?")
                  </p>
                  <input 
                    type="text" 
                    className="w-full bg-white border border-blue-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-400"
                    placeholder="Tulis pertanyaan keamanan..."
                    value={form.pertanyaan_keamanan}
                    onChange={e => setForm({...form, pertanyaan_keamanan: e.target.value})}
                  />
                </div>

              </form>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: Upload Foto & Submit */}
        <div className="space-y-6">
          
          {/* Kartu Upload Foto */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-[#0a1e3f] mb-4 flex items-center gap-2">
              <Camera size={20} /> Foto Barang
            </h3>
            
            {/* Preview Area (Simulasi) */}
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer group">
              <div className="w-12 h-12 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <UploadCloud size={24} />
              </div>
              <p className="text-sm font-medium text-slate-600">Klik untuk upload foto</p>
              <p className="text-xs text-slate-400 mt-1">atau tempel link gambar di bawah</p>
            </div>

            <div className="mt-4">
              <label className="text-xs font-bold text-slate-500 uppercase">Link Foto (URL)</label>
              <input 
                type="text" 
                className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder="https://..."
                value={form.foto_url}
                onChange={e => setForm({...form, foto_url: e.target.value})}
              />
            </div>

            {/* Preview Gambar jika ada URL */}
            {form.foto_url && (
              <div className="mt-4 rounded-xl overflow-hidden h-40 border border-slate-200">
                <img src={form.foto_url} alt="Preview" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
              </div>
            )}
          </div>

          {/* Info Penting */}
          <div className="bg-orange-50 rounded-2xl p-5 border border-orange-100">
            <h4 className="text-orange-800 font-bold text-sm flex items-center gap-2 mb-2">
              <AlertCircle size={16} /> Penting!
            </h4>
            <ul className="text-xs text-orange-700 space-y-1.5 list-disc list-inside">
              <li>Pastikan data yang Anda isi benar dan jujur.</li>
              <li>Laporan palsu dapat dikenakan sanksi akademik.</li>
              <li>Data Anda akan diverifikasi oleh Dosen Wali.</li>
            </ul>
          </div>

          {/* Tombol Submit */}
          <button 
            type="submit" 
            form="laporForm"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all transform hover:-translate-y-1 active:scale-95 ${
              isLost 
                ? 'bg-red-600 hover:bg-red-700 shadow-red-500/30' 
                : 'bg-green-600 hover:bg-green-700 shadow-green-500/30'
            }`}
          >
            {loading ? 'Sedang Memproses...' : (isLost ? 'PUBLIKASIKAN KEHILANGAN' : 'PUBLIKASIKAN TEMUAN')}
          </button>

        </div>
      </div>
    </div>
  );
};

export default LaporBarang;