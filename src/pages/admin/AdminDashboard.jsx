import { useEffect, useState } from 'react';
import { fetchAdminStats } from '../../services/api';
import { Users, Package, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-start justify-between">
    <div>
      <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-3xl font-black text-slate-800">{value}</h3>
      {subtext && <p className="text-xs text-slate-400 mt-2">{subtext}</p>}
    </div>
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchAdminStats();
        setStats(data);
      } catch (err) {
        console.error("Gagal load stats:", err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) return (
    <div className="flex h-screen items-center justify-center text-slate-400">
      <Loader2 className="animate-spin mr-2" /> Memuat data dashboard...
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
        <p className="text-slate-500">Ringkasan aktivitas sistem ULBI Lost & Found.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total User" value={stats?.total_users || 0} icon={Users} color="bg-blue-600" />
        <StatCard title="Total Laporan" value={stats?.total_posts || 0} icon={Package} color="bg-purple-600" />
        <StatCard title="Kehilangan" value={stats?.lost_items || 0} icon={AlertCircle} color="bg-red-500" />
        <StatCard title="Ditemukan" value={stats?.found_items || 0} icon={CheckCircle} color="bg-green-500" />
      </div>
    </div>
  );
};

export default AdminDashboard;