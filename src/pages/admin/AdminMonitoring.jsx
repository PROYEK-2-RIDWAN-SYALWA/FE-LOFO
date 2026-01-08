import { useState, useEffect } from 'react';
import { fetchAdminMonitoringPosts } from '../../services/api';
import {
    Search, Filter, Calendar, ChevronLeft, ChevronRight,
    Eye, AlertCircle, CheckCircle, Clock, XCircle, MapPin
} from 'lucide-react';
import { getStorageUrl } from '../../services/api';

const AdminMonitoring = () => {
    // --- STATE ---
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total_pages: 1 });

    // State for Modal Detail
    const [selectedPost, setSelectedPost] = useState(null);

    // Filters
    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        type: 'all',
        dateFrom: '',
        dateTo: ''
    });

    // Debounce Search
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // --- EFFECT ---

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(filters.search);
        }, 500);
        return () => clearTimeout(timer);
    }, [filters.search]);

    useEffect(() => {
        loadData();
    }, [pagination.page, debouncedSearch, filters.status, filters.type, filters.dateFrom, filters.dateTo]);

    const loadData = async () => {
        setLoading(true);
        try {
            const response = await fetchAdminMonitoringPosts({
                page: pagination.page,
                limit: pagination.limit,
                search: debouncedSearch,
                status: filters.status,
                type: filters.type,
                dateFrom: filters.dateFrom,
                dateTo: filters.dateTo
            });
            setData(response.data);
            setPagination(response.pagination);
        } catch (error) {
            console.error("Gagal load monitoring:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- HANDLERS ---

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleReset = () => {
        setFilters({
            search: '',
            status: 'all',
            type: 'all',
            dateFrom: '',
            dateTo: ''
        });
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    // --- RENDER HELPERS ---

    const getStatusBadge = (status) => {
        const map = {
            'pending_admin': { color: 'bg-yellow-100 text-yellow-700', label: 'Pending' },
            'aktif': { color: 'bg-green-100 text-green-700', label: 'Aktif' },
            'menunggu_validasi': { color: 'bg-blue-100 text-blue-700', label: 'Validasi Klaim' },
            'selesai': { color: 'bg-slate-800 text-white', label: 'Selesai' },
            'ditolak_admin': { color: 'bg-red-100 text-red-700', label: 'Ditolak Admin' },
        };
        const style = map[status] || { color: 'bg-gray-100 text-gray-600', label: status };
        return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${style.color}`}>{style.label}</span>;
    };

    const getClaimStatus = (item) => {
        if (!item.klaim || item.klaim.length === 0) {
            return <span className="text-slate-400 text-sm italic">Belum ada klaim</span>;
        }

        const acceptedClaim = item.klaim.find(k => k.status_klaim === 'disetujui');
        const claimToShow = acceptedClaim || item.klaim[0];

        const statusMap = {
            null: { text: 'Menunggu Validasi', color: 'text-orange-600' },
            'disetujui': { text: 'Disetujui', color: 'text-green-600 font-bold' },
            'ditolak': { text: 'Ditolak', color: 'text-red-500' }
        };

        const statusInfo = statusMap[claimToShow.status_klaim] || { text: 'Unknown', color: 'text-slate-500' };

        return (
            <div className="flex flex-col text-xs">
                <span className="text-slate-700 font-medium">Oleh: {claimToShow.pengklaim?.nama_lengkap || 'Unknown'}</span>
                <span className={`${statusInfo.color}`}>{statusInfo.text}</span>
                <span className="text-slate-400 text-[10px]">{new Date(claimToShow.tgl_klaim).toLocaleDateString()}</span>
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-fade-in relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Monitoring Postingan</h1>
                    <p className="text-slate-500 text-sm">Pantau aktivitas barang hilang, ditemukan, dan proses klaim.</p>
                </div>
            </div>

            {/* --- FILTER BAR --- */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="relative md:col-span-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Cari barang atau deskripsi..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>

                    <div>
                        <select
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            <option value="all">Semua Status</option>
                            <option value="pending_admin">Pending Admin</option>
                            <option value="aktif">Aktif (Tayang)</option>
                            <option value="menunggu_validasi">Ada Klaim Masuk</option>
                            <option value="selesai">Selesai (Closed)</option>
                            <option value="ditolak_admin">Ditolak Admin</option>
                        </select>
                    </div>

                    <div>
                        <select
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={filters.type}
                            onChange={(e) => handleFilterChange('type', e.target.value)}
                        >
                            <option value="all">Semua Tipe</option>
                            <option value="kehilangan">Kehilangan</option>
                            <option value="ditemukan">Ditemukan</option>
                        </select>
                    </div>

                    <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 text-sm font-medium transition-colors"
                    >
                        Reset Filter
                    </button>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="flex items-center gap-1"><Calendar size={16} /> Tanggal:</span>
                    <input
                        type="date"
                        className="border border-slate-200 rounded px-2 py-1"
                        value={filters.dateFrom}
                        onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    />
                    <span>-</span>
                    <input
                        type="date"
                        className="border border-slate-200 rounded px-2 py-1"
                        value={filters.dateTo}
                        onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    />
                </div>
            </div>

            {/* --- DATA TABLE --- */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#F8FAFC] border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Barang</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tipe & Tanggal</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Pelapor</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status Post</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status Klaim</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-slate-400">
                                        Memuat data...
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-slate-400">
                                        Tidak ada data yang sesuai filter.
                                    </td>
                                </tr>
                            ) : (
                                data.map((item) => (
                                    <tr key={item.id_postingan} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                                                    <img
                                                        src={getStorageUrl(item.foto_barang)}
                                                        alt={item.nama_barang}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => e.target.src = 'https://placehold.co/100?text=No+Img'}
                                                    />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm line-clamp-1">{item.nama_barang}</p>
                                                    <p className="text-xs text-slate-500">{item.kategori?.nama_kategori || 'Tanpa Kategori'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1 items-start">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${item.tipe_postingan === 'kehilangan' ? 'border-red-200 bg-red-50 text-red-600' : 'border-green-200 bg-green-50 text-green-600'}`}>
                                                    {item.tipe_postingan === 'kehilangan' ? 'KEHILANGAN' : 'DITEMUKAN'}
                                                </span>
                                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Clock size={10} /> {new Date(item.tgl_postingan).toLocaleDateString('id-ID')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <p className="font-medium text-slate-700">{item.pelapor?.nama_lengkap}</p>
                                                <p className="text-xs text-slate-400 capitalize">{item.pelapor?.master_roles?.nama_role || 'Unknown'}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(item.status_postingan)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getClaimStatus(item)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedPost(item)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Lihat Detail"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="bg-[#F8FAFC] px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                        Hal {pagination.page} dari {pagination.total_pages}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                            disabled={pagination.page === 1}
                            className="p-2 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed text-slate-600"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.total_pages, prev.page + 1) }))}
                            disabled={pagination.page >= pagination.total_pages}
                            className="p-2 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed text-slate-600"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* === MODAL DETAIL POSTINGAN === */}
            {selectedPost && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-white sticky top-0 z-10">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Detail Postingan</h2>
                                <p className="text-sm text-slate-500">ID Post: {selectedPost.id_postingan}</p>
                            </div>
                            <button
                                onClick={() => setSelectedPost(null)}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-red-500"
                            >
                                <XCircle size={28} />
                            </button>
                        </div>

                        {/* Content Scrollable */}
                        <div className="flex-1 p-6 space-y-8">
                            {/* Section 1: Info Barang */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Foto Barang */}
                                <div className="md:col-span-1">
                                    <div className="aspect-square rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shadow-sm">
                                        <img
                                            src={getStorageUrl(selectedPost.foto_barang)}
                                            alt={selectedPost.nama_barang}
                                            className="w-full h-full object-cover"
                                            onError={(e) => e.target.src = 'https://placehold.co/400?text=No+Image'}
                                        />
                                    </div>
                                </div>

                                {/* Detail Text */}
                                <div className="md:col-span-2 space-y-4">
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-800">{selectedPost.nama_barang}</h3>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold border ${selectedPost.tipe_postingan === 'kehilangan' ? 'border-red-200 bg-red-50 text-red-600' : 'border-green-200 bg-green-50 text-green-600'}`}>
                                                {selectedPost.tipe_postingan.toUpperCase()}
                                            </span>
                                            {getStatusBadge(selectedPost.status_postingan)}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                                        <div className="bg-slate-50 p-3 rounded-lg">
                                            <p className="text-slate-400 text-xs mb-1">Kategori</p>
                                            <p className="font-semibold text-slate-700">{selectedPost.kategori?.nama_kategori}</p>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-lg">
                                            <p className="text-slate-400 text-xs mb-1">Lokasi</p>
                                            <p className="font-semibold text-slate-700 break-words">{selectedPost.lokasi_terlapor || '-'}</p>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-lg">
                                            <p className="text-slate-400 text-xs mb-1">Tanggal Posting</p>
                                            <p className="font-semibold text-slate-700">{new Date(selectedPost.tgl_postingan).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-lg">
                                            <p className="text-slate-400 text-xs mb-1">Waktu Kejadian</p>
                                            <p className="font-semibold text-slate-700">{selectedPost.waktu_kejadian ? new Date(selectedPost.waktu_kejadian).toLocaleString() : '-'}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-slate-400 text-xs mb-1 font-bold uppercase">Deskripsi</p>
                                        <p className="text-slate-600 bg-slate-50 p-3 rounded-lg text-sm leading-relaxed border border-slate-100">
                                            {selectedPost.deskripsi || 'Tidak ada deskripsi.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            {/* Section 2: Info Pelapor */}
                            <div>
                                <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                                    <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                                    Informasi Pelapor
                                </h4>
                                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                                        {selectedPost.pelapor?.nama_lengkap?.charAt(0) || 'U'}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-800 text-lg">{selectedPost.pelapor?.nama_lengkap}</p>
                                        <div className="flex gap-4 text-sm mt-1">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-slate-400">Role</span>
                                                <span className="font-medium capitalize text-slate-700">{selectedPost.pelapor?.master_roles?.nama_role}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs text-slate-400">Status Akun</span>
                                                <span className="font-medium capitalize text-slate-700">{selectedPost.pelapor?.status_akun}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs text-slate-400">WhatsApp</span>
                                                <span className="font-medium text-slate-700">{selectedPost.info_kontak_wa || '-'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            {/* Section 3: Riwayat Klaim */}
                            <div>
                                <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                                    <div className="w-1 h-6 bg-orange-500 rounded-full"></div>
                                    Data Klaim ({selectedPost.klaim?.length || 0})
                                </h4>

                                {!selectedPost.klaim || selectedPost.klaim.length === 0 ? (
                                    <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                        <p className="text-slate-500">Belum ada klaim untuk postingan ini.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {selectedPost.klaim.map((claim, idx) => (
                                            <div key={claim.id_klaim} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                                                {/* Status Badge Absolute */}
                                                <div className="absolute top-0 right-0 p-2">
                                                    {claim.status_klaim === 'disetujui' && <span className="bg-green-100 text-green-700 px-3 py-1 rounded-bl-xl text-xs font-bold">DISETUJUI</span>}
                                                    {claim.status_klaim === 'ditolak' && <span className="bg-red-100 text-red-700 px-3 py-1 rounded-bl-xl text-xs font-bold">DITOLAK</span>}
                                                    {claim.status_klaim === null && <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-bl-xl text-xs font-bold">MENUNGGU VALIDASI</span>}
                                                </div>

                                                <div className="flex items-start gap-4 mt-2">
                                                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold shrink-0">
                                                        {idx + 1}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-bold text-slate-800">
                                                            Diklaim oleh: <span className="text-blue-600">{claim.pengklaim?.nama_lengkap}</span>
                                                        </p>
                                                        <p className="text-xs text-slate-400 flex items-center gap-1 mb-2">
                                                            <Clock size={12} /> {new Date(claim.tgl_klaim).toLocaleString()}
                                                        </p>

                                                        {/* Bukti Klaim (Disetujui atau Ditolak) */}
                                                        {(claim.status_klaim === 'disetujui' || claim.status_klaim === 'ditolak') && claim.file_bukti && (
                                                            <div className="mt-3">
                                                                <p className="text-xs font-semibold text-slate-700 mb-2">Bukti Kepemilikan:</p>
                                                                <div className="w-full max-w-xs h-48 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                                                                    <img
                                                                        src={getStorageUrl(claim.file_bukti)}
                                                                        alt="Bukti Klaim"
                                                                        className="w-full h-full object-contain"
                                                                        onError={(e) => e.target.src = 'https://placehold.co/400?text=No+Image'}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Catatan Validasi */}
                                                        {claim.catatan_validasi && (
                                                            <div className={`mt-3 p-3 rounded-lg text-xs leading-relaxed border ${claim.status_klaim === 'disetujui'
                                                                    ? 'bg-green-50 border-green-100 text-green-800'
                                                                    : 'bg-red-50 border-red-100 text-red-800'
                                                                }`}>
                                                                <p className="font-bold mb-1">Catatan Validasi:</p>
                                                                {claim.catatan_validasi}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminMonitoring;
