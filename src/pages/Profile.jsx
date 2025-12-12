import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchUserProfile, updateUserProfile, fetchProdiList } from '../services/api'; 
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, Phone, ArrowLeft, Save, Mail, Building, MapPin, 
  Shield, GraduationCap, School, Loader2, CheckCircle2, AlertCircle 
} from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [commonData, setCommonData] = useState({
    nama_lengkap: '',
    no_wa: '',
    username: '' // Read only
  });

  const [specificData, setSpecificData] = useState({
    npm: '', nidn: '', nomor_induk: '', id_prodi: '', angkatan: '', lokasi_jaga: ''
  });

  const [roleName, setRoleName] = useState('');
  const [prodiList, setProdiList] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success'|'error', text: '' }

  useEffect(() => {
    const init = async () => {
      if (user) {
        try {
          // 1. Ambil Data Profil User
          const res = await fetchUserProfile(user.id);
          const profile = res; 

          setRoleName(profile.role_name); 

          setCommonData({
            nama_lengkap: profile.nama_lengkap || '',
            no_wa: profile.no_wa || '',
            username: profile.username || user.email
          });

          if (profile.specific) {
            setSpecificData({
              npm: profile.specific.npm || '',
              nidn: profile.specific.nidn || '',
              nomor_induk: profile.specific.nomor_induk || '',
              id_prodi: profile.specific.id_prodi || '',
              angkatan: profile.specific.angkatan || '',
              lokasi_jaga: profile.specific.lokasi_jaga || ''
            });
          }

          // 2. Ambil Master Prodi
          const prodiRes = await fetchProdiList();
          setProdiList(prodiRes);

        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };
    init();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    
    const payload = {
      authId: user.id,
      commonData: {
        nama_lengkap: commonData.nama_lengkap,
        no_wa: commonData.no_wa
      },
      specificData: {}
    };

    if (roleName === 'mahasiswa') {
      payload.specificData = {
        npm: specificData.npm,
        id_prodi: parseInt(specificData.id_prodi),
        angkatan: specificData.angkatan
      };
    } else if (roleName === 'dosen') {
      payload.specificData = {
        nidn: specificData.nidn,
        id_prodi: parseInt(specificData.id_prodi)
      };
    } else if (roleName === 'satpam') {
      payload.specificData = {
        nomor_induk: specificData.nomor_induk,
        lokasi_jaga: specificData.lokasi_jaga
      };
    }

    try {
      await updateUserProfile(user.id, payload);
      setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  // Helper Icon Role
  const getRoleIcon = () => {
    if (roleName === 'dosen') return <GraduationCap size={40} className="text-white"/>;
    if (roleName === 'satpam') return <Shield size={40} className="text-white"/>;
    return <School size={40} className="text-white"/>;
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F1F5F9] flex justify-center items-center text-slate-400">
      <Loader2 className="animate-spin mr-2" /> Memuat Profil...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans pb-12">
      
      {/* --- HEADER --- */}
      <div className="bg-[#0a1e3f] pb-40 pt-8 px-4 relative overflow-hidden shadow-lg">
        {/* Dekorasi */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500 rounded-full blur-3xl opacity-10 -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500 rounded-full blur-3xl opacity-10 -ml-10 -mb-10"></div>

        <div className="max-w-4xl mx-auto relative z-10">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors mb-6 text-sm font-bold bg-white/10 px-4 py-2 rounded-full w-fit hover:bg-white/20"
          >
            <ArrowLeft size={18} /> Kembali ke Dashboard
          </button>
          
          <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-extrabold text-white mb-1">Pengaturan Akun</h1>
                <p className="text-blue-200 text-sm">Kelola informasi pribadi dan data akademik Anda.</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN CARD --- */}
      <div className="max-w-4xl mx-auto px-4 -mt-24 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden animate-[fadeInUp_0.6s_ease-out]">
          
          {/* Profile Header Banner */}
          <div className="bg-slate-50 p-8 border-b border-slate-100 flex flex-col md:flex-row items-center md:items-start gap-6">
             <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg ring-4 ring-white">
                    {getRoleIcon()}
                </div>
                <div className="absolute bottom-0 right-0 bg-[#0a1e3f] text-white text-[10px] font-bold px-2 py-1 rounded-full border-2 border-white uppercase tracking-wider">
                    {roleName}
                </div>
             </div>
             
             <div className="text-center md:text-left flex-1">
                <h2 className="text-2xl font-bold text-slate-800">{commonData.nama_lengkap || 'User'}</h2>
                <p className="text-slate-500 text-sm mb-4">@{commonData.username}</p>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                    <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-medium text-slate-600">
                        <Mail size={14} className="text-blue-500"/> {user.email}
                    </div>
                    {roleName !== 'satpam' && specificData.id_prodi && (
                        <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-medium text-slate-600">
                            <Building size={14} className="text-orange-500"/> 
                            {prodiList.find(p => p.id_prodi == specificData.id_prodi)?.nama_prodi || 'Prodi'}
                        </div>
                    )}
                </div>
             </div>
          </div>

          <div className="p-8 md:p-10">
            {/* Alert Messages */}
            {message && (
              <div className={`p-4 mb-8 rounded-xl flex items-start gap-3 text-sm font-medium animate-[fadeIn_0.3s_ease-out]
                ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                {message.type === 'error' ? <AlertCircle size={20}/> : <CheckCircle2 size={20}/>}
                <span>{message.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* SECTION: INFORMASI UMUM */}
              <div>
                <h3 className="text-sm font-bold text-[#0a1e3f] uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <User size={16}/> Informasi Dasar
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Nama Lengkap</label>
                        <input 
                        type="text" required
                        value={commonData.nama_lengkap}
                        onChange={(e) => setCommonData({...commonData, nama_lengkap: e.target.value})}
                        className="w-full px-5 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition font-medium text-slate-700"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Nomor WhatsApp</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-3.5 text-slate-400" size={18}/>
                            <input 
                            type="text" required
                            value={commonData.no_wa}
                            onChange={(e) => setCommonData({...commonData, no_wa: e.target.value})}
                            className="w-full pl-12 pr-5 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition font-medium text-slate-700"
                            />
                        </div>
                    </div>
                </div>
              </div>

              {/* SECTION: DATA AKADEMIK / PEKERJAAN */}
              <div>
                <h3 className="text-sm font-bold text-[#0a1e3f] uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Building size={16}/> Data {roleName === 'mahasiswa' ? 'Akademik' : 'Pekerjaan'}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* MAHASISWA */}
                    {roleName === 'mahasiswa' && (
                    <>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">NPM</label>
                            <input type="text" required value={specificData.npm} onChange={(e) => setSpecificData({...specificData, npm: e.target.value})}
                                className="w-full px-5 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#0a1e3f] focus:ring-4 focus:ring-blue-900/10 outline-none transition font-medium" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Angkatan</label>
                            <input type="number" required value={specificData.angkatan} onChange={(e) => setSpecificData({...specificData, angkatan: e.target.value})}
                                className="w-full px-5 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#0a1e3f] focus:ring-4 focus:ring-blue-900/10 outline-none transition font-medium" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Program Studi</label>
                            <div className="relative">
                                <select value={specificData.id_prodi} onChange={(e) => setSpecificData({...specificData, id_prodi: e.target.value})}
                                    className="w-full px-5 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#0a1e3f] focus:ring-4 focus:ring-blue-900/10 outline-none transition appearance-none cursor-pointer font-medium">
                                    <option value="">Pilih Prodi...</option>
                                    {prodiList.map(p => (<option key={p.id_prodi} value={p.id_prodi}>{p.nama_prodi}</option>))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                </div>
                            </div>
                        </div>
                    </>
                    )}

                    {/* DOSEN */}
                    {roleName === 'dosen' && (
                    <>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">NIDN</label>
                            <input type="text" required value={specificData.nidn} onChange={(e) => setSpecificData({...specificData, nidn: e.target.value})}
                                className="w-full px-5 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#0a1e3f] focus:ring-4 focus:ring-blue-900/10 outline-none transition font-medium" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Homebase Prodi</label>
                            <div className="relative">
                                <select value={specificData.id_prodi} onChange={(e) => setSpecificData({...specificData, id_prodi: e.target.value})}
                                    className="w-full px-5 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#0a1e3f] focus:ring-4 focus:ring-blue-900/10 outline-none transition appearance-none cursor-pointer font-medium">
                                    <option value="">Pilih Prodi...</option>
                                    {prodiList.map(p => (<option key={p.id_prodi} value={p.id_prodi}>{p.nama_prodi}</option>))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                </div>
                            </div>
                        </div>
                    </>
                    )}

                    {/* SATPAM */}
                    {roleName === 'satpam' && (
                    <>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Nomor Induk Pegawai</label>
                            <input type="text" required value={specificData.nomor_induk} onChange={(e) => setSpecificData({...specificData, nomor_induk: e.target.value})}
                                className="w-full px-5 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#0a1e3f] focus:ring-4 focus:ring-blue-900/10 outline-none transition font-medium" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Lokasi Jaga Utama</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-3.5 text-slate-400" size={18}/>
                                <select value={specificData.lokasi_jaga} onChange={(e) => setSpecificData({...specificData, lokasi_jaga: e.target.value})}
                                    className="w-full pl-12 pr-5 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#0a1e3f] focus:ring-4 focus:ring-blue-900/10 outline-none transition appearance-none cursor-pointer font-medium">
                                    <option value="Gerbang Depan">Gerbang Depan</option>
                                    <option value="Asrama Rafflesia">Asrama Rafflesia</option>
                                    <option value="Gedung Rektorat">Gedung Rektorat</option>
                                    <option value="Kantin">Kantin</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                </div>
                            </div>
                        </div>
                    </>
                    )}
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={saving}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:from-orange-600 hover:to-orange-700 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-8"
              >
                {saving ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>}
                {saving ? 'Menyimpan Perubahan...' : 'SIMPAN PERUBAHAN'}
              </button>

            </form>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Profile;