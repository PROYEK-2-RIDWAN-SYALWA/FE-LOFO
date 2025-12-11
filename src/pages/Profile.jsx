import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchUserProfile, updateUserProfile, fetchProdiList } from '../services/api'; // Pastikan fetchProdiList ada
import { useNavigate, Link } from 'react-router-dom';
import { User, Phone, IdCard, ArrowLeft, Save, Mail, Building, MapPin } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [commonData, setCommonData] = useState({
    nama_lengkap: '',
    no_wa: '',
    username: '' // Read only
  });

  const [specificData, setSpecificData] = useState({
    // Field dinamis (akan diisi sesuai role)
    npm: '',
    nidn: '',
    nomor_induk: '',
    id_prodi: '',
    angkatan: '',
    lokasi_jaga: ''
  });

  const [roleName, setRoleName] = useState('');
  const [prodiList, setProdiList] = useState([]); // Untuk dropdown
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const init = async () => {
      if (user) {
        try {
          // 1. Ambil Data Profil User
          const res = await fetchUserProfile(user.id);
          const profile = res; // Backend response sekarang langsung object

          setRoleName(profile.role_name); // 'mahasiswa', 'dosen', 'satpam'

          setCommonData({
            nama_lengkap: profile.nama_lengkap || '',
            no_wa: profile.no_wa || '',
            username: profile.username || user.email
          });

          // Mapping data spesifik dari backend ke state
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

          // 2. Ambil Master Prodi untuk Dropdown
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
    setMessage('');
    
    // Siapkan payload yang bersih untuk backend
    // Backend mengharapkan { authId, commonData, specificData }
    const payload = {
      authId: user.id,
      commonData: {
        nama_lengkap: commonData.nama_lengkap,
        no_wa: commonData.no_wa
      },
      specificData: {}
    };

    // Filter specificData agar hanya mengirim field yang relevan dengan role
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
      await updateUserProfile(user.id, payload); // Note: API service mungkin perlu disesuaikan parameternya
      setMessage('SUCCESS: Profil berhasil diperbarui!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error) {
      setMessage('ERROR: ' + error.message);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative">
      {/* Tombol Kembali */}
      <div className="absolute top-6 left-6 z-10">
        <Link to="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-[#0a1e3f] bg-white px-4 py-2 rounded-full shadow-sm border">
          <ArrowLeft size={18} /> Kembali
        </Link>
      </div>

      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden mt-10">
        <div className="px-8 py-6 border-b border-slate-100 bg-white flex items-center gap-4">
          <div className="bg-orange-100 text-orange-600 p-3 rounded-xl"><User size={28}/></div>
          <div>
            <h2 className="text-xl font-bold text-[#0a1e3f]">Edit Profil {roleName.toUpperCase()}</h2>
            <p className="text-slate-500 text-sm">Perbarui informasi data diri Anda.</p>
          </div>
        </div>

        <div className="p-8">
          {message && (
            <div className={`p-3 mb-4 rounded-lg text-sm text-center ${message.includes('ERROR') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* --- DATA UMUM --- */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Username</label>
              <input type="text" value={commonData.username} disabled className="w-full mt-1 p-3 bg-slate-50 border rounded-xl text-slate-500" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-bold text-[#0a1e3f] uppercase ml-1">Nama Lengkap</label>
                <input 
                  type="text" required
                  value={commonData.nama_lengkap}
                  onChange={(e) => setCommonData({...commonData, nama_lengkap: e.target.value})}
                  className="w-full mt-1 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#0a1e3f] uppercase ml-1">WhatsApp</label>
                <input 
                  type="text" required
                  value={commonData.no_wa}
                  onChange={(e) => setCommonData({...commonData, no_wa: e.target.value})}
                  className="w-full mt-1 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 my-2"></div>

            {/* --- DATA SPESIFIK SESUAI ROLE --- */}
            
            {/* MAHASISWA */}
            {roleName === 'mahasiswa' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-bold text-[#0a1e3f] uppercase ml-1">NPM</label>
                    <input 
                      type="text" required
                      value={specificData.npm}
                      onChange={(e) => setSpecificData({...specificData, npm: e.target.value})}
                      className="w-full mt-1 p-3 border border-slate-300 rounded-xl outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#0a1e3f] uppercase ml-1">Angkatan</label>
                    <input 
                      type="number" required
                      value={specificData.angkatan}
                      onChange={(e) => setSpecificData({...specificData, angkatan: e.target.value})}
                      className="w-full mt-1 p-3 border border-slate-300 rounded-xl outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#0a1e3f] uppercase ml-1">Program Studi</label>
                  <select 
                    value={specificData.id_prodi}
                    onChange={(e) => setSpecificData({...specificData, id_prodi: e.target.value})}
                    className="w-full mt-1 p-3 border border-slate-300 rounded-xl bg-white outline-none focus:border-orange-500"
                  >
                    <option value="">Pilih Prodi...</option>
                    {prodiList.map(p => (
                      <option key={p.id_prodi} value={p.id_prodi}>{p.nama_prodi}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* DOSEN */}
            {roleName === 'dosen' && (
              <>
                <div>
                  <label className="text-xs font-bold text-[#0a1e3f] uppercase ml-1">NIDN</label>
                  <input 
                    type="text" required
                    value={specificData.nidn}
                    onChange={(e) => setSpecificData({...specificData, nidn: e.target.value})}
                    className="w-full mt-1 p-3 border border-slate-300 rounded-xl outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#0a1e3f] uppercase ml-1">Program Studi (Homebase)</label>
                  <select 
                    value={specificData.id_prodi}
                    onChange={(e) => setSpecificData({...specificData, id_prodi: e.target.value})}
                    className="w-full mt-1 p-3 border border-slate-300 rounded-xl bg-white outline-none focus:border-orange-500"
                  >
                    <option value="">Pilih Prodi...</option>
                    {prodiList.map(p => (
                      <option key={p.id_prodi} value={p.id_prodi}>{p.nama_prodi}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* SATPAM */}
            {roleName === 'satpam' && (
              <>
                 <div>
                  <label className="text-xs font-bold text-[#0a1e3f] uppercase ml-1">Nomor Induk Pegawai</label>
                  <input 
                    type="text" required
                    value={specificData.nomor_induk}
                    onChange={(e) => setSpecificData({...specificData, nomor_induk: e.target.value})}
                    className="w-full mt-1 p-3 border border-slate-300 rounded-xl outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#0a1e3f] uppercase ml-1">Lokasi Jaga Utama</label>
                  <select 
                    value={specificData.lokasi_jaga}
                    onChange={(e) => setSpecificData({...specificData, lokasi_jaga: e.target.value})}
                    className="w-full mt-1 p-3 border border-slate-300 rounded-xl bg-white outline-none focus:border-orange-500"
                  >
                    <option value="Gerbang Depan">Gerbang Depan</option>
                    <option value="Asrama Rafflesia">Asrama Rafflesia</option>
                    <option value="Gedung Rektorat">Gedung Rektorat</option>
                  </select>
                </div>
              </>
            )}

            <button type="submit" className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl shadow-lg mt-4 hover:bg-orange-600 transition-colors flex items-center justify-center gap-2">
              <Save size={20}/> SIMPAN PERUBAHAN
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;