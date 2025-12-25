import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchSuccessfulClaims, getStorageUrl } from '../services/api';
import {
    ArrowLeft, Calendar, User, MessageCircle, MapPin,
    CheckCircle2, Package, Loader2, ExternalLink
} from 'lucide-react';
import VerificationBadge from '../components/VerificationBadge';

const RiwayatKlaim = () => {
    const navigate = useNavigate();
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSuccessfulClaims()
            .then(setClaims)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center">
                <Loader2 className="animate-spin text-slate-400" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F1F5F9] pb-12">
            {/* HEADER */}
            <div className="bg-[#0a1e3f] pb-32 pt-8 px-4 relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500 rounded-full blur-3xl opacity-10 -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500 rounded-full blur-3xl opacity-10 -ml-10 -mb-10"></div>

                <div className="max-w-4xl mx-auto relative z-10">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors mb-6 text-sm font-bold bg-white/10 px-4 py-2 rounded-full w-fit hover:bg-white/20"
                    >
                        <ArrowLeft size={18} /> Kembali ke Dashboard
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-500/20 rounded-xl backdrop-blur-sm border border-green-500/30 text-green-300">
                            <Package size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-white mb-1">Riwayat Barang Klaim</h1>
                            <p className="text-blue-200 text-sm">Daftar barang hilang Anda yang berhasil ditemukan kembali.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTENT */}
            <div className="max-w-4xl mx-auto px-4 -mt-24 relative z-20">
                {claims.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center shadow-xl border border-slate-100 flex flex-col items-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                            <Package size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Belum Ada Riwayat</h3>
                        <p className="text-slate-500 max-w-sm">
                            Anda belum memiliki riwayat klaim barang yang berhasil disetujui.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {claims.map((claim) => (
                            <div key={claim.id_klaim} className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all group overflow-hidden relative">

                                {/* Status Badge */}
                                <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl shadow-md flex items-center gap-1">
                                    <CheckCircle2 size={12} /> SELESAI
                                </div>

                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Foto Barang */}
                                    <div className="w-full md:w-48 h-48 bg-slate-100 rounded-xl overflow-hidden shadow-inner flex-shrink-0">
                                        <img
                                            src={getStorageUrl(claim.postingan_barang.foto_barang)}
                                            alt={claim.postingan_barang.nama_barang}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-[#0a1e3f] mb-3 group-hover:text-blue-600 transition-colors">
                                            {claim.postingan_barang.nama_barang}
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-sm text-slate-600 mb-6">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={16} className="text-slate-400" />
                                                <span>Diklaim: <span className="font-semibold text-slate-800">{formatDate(claim.tgl_klaim)}</span></span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 size={16} className="text-green-500" />
                                                <span>Disetujui: <span className="font-semibold text-slate-800">{formatDate(claim.tgl_validasi)}</span></span>
                                            </div>
                                        </div>

                                        {/* Penemu Card */}
                                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Ditemukan Oleh</p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border shadow-sm text-slate-400">
                                                        <User size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-bold text-slate-800">{claim.postingan_barang.akun_pengguna.nama_lengkap}</span>
                                                            <VerificationBadge status={claim.postingan_barang.akun_pengguna.status_akun} />
                                                        </div>
                                                        <span className="text-xs text-slate-500">Penemu Barang</span>
                                                    </div>
                                                </div>

                                                <a
                                                    href={`https://wa.me/${claim.postingan_barang.akun_pengguna.no_wa}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-bold text-xs hover:bg-green-600 transition shadow-md active:scale-95"
                                                >
                                                    <MessageCircle size={14} /> Hubungi
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Action */}
                                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                                    <button
                                        onClick={() => navigate(`/post/${claim.postingan_barang.id_postingan}`)}
                                        className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 group/btn"
                                    >
                                        Lihat Detail Barang <ExternalLink size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RiwayatKlaim;
