import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, fetchProdiList } from '../services/api';
import { User, Lock, Mail, Phone, IdCard } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('mahasiswa');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // State Data Prodi
  const [daftarProdi, setDaftarProdi] = useState([]);
  const [loadingProdi, setLoadingProdi] = useState(false);

  const [formData, setFormData] = useState({
    email: '', 
    password: '', 
    nama_lengkap: '', 
    no_wa: '', 
    username: '',
    // Data Spesifik
    npm: '', 
    prodi: '', 
    angkatan: '', 
    nidn: '', 
    nomor_induk: '', 
    lokasi_jaga: 'Gerbang Depan'
  });

  useEffect(() => {
    const loadProdi = async () => {
      setLoadingProdi(true);
      try {
        const data = await fetchProdiList();
        setDaftarProdi(data);
      } catch (err) {
        console.error("Gagal memuat daftar prodi:", err);
      } finally {
        setLoadingProdi(false);
      }
    };
    loadProdi();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let specific_data = {};
    if (role === 'mahasiswa') {
      specific_data = { npm: formData.npm, prodi: formData.prodi, angkatan: formData.angkatan };
    } else if (role === 'dosen') {
      specific_data = { nidn: formData.nidn, prodi: formData.prodi }; 
    } else if (role === 'satpam') {
      specific_data = { nomor_induk: formData.nomor_induk, lokasi_jaga: formData.lokasi_jaga };
    }

    try {
      await registerUser({
        email: formData.email,
        password: formData.password,
        nama_lengkap: formData.nama_lengkap,
        no_wa: formData.no_wa,
        username: formData.username,
        role,
        specific_data
      });
      alert('Registrasi Berhasil! Silakan Login.');
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sisi Kiri (Branding) */}
      <div className="hidden lg:flex w-1/2 bg-blue-900 justify-center items-center relative overflow-hidden">
        <div className="absolute w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -top-20 -left-20"></div>
        <div className="z-10 text-center text-white px-10">
          <h1 className="text-5xl font-bold mb-4">Bergabunglah.</h1>
          <p className="text-blue-200 text-lg">Komunitas ULBI yang aman dan saling peduli.</p>
        </div>
      </div>

      {/* Sisi Kanan (Form) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 overflow-y-auto">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Buat Akun Baru</h2>
            <p className="mt-2 text-sm text-gray-600">Pilih peran Anda di kampus</p>
          </div>

          {/* Role Selector */}
          <div className="grid grid-cols-3 gap-2 bg-gray-100 p-1 rounded-lg">
            {['mahasiswa', 'dosen', 'satpam'].map((r) => (
              <button
                key={r} type="button" onClick={() => setRole(r)}
                className={`py-2 text-sm font-medium rounded-md capitalize transition-all ${
                  role === r ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded text-sm text-center">{error}</div>}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Field Umum */}
            <div className="grid grid-cols-1 gap-4">
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input name="nama_lengkap" type="text" required placeholder="Nama Lengkap" onChange={handleChange}
                  className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input name="email" type="email" required placeholder="Email Aktif" onChange={handleChange}
                  className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div className="relative">
                <IdCard className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input name="username" type="text" required placeholder="Username (tanpa spasi)" onChange={handleChange}
                  className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input name="no_wa" type="text" required placeholder="No WhatsApp (628...)" onChange={handleChange}
                  className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input name="password" type="password" required placeholder="Password" onChange={handleChange}
                  className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
            </div>

            <div className="border-t border-gray-200 my-4"></div>

            {/* Field Spesifik Role */}
            <div className="space-y-4 animate-fade-in-down">
              {role === 'mahasiswa' && (
                <>
                  <input name="npm" type="text" required placeholder="NPM" onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" />
                  
                  {/* DROPDOWN PRODI - Langsung di sini agar state terjaga */}
                  <div className="relative">
                    <select 
                      name="prodi" 
                      required 
                      onChange={handleChange} 
                      value={formData.prodi} // <--- PENTING: Controlled Component
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white text-gray-700"
                      disabled={loadingProdi}
                    >
                      <option value="" disabled>
                        {loadingProdi ? "Memuat Data Prodi..." : "Pilih Program Studi"}
                      </option>
                      {daftarProdi.map((item) => (
                        <option key={item.id_prodi} value={item.id_prodi}>
                          {item.nama_prodi}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  <input name="angkatan" type="number" required placeholder="Tahun Angkatan" onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" />
                </>
              )}
              
              {role === 'dosen' && (
                <>
                  <input name="nidn" type="text" required placeholder="NIDN" onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" />
                  
                  {/* DROPDOWN PRODI DOSEN */}
                  <div className="relative">
                    <select 
                      name="prodi" 
                      required 
                      onChange={handleChange} 
                      value={formData.prodi} 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white text-gray-700"
                      disabled={loadingProdi}
                    >
                      <option value="" disabled>
                        {loadingProdi ? "Memuat Data Prodi..." : "Pilih Program Studi"}
                      </option>
                      {daftarProdi.map((item) => (
                        <option key={item.id_prodi} value={item.id_prodi}>
                          {item.nama_prodi}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </>
              )}

              {role === 'satpam' && (
                <>
                  <input name="nomor_induk" type="text" required placeholder="Nomor Induk Pegawai" onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" />
                  <select name="lokasi_jaga" onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg bg-white">
                    <option value="Gerbang Depan">Gerbang Depan</option>
                    <option value="Asrama Rafflesia">Asrama Rafflesia</option>
                  </select>
                </>
              )}
            </div>

            <button type="submit" disabled={loading} className="w-full bg-blue-900 text-white py-3 rounded-lg font-bold hover:bg-blue-800 transition shadow-lg hover:shadow-xl">
              {loading ? 'Memproses...' : 'Daftar Sekarang'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600">
            Sudah punya akun? <Link to="/login" className="text-orange-600 font-bold hover:underline">Masuk disini</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;