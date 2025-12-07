import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchUserProfile, updateUserProfile } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { User, Phone, IdCard, GraduationCap, ArrowLeft, Save, Mail } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    nim: '', 
    dosen_wali: '',
    no_wa: '',
    username: '',
    role: 'user'
  });
  
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Data Dosen ULBI (Real)
  const daftarDosen = [
    { id: 1, nama: 'M. Yusril Helmi Setyawan, S.Kom., M.Kom., SFPC' },
    { id: 2, nama: 'Rolly Maulana Awangga, S.T., M.T., CAIP, SFPC' },
    { id: 3, nama: 'Roni Andarsyah, S.T., M.Kom., SFPC' },
    { id: 4, nama: 'Mohamad Nurkamal Fauzan, S.T., M.T., SFPC' },
    { id: 5, nama: 'Cahyo Prianto, S.Pd., M.T., CDSP, SFPC' },
    { id: 6, nama: 'Syafrial Fachri Pane, S.T., M.T.I, EBDP, CDSP, SFPC' },
    { id: 7, nama: 'Roni Habibi, S.Kom., M.T., SFPC' },
    { id: 8, nama: 'Nisa Hanum Harani, S.Kom., M.T., CDSP, SFPC' },
    { id: 9, nama: 'Rd. Nuraini Siti Fathonah, S.S., M.Hum., SFPC' }
  ];

  useEffect(() => {
    if (user) {
      fetchUserProfile(user.id)
        .then(res => {
          if (res.data) {
            setFormData({
              nama_lengkap: res.data.nama_lengkap || '',
              no_wa: res.data.no_wa || '',
              username: res.data.username || user.email,
              role: res.data.role || 'user',
              nim: res.data.nim || '', 
              dosen_wali: res.data.dosen_wali_id || '' 
            });
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await updateUserProfile(user.id, formData);
      setMessage('SUCCESS: Profil berhasil disimpan!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error) {
      setMessage('ERROR: ' + error.message);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#0a1e3f]"></div>
    </div>
  );

  return (
    // BACKGROUND: Clean Slate (Sesuai Dashboard)
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* Dekorasi Background Halus */}
      <div className="absolute top-0 left-0 w-full h-64 bg-[#0a1e3f] rounded-b-[3rem] shadow-lg z-0"></div>
      
      {/* Tombol Kembali */}
      <div className="absolute top-6 left-6 z-10">
        <Link 
          to="/dashboard" 
          className="flex items-center gap-2 text-white/80 hover:text-white font-medium transition-colors bg-white/10 px-4 py-2 rounded-full backdrop-blur-md hover:bg-white/20"
        >
          <ArrowLeft size={18} /> Kembali ke Dashboard
        </Link>
      </div>

      {/* CARD UTAMA */}
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative z-10 mt-10 opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]">
        
        {/* Header Form */}
        <div className="px-8 py-8 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center shadow-sm">
              <User size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#0a1e3f]">Lengkapi Profil</h2>
              <p className="text-slate-500 text-sm mt-1">Data yang akurat mempermudah proses verifikasi kampus.</p>
            </div>
          </div>
        </div>

        {/* Body Form */}
        <div className="p-8 bg-white">
          {message && (
            <div className={`p-4 mb-6 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-sm ${
              message.includes('ERROR') 
                ? 'bg-red-50 text-red-600 border border-red-100' 
                : 'bg-green-50 text-green-700 border border-green-100'
            }`}>
              {message.replace('SUCCESS: ', '').replace('ERROR: ', '')}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* EMAIL (Read Only) */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Akun Terdaftar</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                <input 
                  type="text" 
                  value={formData.username} 
                  disabled 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-medium cursor-not-allowed focus:outline-none"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 my-4"></div>

            {/* NAMA LENGKAP */}
            <div>
              <label className="block text-xs font-bold text-[#0a1e3f] uppercase tracking-wider mb-2 ml-1">Nama Lengkap</label>
              <div className="relative group">
                <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                <input 
                  type="text" 
                  required
                  value={formData.nama_lengkap}
                  onChange={(e) => setFormData({...formData, nama_lengkap: e.target.value})}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all shadow-sm placeholder:text-slate-300"
                  placeholder="Contoh: Ridwan Syalwa"
                />
              </div>
            </div>

            {/* GRID: NIM & DOSEN WALI */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-[#0a1e3f] uppercase tracking-wider mb-2 ml-1">NPM</label>
                <div className="relative group">
                  <IdCard className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                  <input 
                    type="text" 
                    value={formData.nim}
                    onChange={(e) => setFormData({...formData, nim: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all shadow-sm placeholder:text-slate-300"
                    placeholder="Nomor Induk"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0a1e3f] uppercase tracking-wider mb-2 ml-1">Dosen Wali</label>
                <div className="relative group">
                  <GraduationCap className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                  <select 
                    value={formData.dosen_wali}
                    onChange={(e) => setFormData({...formData, dosen_wali: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all shadow-sm appearance-none cursor-pointer hover:bg-slate-50"
                  >
                    <option value="">Pilih Dosen...</option>
                    {daftarDosen.map(dosen => (
                      <option key={dosen.id} value={dosen.id}>{dosen.nama}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-4 pointer-events-none text-slate-400 text-xs">▼</div>
                </div>
              </div>
            </div>

            {/* WHATSAPP */}
            <div>
              <label className="block text-xs font-bold text-[#0a1e3f] uppercase tracking-wider mb-2 ml-1">WhatsApp</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-green-500 transition-colors" />
                <input 
                  type="text" 
                  required
                  value={formData.no_wa}
                  onChange={(e) => setFormData({...formData, no_wa: e.target.value})}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all shadow-sm placeholder:text-slate-300"
                  placeholder="6281234567890"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 ml-1 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-slate-400"></span> Gunakan format 628... agar tombol chat berfungsi.
              </p>
            </div>

            {/* TOMBOL SIMPAN */}
            <div className="pt-4">
              <button 
                type="submit" 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-orange-500/30 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                <Save size={20} />
                SIMPAN PERUBAHAN
              </button>
            </div>

          </form>
        </div>
      </div>

      {/* CSS Animasi (Inline) */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Profile;