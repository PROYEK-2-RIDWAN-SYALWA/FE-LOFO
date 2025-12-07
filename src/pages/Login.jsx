import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
// HAPUS import supabase karena tidak dipakai langsung lagi
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';

const Login = () => {
  const [identifier, setIdentifier] = useState(''); // Bisa Email atau Username
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Panggil signIn dari AuthContext (yang sudah dimodifikasi ke Backend)
      const { error } = await signIn({ identifier, password });
      
      if (error) throw error;
      
      // Jika sukses, redirect ke dashboard
      navigate('/dashboard');

    } catch (err) {
      console.error(err);
      setError(err.message || 'Login Gagal: Periksa username/email dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Kiri: Ilustrasi */}
        <div className="md:w-1/2 bg-blue-900 p-10 text-white flex flex-col justify-center relative">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <h2 className="text-4xl font-bold mb-4 z-10">Selamat Datang Kembali!</h2>
          <p className="text-blue-100 z-10 mb-8">
            Masuk untuk memantau status laporan kehilangan atau melaporkan barang temuan di lingkungan ULBI.
          </p>
          <div className="z-10 text-sm opacity-80">&copy; 2025 ULBI Lost & Found System</div>
        </div>

        {/* Kanan: Form Login */}
        <div className="md:w-1/2 p-10 flex flex-col justify-center">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900">Login Akun</h3>
            <p className="text-sm text-gray-500">Masukkan kredensial Anda untuk melanjutkan.</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 text-sm" role="alert">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username atau Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input 
                  type="text" required 
                  value={identifier} onChange={(e) => setIdentifier(e.target.value)}
                  className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition" 
                  placeholder="Username atau nama@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input 
                  type="password" required 
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition" 
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700 transition flex items-center justify-center gap-2 shadow-lg hover:shadow-orange-200"
            >
              {loading ? 'Memuat...' : (
                <>Masuk Sistem <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Belum punya akun? <Link to="/register" className="text-blue-900 font-bold hover:underline">Daftar Sekarang</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;