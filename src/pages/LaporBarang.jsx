import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createPost } from '../services/api';

const LaporBarang = () => {
  const { state } = useLocation(); // Terima data 'tipe' dari Dashboard
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Default ke 'kehilangan' jika akses langsung tanpa lewat dashboard
  const tipe = state?.tipe || 'kehilangan'; 
  const isLost = tipe === 'kehilangan';

  const [form, setForm] = useState({
    nama_barang: '',
    deskripsi: '',
    lokasi: '',
    foto_url: '' // Nanti diganti upload Cloudinary
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!confirm('Apakah data sudah benar?')) return;

    setLoading(true);
    try {
      await createPost({
        auth_id: user.id, // ID User Supabase
        tipe_postingan: tipe,
        nama_barang: form.nama_barang,
        deskripsi: form.deskripsi,
        lokasi: form.lokasi,
        foto_barang: form.foto_url
      });
      
      alert('Laporan berhasil dipublikasikan!');
      navigate('/');
    } catch (error) {
      alert('Gagal: ' + error.message);
      if (error.message.includes('Lengkapi profil')) navigate('/profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex justify-center">
      <div className={`w-full max-w-2xl p-8 rounded-xl border-2 shadow-2xl ${isLost ? 'border-red-500 bg-gray-800' : 'border-green-500 bg-gray-800'}`}>
        
        <h2 className={`text-3xl font-bold mb-6 text-center ${isLost ? 'text-red-400' : 'text-green-400'}`}>
          Form Laporan {isLost ? 'Kehilangan' : 'Penemuan'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nama Barang */}
          <div>
            <label className="block text-sm font-medium mb-1">Nama Barang</label>
            <input 
              type="text" required
              className="w-full bg-gray-700 border border-gray-600 rounded p-3 focus:outline-none focus:border-blue-500"
              placeholder={isLost ? "Contoh: Dompet Coklat Levi's" : "Contoh: Kunci Motor Honda"}
              value={form.nama_barang}
              onChange={e => setForm({...form, nama_barang: e.target.value})}
            />
          </div>

          {/* Lokasi */}
          <div>
            <label className="block text-sm font-medium mb-1">
              {isLost ? 'Lokasi Terakhir Dilihat (Perkiraan)' : 'Lokasi Ditemukan'}
            </label>
            <input 
              type="text" required
              className="w-full bg-gray-700 border border-gray-600 rounded p-3 focus:outline-none focus:border-blue-500"
              placeholder="Contoh: Kantin Gedung D4, Meja No. 5"
              value={form.lokasi}
              onChange={e => setForm({...form, lokasi: e.target.value})}
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-medium mb-1">Deskripsi Detail</label>
            <textarea 
              rows="4" required
              className="w-full bg-gray-700 border border-gray-600 rounded p-3 focus:outline-none focus:border-blue-500"
              placeholder="Warna, ciri khusus, isi di dalamnya, dll..."
              value={form.deskripsi}
              onChange={e => setForm({...form, deskripsi: e.target.value})}
            />
          </div>

          {/* Foto (URL Dulu) */}
          <div>
            <label className="block text-sm font-medium mb-1">Link Foto (Opsional)</label>
            <input 
              type="text" 
              className="w-full bg-gray-700 border border-gray-600 rounded p-3 text-sm"
              placeholder="Tempel link gambar dari internet dulu (Cloudinary menyusul)"
              value={form.foto_url}
              onChange={e => setForm({...form, foto_url: e.target.value})}
            />
          </div>

          <button 
            type="submit" disabled={loading}
            className={`w-full py-4 rounded font-bold text-lg mt-4 transition transform hover:scale-[1.02] ${
              isLost ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading ? 'Mengirim Data...' : 'PUBLIKASIKAN LAPORAN'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LaporBarang;