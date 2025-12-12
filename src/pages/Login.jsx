import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, fetchUserProfile } from '../services/api'; 
import { supabase } from '../services/supabaseClient'; // PENTING: Import ini
import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Login ke Backend API
      const loginResponse = await loginUser(formData);
      
      // 2. [CRITICAL FIX] Sinkronisasi Session ke Frontend
      // Kita harus memberitahu Supabase Client di frontend bahwa login berhasil
      // agar AuthContext mendeteksi user dan PrivateRoute membuka pintu.
      if (loginResponse.session) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: loginResponse.session.access_token,
          refresh_token: loginResponse.session.refresh_token,
        });
        if (sessionError) throw sessionError;
      }

      // 3. Ambil Profil untuk Cek Role
      const userId = loginResponse.user.id;
      const userProfile = await fetchUserProfile(userId);

      // 4. Redirect Sesuai Role
      if (userProfile && userProfile.id_role === 99) {
        navigate('/admin/dashboard'); // Ke Admin
      } else {
        navigate('/dashboard'); // Ke User Biasa
      }

    } catch (err) {
      console.error("Login Error:", err);
      setError(err.message || 'Login Gagal. Periksa koneksi atau kredensial Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 font-sans">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* BAGIAN KIRI: ILUSTRASI & BRANDING (Split Layout) */}
        <div className="md:w-1/2 bg-[#0a1e3f] p-10 text-white flex flex-col justify-center relative overflow-hidden">
          {/* Dekorasi Background */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <div className="absolute right-0 top-0 w-64 h-64 bg-white rounded-full blur-3xl -mr-16 -mt-16"></div>
             <div className="absolute left-0 bottom-0 w-64 h-64 bg-orange-500 rounded-full blur-3xl -ml-16 -mb-16"></div>
          </div>

          <div className="relative z-10">
            <h2 className="text-4xl font-extrabold mb-6 leading-tight">
              Selamat Datang <br/><span className="text-orange-500">Kembali!</span>
            </h2>
            <p className="text-blue-100 mb-8 text-lg leading-relaxed">
              Masuk untuk memantau status laporan kehilangan atau melaporkan barang temuan di lingkungan ULBI.
            </p>
            <div className="flex items-center gap-2 text-sm text-blue-300/80 font-medium">
              <div className="w-8 h-[1px] bg-orange-500"></div>
              &copy; 2025 ULBI Lost & Found
            </div>
          </div>
        </div>

        {/* BAGIAN KANAN: FORM LOGIN */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-slate-800">Login Akun</h3>
            <p className="text-sm text-slate-500 mt-2">Masukkan kredensial Anda untuk melanjutkan.</p>
          </div>

          {/* Alert Error */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-xl text-sm flex items-start gap-3 animate-pulse">
              <AlertCircle className="flex-shrink-0 mt-0.5" size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Input Identifier */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Username / Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                <input 
                  name="identifier" // PENTING: name harus sesuai state
                  type="text" 
                  required 
                  value={formData.identifier} 
                  onChange={handleChange}
                  className="pl-12 w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-medium text-slate-700" 
                  placeholder="Contoh: 1214001 atau nama@ulbi.ac.id"
                />
              </div>
            </div>

            {/* Input Password */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                <input 
                  name="password" // PENTING: name harus sesuai state
                  type="password" 
                  required 
                  value={formData.password} 
                  onChange={handleChange}
                  className="pl-12 w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-medium text-slate-700" 
                  placeholder="••••••••"
                />
              </div>
              <div className="flex justify-end mt-2">
                <Link to="/forgot-password" className="text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline">
                  Lupa Password?
                </Link>
              </div>
            </div>

            {/* Tombol Submit */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#0a1e3f] text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-900 transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Memproses...
                </>
              ) : (
                <>
                  Masuk Sistem <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Belum punya akun?{' '}
            <Link to="/register" className="text-[#0a1e3f] font-black hover:text-orange-600 hover:underline transition-colors">
              Daftar Sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;