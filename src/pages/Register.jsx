import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
// Pastikan import IdCard (bukan BadgeId)
import { User, Shield, GraduationCap, BookOpen, Lock, Mail, Phone, IdCard } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('mahasiswa');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Tambahkan 'username' di state
  const [formData, setFormData] = useState({
    email: '', password: '', nama_lengkap: '', no_wa: '', username: '',
    // Data Spesifik
    npm: '', prodi: '', angkatan: '', // Mhs
    nidn: '', // Dosen (Fakultas dihapus, diganti prodi input yang sama)
    nomor_induk: '', lokasi_jaga: 'Gerbang Depan' // Satpam
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Siapkan Data Spesifik
    let specific_data = {};
    if (role === 'mahasiswa') {
      specific_data = { npm: formData.npm, prodi: formData.prodi, angkatan: formData.angkatan };
    } else if (role === 'dosen') {
      // Dosen sekarang pakai PRODI juga
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
        username: formData.username, // <--- Kirim Username
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
              {/* Nama Lengkap */}
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input name="nama_lengkap" type="text" required placeholder="Nama Lengkap" onChange={handleChange}
                  className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              
              {/* Email (Biasa) */}
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input name="email" type="email" required placeholder="Email Aktif" onChange={handleChange}
                  className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>

              {/* INPUT BARU: USERNAME */}
              <div className="relative">
                <IdCard className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input name="username" type="text" required placeholder="Username (tanpa spasi)" onChange={handleChange}
                  className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>

              {/* No WA */}
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input name="no_wa" type="text" required placeholder="No WhatsApp (628...)" onChange={handleChange}
                  className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>

              {/* Password */}
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
                  <input name="prodi" type="text" required placeholder="Program Studi" onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" />
                  <input name="angkatan" type="number" required placeholder="Tahun Angkatan" onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" />
                </>
              )}
              
              {role === 'dosen' && (
                <>
                  <input name="nidn" type="text" required placeholder="NIDN" onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" />
                  {/* Dosen sekarang isi Prodi */}
                  <input name="prodi" type="text" required placeholder="Program Studi (Contoh: D4 Logistik)" onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" />
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