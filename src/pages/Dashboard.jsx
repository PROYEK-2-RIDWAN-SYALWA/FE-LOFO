import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {/* Navbar Atas */}
      <nav className="bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center px-8">
        <h1 className="text-xl font-bold text-yellow-400 tracking-wider">LOST & FOUND</h1>
        <div className="flex gap-4 items-center">
          <span className="text-sm text-gray-400 hidden sm:block">
            {user?.email}
          </span>
          {/* Tombol ke Profil */}
          <Link to="/profile" className="bg-blue-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition">
            Edit Profil
          </Link>
          <button onClick={signOut} className="bg-red-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition">
            Logout
          </button>
        </div>
      </nav>

      {/* Konten Utama */}
      <div className="container mx-auto p-8 pt-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold mb-3">Pusat Laporan Kehilangan</h2>
          <p className="text-gray-400 text-lg">Pilih kategori di bawah untuk mulai melapor</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* KARTU 1: SAYA KEHILANGAN BARANG */}
          <div 
            onClick={() => navigate('/lapor', { state: { tipe: 'kehilangan' } })}
            className="group bg-gray-800 p-10 rounded-2xl border border-gray-700 hover:border-red-500 cursor-pointer transition-all duration-300 hover:shadow-[0_0_30px_rgba(239,68,68,0.2)]"
          >
            <div className="h-20 w-20 bg-red-900/30 rounded-full flex items-center justify-center mb-6 group-hover:bg-red-600 transition-colors mx-auto">
              <span className="text-4xl">🔍</span>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-center text-red-400 group-hover:text-red-300">Saya Kehilangan Barang</h3>
            <p className="text-gray-400 text-center leading-relaxed">
              Buat laporan kehilangan agar penemu bisa menghubungi Anda segera.
            </p>
          </div>

          {/* KARTU 2: SAYA MENEMUKAN BARANG */}
          <div 
            onClick={() => navigate('/lapor', { state: { tipe: 'ditemukan' } })}
            className="group bg-gray-800 p-10 rounded-2xl border border-gray-700 hover:border-green-500 cursor-pointer transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,197,94,0.2)]"
          >
            <div className="h-20 w-20 bg-green-900/30 rounded-full flex items-center justify-center mb-6 group-hover:bg-green-600 transition-colors mx-auto">
              <span className="text-4xl">🎁</span>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-center text-green-400 group-hover:text-green-300">Saya Menemukan Barang</h3>
            <p className="text-gray-400 text-center leading-relaxed">
              Laporkan barang temuan untuk dikembalikan kepada pemilik yang sah.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;