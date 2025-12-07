import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { fetchUserProfile, fetchAllPosts, fetchMyPosts } from '../services/api';
import { 
  LogOut, User, PlusCircle, Search, 
  LayoutGrid, List, MessageSquare, CheckCircle, Clock, MapPin, ChevronRight
} from 'lucide-react';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('jelajah');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  useEffect(() => {
    const initData = async () => {
      if (user) {
        setLoading(true);
        try {
          const userRes = await fetchUserProfile(user.id);
          setProfile(userRes.data);
          let postsData = activeTab === 'jelajah' ? await fetchAllPosts() : await fetchMyPosts(user.id);
          setPosts(postsData);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };
    initData();
  }, [user, activeTab]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit'
  });

  // --- KOMPONEN BUTTON SIDEBAR (Professional) ---
  const NavButton = ({ icon, label, isActive, onClick }) => (
    <button 
      onClick={onClick}
      className={`relative flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group w-full overflow-hidden mb-1.5
        ${isActive 
          ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' 
          : 'text-slate-300 hover:bg-white/10 hover:text-white'
        } ${isSidebarHovered ? 'justify-start' : 'justify-center'}`}
    >
      <span className="flex-shrink-0 relative z-10 transition-transform group-hover:scale-110">{icon}</span>
      <span className={`whitespace-nowrap font-medium text-sm transition-all duration-300 relative z-10 
        ${isSidebarHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 hidden'}`}>
        {label}
      </span>
    </button>
  );

  // --- KOMPONEN BUTTON MOBILE ---
  const MobileNavButton = ({ icon, label, isActive, onClick }) => (
    <button 
      onClick={onClick}
      className={`w-full h-full flex flex-col items-center justify-center py-1 transition-all duration-300
        ${isActive ? 'text-orange-600 -translate-y-1' : 'text-slate-400 hover:text-slate-600'}`}
    >
      <div className={`p-1.5 rounded-xl mb-1 transition-all ${isActive ? 'bg-orange-50 shadow-sm' : ''}`}>
        {icon}
      </div>
      <span className={`text-[10px] font-semibold tracking-wide ${isActive ? 'opacity-100' : 'opacity-70'}`}>{label}</span>
    </button>
  );

  return (
    // BACKGROUND: Abu-abu Muda Bersih (Sama seperti Landing Page)
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans overflow-hidden">
      
      {/* SIDEBAR DESKTOP: Biru Tua ULBI (#0a1e3f) */}
      <aside 
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
        className={`hidden md:flex flex-col justify-between fixed left-0 top-0 h-screen 
          bg-[#0a1e3f] text-white 
          transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] z-50 pt-10 pb-8 shadow-xl border-r border-white/5
          ${isSidebarHovered ? 'w-72 px-5' : 'w-20 px-3'}`}
      >
        <div>
          {/* Logo Area */}
          <div 
            className={`flex items-center mb-12 mt-4 transition-all duration-300 
              ${isSidebarHovered ? 'gap-4 pl-1 justify-start' : 'gap-0 justify-center'}`}
          >
            <div className="bg-white p-2 rounded-xl shadow-lg flex-shrink-0">
              <img src="/src/assets/ulbi-logo.png" alt="ULBI" className="h-6 w-auto" />
            </div>
            
            <div className={`overflow-hidden transition-all duration-500 flex flex-col ${isSidebarHovered ? 'opacity-100 max-w-[200px]' : 'opacity-0 max-w-0'}`}>
               <h1 className="text-xl font-bold tracking-wide leading-none text-white font-heading">ULBI</h1>
               <p className="text-[10px] text-orange-400 font-medium tracking-[0.2em] mt-1">LOST & FOUND</p>
            </div>
          </div>

          <div className="space-y-1">
            <NavButton icon={<Search size={20} />} label="Jelajah Barang" isActive={activeTab === 'jelajah'} onClick={() => setActiveTab('jelajah')} />
            <NavButton icon={<List size={20} />} label="Riwayat Laporan" isActive={activeTab === 'saya'} onClick={() => setActiveTab('saya')} />
            <NavButton icon={<User size={20} />} label="Profil Saya" onClick={() => navigate('/profile')} isActive={false} />
            <div className="my-6 border-t border-white/10 mx-2"></div>
            <NavButton icon={<MessageSquare size={20} />} label="Bantuan Admin" onClick={() => window.location.href = 'mailto:admin@ulbi.ac.id'} isActive={false} />
          </div>
        </div>

        <button onClick={handleLogout} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-red-300 hover:bg-white/5 hover:text-red-200 group ${isSidebarHovered ? '' : 'justify-center'}`}>
          <LogOut size={20} className="flex-shrink-0 transition-transform group-hover:-translate-x-1" />
          <span className={`whitespace-nowrap font-medium text-sm transition-all duration-500 ${isSidebarHovered ? 'opacity-100' : 'opacity-0 hidden'}`}>Keluar</span>
        </button>
      </aside>

      {/* --- BOTTOM NAVIGATION (MOBILE) --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-2 pb-safe flex justify-between items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="grid grid-cols-4 items-center justify-items-center w-full h-14">
          <MobileNavButton icon={<Search size={22}/>} label="Jelajah" isActive={activeTab === 'jelajah'} onClick={() => setActiveTab('jelajah')} />
          <MobileNavButton icon={<List size={22}/>} label="Riwayat" isActive={activeTab === 'saya'} onClick={() => setActiveTab('saya')} />
          <MobileNavButton icon={<User size={22}/>} label="Profil" onClick={() => navigate('/profile')} isActive={false} />
          <button onClick={handleLogout} className="w-full h-full flex flex-col items-center justify-center text-red-400 hover:text-red-600 transition-colors">
             <LogOut size={20} className="mb-1" />
             <span className="text-[10px] font-medium">Keluar</span>
          </button>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 p-5 md:p-10 md:ml-20 pb-24 md:pb-10 overflow-y-auto w-full transition-all bg-slate-50">
        
        {/* Header User Card (Clean White) */}
        <div className="bg-white rounded-3xl p-6 md:p-8 mb-8 shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 opacity-0 animate-[fadeInDown_0.6s_ease-out_forwards]">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#0a1e3f] mb-2">
              Halo, <span className="text-orange-600">{profile?.nama_lengkap || 'Mahasiswa'}</span> 👋
            </h2>
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${profile?.status_verifikasi === 'verified' ? 'bg-green-500' : 'bg-orange-500'}`}></span>
              <p className="text-slate-500 font-medium text-sm">
                {profile?.status_verifikasi === 'verified' ? 'Akun Terverifikasi' : 'Menunggu Validasi Dosen'}
              </p>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={() => navigate('/lapor', { state: { tipe: 'kehilangan' } })}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#0a1e3f] hover:bg-blue-900 text-white px-5 py-3 rounded-xl font-semibold shadow-lg shadow-blue-900/20 transition-all active:scale-95 hover:-translate-y-0.5"
            >
              <PlusCircle size={18} /> Lapor Hilang
            </button>
            <button 
              onClick={() => navigate('/lapor', { state: { tipe: 'ditemukan' } })}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-[#0a1e3f] border border-slate-200 hover:bg-slate-50 px-5 py-3 rounded-xl font-semibold shadow-sm transition-all active:scale-95 hover:-translate-y-0.5"
            >
              <PlusCircle size={18} /> Lapor Temuan
            </button>
          </div>
        </div>

        {/* Section Title */}
        <div className="flex items-center justify-between mb-6 opacity-0 animate-[fadeIn_0.8s_ease-out_0.2s_forwards]">
          <h3 className="text-xl font-bold text-[#0a1e3f] flex items-center gap-3">
            <span className={`w-1 h-6 rounded-full ${activeTab === 'jelajah' ? 'bg-blue-600' : 'bg-orange-500'}`}></span>
            {activeTab === 'jelajah' ? 'Barang Terkini' : 'Laporan Saya'}
          </h3>
        </div>

        {/* Grid Laporan */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => <div key={i} className="h-72 bg-slate-200 rounded-2xl"></div>)}
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Search size={32} />
            </div>
            <h4 className="text-lg font-bold text-slate-700">Belum ada data</h4>
            <p className="text-slate-500 text-sm mt-1">Jadilah yang pertama melaporkan!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((item, index) => (
              <div 
                key={item.id_postingan} 
                className="group bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 overflow-hidden flex flex-col h-full opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                
                {/* Image Header */}
                <div className="h-48 overflow-hidden relative bg-slate-100">
                  <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm border border-slate-100 text-slate-700 uppercase tracking-wider">
                    {item.kategori || 'UMUM'}
                  </div>
                  
                  {item.foto_barang && item.foto_barang.length > 10 ? (
                    <img src={item.foto_barang} alt={item.nama_barang} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <LayoutGrid size={32} />
                    </div>
                  )}

                  <div className={`absolute bottom-3 left-3 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white shadow-md
                    ${item.tipe_postingan === 'kehilangan' ? 'bg-red-500' : 'bg-green-600'}`}>
                    {item.tipe_postingan}
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 flex-1 flex flex-col">
                  <h4 className="text-lg font-bold text-[#0a1e3f] mb-1 line-clamp-1 group-hover:text-orange-600 transition-colors">
                    {item.nama_barang}
                  </h4>
                  
                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-3 mt-1">
                    <span className="flex items-center gap-1"><MapPin size={12} className="text-orange-500" /> {item.lokasi_terlapor}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className="flex items-center gap-1"><Clock size={12} className="text-blue-500" /> {formatDate(item.tgl_postingan)}</span>
                  </div>

                  <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4 flex-1">
                    {item.deskripsi}
                  </p>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                        {item.akun_pengguna?.nama_lengkap?.charAt(0) || 'U'}
                      </div>
                      <span className="text-xs font-medium text-slate-600 truncate max-w-[100px]">
                        {item.akun_pengguna?.nama_lengkap?.split(' ')[0]}
                      </span>
                    </div>
                    <button className="text-xs font-bold text-[#0a1e3f] hover:text-orange-600 flex items-center gap-1 transition-colors">
                      Lihat Detail <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* CSS Animasi */}
      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;