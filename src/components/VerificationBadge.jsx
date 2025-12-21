import { CheckCircle2, AlertCircle } from 'lucide-react';

const VerificationBadge = ({ status, className = "" }) => {
    const s = status ? status.toLowerCase() : 'pending';

    if (s === 'verified') {
        return (
            <span className={`inline-flex items-center gap-1 text-green-500 font-bold ${className}`} title="Akun Terverifikasi">
                <CheckCircle2 size={14} className="fill-green-100 text-green-600" />
                <span className="text-xs">Terverifikasi</span>
            </span>
        );
    }

    if (s === 'rejected') {
        return (
            <span className={`inline-flex items-center gap-1 text-red-500 text-xs font-medium ${className}`} title="Akun Ditolak">
                <AlertCircle size={14} /> Ditolak
            </span>
        );
    }

    // Default: Pending / Belum verifikasi
    return (
        <span className={`text-xs text-slate-400 font-normal ${className}`} title="Menunggu Verifikasi">
            (Belum Terverifikasi)
        </span>
    );
};

export default VerificationBadge;
