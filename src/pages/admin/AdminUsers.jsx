import { useState, useEffect } from 'react';
import { fetchAllUsers, verifyUserAccount } from '../../services/api';
import { Search, CheckCircle, Shield, User, Loader2, AlertCircle, School, GraduationCap } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState(null);

  // Load Data
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await fetchAllUsers();
        setUsers(data);
      } catch (error) {
        console.error("Gagal memuat user:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  // Handle Verifikasi
  const handleVerify = async (id, nama) => {
    if (!confirm(`Verifikasi akun "${nama}"?`)) return;
    
    setProcessingId(id);
    try {
      await verifyUserAccount(id);
      // Optimistic Update: Update state lokal agar tidak perlu refresh halaman
      setUsers(users.map(u => 
        u.id_pengguna === id ? { ...u, status_akun: 'verified' } : u
      ));
    } catch (error) {
      alert('Gagal verifikasi: ' + error.message);
    } finally {
      setProcessingId(null);
    }
  };

  // Filter Search
  const filteredUsers = users.filter(u => 
    u.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper Badge Role
  const getRoleBadge = (roleName) => {
    switch(roleName) {
      case 'admin': return <span className="flex items-center gap-1 text-xs font-bold text-purple-700 bg-purple-100 px-2 py-1 rounded-md"><Shield size={12}/> Admin</span>;
      case 'dosen': return <span className="flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded-md"><GraduationCap size={12}/> Dosen</span>;
      case 'satpam': return <span className="flex items-center gap-1 text-xs font-bold text-orange-700 bg-orange-100 px-2 py-1 rounded-md"><Shield size={12}/> Satpam</span>;
      default: return <span className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md"><School size={12}/> Mahasiswa</span>;
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Memuat data pengguna...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Pengguna</h1>
          <p className="text-slate-500 text-sm">Total {filteredUsers.length} pengguna terdaftar.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
          <input 
            type="text" placeholder="Cari user..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a1e3f]"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-bold">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredUsers.map((user) => (
                <tr key={user.id_pengguna} className="hover:bg-slate-50 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold">
                        {user.nama_lengkap?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{user.nama_lengkap}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">{getRoleBadge(user.master_roles?.nama_role)}</td>
                  <td className="p-4">
                    {user.status_akun === 'verified' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-700">
                        <CheckCircle size={12} /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-slate-100 text-slate-500">
                        Belum Verifikasi
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {user.status_akun !== 'verified' && user.id_role !== 99 && (
                      <button 
                        onClick={() => handleVerify(user.id_pengguna, user.nama_lengkap)}
                        disabled={processingId === user.id_pengguna}
                        className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-1 mx-auto"
                      >
                        {processingId === user.id_pengguna ? <Loader2 size={12} className="animate-spin"/> : 'Verifikasi'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;