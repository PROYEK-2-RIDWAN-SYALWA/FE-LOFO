import { useState, useEffect } from 'react';
import { fetchAllUsers, verifyUserAccount, rejectUserAccount, fetchUserDetail } from '../../services/api';
import { 
  Search, CheckCircle, Shield, User, Loader2, AlertCircle, School, GraduationCap,
  X, XCircle, Eye, Filter, Clock
} from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [processingId, setProcessingId] = useState(null);
  
  // Modal States
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [userToReject, setUserToReject] = useState(null);

  // Status Options
  const statusOptions = [
    { value: 'all', label: 'Semua Status' },
    { value: 'pending', label: 'Pending', color: 'text-yellow-600' },
    { value: 'verified', label: 'Terverifikasi', color: 'text-green-600' },
    { value: 'rejected', label: 'Ditolak', color: 'text-red-600' },
  ];

  // Load Data with Filter
  useEffect(() => {
    loadUsers();
  }, [statusFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchAllUsers(statusFilter);
      setUsers(data);
    } catch (error) {
      console.error("Gagal memuat user:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Verifikasi
  const handleVerify = async (user) => {
    if (!confirm(`Verifikasi akun "${user.nama_lengkap}"?`)) return;
    
    setProcessingId(user.id_pengguna);
    try {
      await verifyUserAccount(user.id_pengguna);
      setUsers(users.map(u => 
        u.id_pengguna === user.id_pengguna ? { ...u, status_akun: 'verified' } : u
      ));
    } catch (error) {
      alert('Gagal verifikasi: ' + error.message);
    } finally {
      setProcessingId(null);
    }
  };

  // Handle Reject
  const openRejectModal = (user) => {
    setUserToReject(user);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (!userToReject) return;
    
    setProcessingId(userToReject.id_pengguna);
    try {
      await rejectUserAccount(userToReject.id_pengguna, rejectReason);
      setUsers(users.map(u => 
        u.id_pengguna === userToReject.id_pengguna ? { ...u, status_akun: 'rejected' } : u
      ));
      setIsRejectModalOpen(false);
      setUserToReject(null);
    } catch (error) {
      alert('Gagal menolak: ' + error.message);
    } finally {
      setProcessingId(null);
    }
  };

  // Handle View Detail
  const openDetailModal = async (user) => {
    setLoadingDetail(true);
    setIsDetailModalOpen(true);
    try {
      const detail = await fetchUserDetail(user.id_pengguna);
      setSelectedUser(detail);
    } catch (error) {
      console.error('Gagal load detail:', error);
      setSelectedUser(user); // Fallback to basic data
    } finally {
      setLoadingDetail(false);
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

  // Helper Status Badge
  const getStatusBadge = (status) => {
    switch(status) {
      case 'verified': return <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-700"><CheckCircle size={12} /> Verified</span>;
      case 'rejected': return <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-700"><XCircle size={12} /> Ditolak</span>;
      default: return <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-yellow-100 text-yellow-700"><Clock size={12} /> Pending</span>;
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Memuat data pengguna...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Pengguna</h1>
          <p className="text-slate-500 text-sm">Total {filteredUsers.length} pengguna.</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          {/* Filter Status */}
          <div className="relative">
            <Filter className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a1e3f] text-sm"
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          
          {/* Search */}
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
            <input 
              type="text" placeholder="Cari user..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a1e3f]"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
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
                  <td className="p-4">{getStatusBadge(user.status_akun)}</td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      {/* Tombol Detail */}
                      <button 
                        onClick={() => openDetailModal(user)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                        title="Lihat Detail"
                      >
                        <Eye size={18} />
                      </button>
                      
                      {/* Tombol Verifikasi */}
                      {user.status_akun !== 'verified' && user.id_role !== 99 && (
                        <button 
                          onClick={() => handleVerify(user)}
                          disabled={processingId === user.id_pengguna}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition disabled:opacity-50"
                          title="Verifikasi"
                        >
                          {processingId === user.id_pengguna ? <Loader2 size={18} className="animate-spin"/> : <CheckCircle size={18} />}
                        </button>
                      )}
                      
                      {/* Tombol Tolak */}
                      {user.status_akun !== 'rejected' && user.id_role !== 99 && (
                        <button 
                          onClick={() => openRejectModal(user)}
                          className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition"
                          title="Tolak"
                        >
                          <XCircle size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail User */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold text-slate-800">Detail Pengguna</h3>
              <button onClick={() => setIsDetailModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            {loadingDetail ? (
              <div className="p-8 text-center text-slate-400">
                <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                Memuat detail...
              </div>
            ) : selectedUser && (
              <div className="p-6 space-y-6">
                {/* Header Profile */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-slate-800 text-white flex items-center justify-center text-2xl font-bold">
                    {selectedUser.nama_lengkap?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-800">{selectedUser.nama_lengkap}</h4>
                    <p className="text-slate-500 text-sm">{selectedUser.email}</p>
                    <div className="flex gap-2 mt-2">
                      {getRoleBadge(selectedUser.master_roles?.nama_role)}
                      {getStatusBadge(selectedUser.status_akun)}
                    </div>
                  </div>
                </div>
                
                {/* Info Dasar */}
                <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Informasi Dasar</h5>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-slate-400">Username</span>
                      <p className="font-medium text-slate-700">@{selectedUser.username}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">No. WhatsApp</span>
                      <p className="font-medium text-slate-700">{selectedUser.no_wa || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Profil Spesifik */}
                {selectedUser.specific && (
                  <div className="bg-blue-50 rounded-xl p-4 space-y-3">
                    <h5 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                      Profil {selectedUser.master_roles?.nama_role}
                    </h5>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {/* Mahasiswa */}
                      {selectedUser.specific.npm && (
                        <>
                          <div>
                            <span className="text-slate-400">NPM</span>
                            <p className="font-medium text-slate-700">{selectedUser.specific.npm}</p>
                          </div>
                          <div>
                            <span className="text-slate-400">Angkatan</span>
                            <p className="font-medium text-slate-700">{selectedUser.specific.angkatan}</p>
                          </div>
                        </>
                      )}
                      {/* Dosen */}
                      {selectedUser.specific.nidn && (
                        <div>
                          <span className="text-slate-400">NIDN</span>
                          <p className="font-medium text-slate-700">{selectedUser.specific.nidn}</p>
                        </div>
                      )}
                      {/* Satpam */}
                      {selectedUser.specific.nomor_induk && (
                        <>
                          <div>
                            <span className="text-slate-400">Nomor Induk</span>
                            <p className="font-medium text-slate-700">{selectedUser.specific.nomor_induk}</p>
                          </div>
                          <div>
                            <span className="text-slate-400">Lokasi Jaga</span>
                            <p className="font-medium text-slate-700">{selectedUser.specific.lokasi_jaga}</p>
                          </div>
                        </>
                      )}
                      {/* Prodi */}
                      {selectedUser.specific.master_prodi?.nama_prodi && (
                        <div className="col-span-2">
                          <span className="text-slate-400">Program Studi</span>
                          <p className="font-medium text-slate-700">{selectedUser.specific.master_prodi.nama_prodi}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {selectedUser.status_akun !== 'verified' && selectedUser.id_role !== 99 && (
                  <div className="flex gap-3 pt-4 border-t">
                    <button 
                      onClick={() => { handleVerify(selectedUser); setIsDetailModalOpen(false); }}
                      className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} /> Verifikasi Akun
                    </button>
                    <button 
                      onClick={() => { setIsDetailModalOpen(false); openRejectModal(selectedUser); }}
                      className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 flex items-center justify-center gap-2"
                    >
                      <XCircle size={18} /> Tolak
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Reject */}
      {isRejectModalOpen && userToReject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Tolak Akun</h3>
            <p className="text-slate-500 text-sm mb-4">
              Berikan alasan penolakan untuk "{userToReject.nama_lengkap}" (opsional)
            </p>
            
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Alasan penolakan..."
              className="w-full p-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none h-24"
            />
            
            <div className="flex gap-3 mt-4">
              <button 
                onClick={() => setIsRejectModalOpen(false)}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200"
              >
                Batal
              </button>
              <button 
                onClick={handleReject}
                disabled={processingId === userToReject.id_pengguna}
                className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processingId === userToReject.id_pengguna ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <XCircle size={16} />
                )}
                Tolak Akun
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;