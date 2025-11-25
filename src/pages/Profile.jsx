import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchUserProfile, updateUserProfile } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    no_wa: '',
    username: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      fetchUserProfile(user.id)
        .then(res => {
          if (res.data) {
            setFormData({
              nama_lengkap: res.data.nama_lengkap || '',
              no_wa: res.data.no_wa || '',
              username: res.data.username || user.email,
              role: res.data.role || 'user'
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
      setMessage('Profil berhasil disimpan! Mengalihkan...');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error) {
      setMessage('Gagal menyimpan: ' + error.message);
    }
  };

  if (loading) return <div className="p-10 text-white bg-gray-900 min-h-screen">Memuat data profil...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex justify-center items-center">
      <div className="w-full max-w-lg bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-yellow-400">Lengkapi Profil Anda</h2>
        
        {message && (
          <div className={`p-3 mb-4 rounded text-center ${message.includes('Gagal') ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input 
              type="text" 
              value={formData.username} 
              disabled 
              className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-gray-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
            <input 
              type="text" 
              required
              value={formData.nama_lengkap}
              onChange={(e) => setFormData({...formData, nama_lengkap: e.target.value})}
              className="w-full bg-gray-700 border border-gray-600 rounded p-2 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
              placeholder="Contoh: Ridwan Syalwa"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nomor WhatsApp</label>
            <input 
              type="text" 
              required
              value={formData.no_wa}
              onChange={(e) => setFormData({...formData, no_wa: e.target.value})}
              className="w-full bg-gray-700 border border-gray-600 rounded p-2 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
              placeholder="Contoh: 6281234567890"
            />
            <p className="text-xs text-gray-500 mt-1">*Gunakan format 628... agar bisa dihubungi.</p>
          </div>

          <button 
            type="submit" 
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded transition duration-200 mt-4"
          >
            SIMPAN DATA
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;