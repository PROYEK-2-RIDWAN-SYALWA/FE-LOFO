import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { fetchUserProfile, fetchAllPosts, fetchMyPosts } from '../services/api';
import { 
  LogOut, User, PlusCircle, Search, 
  List, MessageSquare, Clock, MapPin, 
  ChevronRight, Shield, GraduationCap, School, Menu
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
          setProfile(userRes); 
          
          let postsData = activeTab === 'jelajah' ? await fetchAllPosts() : await fetchMyPosts(user.id);
          setPosts(postsData);
        } catch (err) {
          console.error("Gagal load data:", err);
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

  // Helper Label & Icon
  const getRoleLabel = (role) => {
    // Pastikan role string aman (lowercase)
    const r = role ? role.toLowerCase() : 'mahasiswa';
    if (r === 'dosen') return 'Bapak/Ibu Dosen';
    if (r === 'satpam') return 'Pak Satpam';
    return 'Mahasiswa';
  };

  const getRoleIcon = (role) => {
    const r = role ? role.toLowerCase() : 'mahasiswa';
    if (r === 'dosen') return <GraduationCap size={32} />;
    if (r === 'satpam') return <Shield size={32} />;
    return <School size={32} />;
  };

  // Komponen Navigasi Desktop
  const NavButton = ({ icon, label, isActive, onClick }) => (
    <button 
      onClick={onClick}
      className={`relative flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 w-full mb-1.5
        ${isActive 
          ? 'bg-orange-500 text-white shadow-md' 
          : 'text-slate-300 hover:bg-white/10 hover:text-white'
        } ${isSidebarHovered ? 'justify-start' : 'justify-center'}`}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className={`whitespace-nowrap font-medium text-sm transition-all duration-300 
        ${isSidebarHovered ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>
        {label}
      </span>
    </button>
  );

  // Komponen Navigasi Mobile (Bottom Bar)
  const MobileNavButton = ({ icon, label, isActive, onClick }) => (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full py-2
        ${isActive ? 'text-orange-600' : 'text-slate-400 hover:text-slate-600'}`}
    >
      <div className={`p-1 rounded-lg mb-1 transition-all ${isActive ? 'bg-orange-50' : ''}`}>
        {icon}
      </div>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      
      {/* === 1. SIDEBAR (DESKTOP ONLY) === */}
      {/* Hidden di mobile (md:flex) */}
      <aside 
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
        className={`hidden md:flex flex-col justify-between fixed left-0 top-0 h-screen 
          bg-[#0a1e3f] text-white z-50 pt-6 pb-6 shadow-xl border-r border-white/5 transition-all duration-300
          ${isSidebarHovered ? 'w-64 px-4' : 'w-20 px-2'}`}
      >
        <div>
          {/* Logo */}
          <div className={`flex items-center mb-10 mt-2 transition-all ${isSidebarHovered ? 'justify-start pl-2 gap-3' : 'justify-center'}`}>
            <div className="bg-white p-1.5 rounded-lg flex-shrink-0">
              <img src="/src/assets/ulbi-logo.png" alt="Logo" className="h-6 w-auto" />
            </div>
            <div className={`overflow-hidden transition-all duration-300 ${isSidebarHovered ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
               <h1 className="text-lg font-bold leading-none tracking-wide">ULBI</h1>
               <p className="text-[9px] text-orange-400 font-bold tracking-wider">LOST & FOUND</p>
            </div>
          </div>

          {/* Menu */}
          <div className="space-y-1">
            <NavButton icon={<Search size={20} />} label="Jelajah Barang" isActive={activeTab === 'jelajah'} onClick={() => setActiveTab('jelajah')} />
            <NavButton icon={<List size={20} />} label="Riwayat Saya" isActive={activeTab === 'saya'} onClick={() => setActiveTab('saya')} />
            <NavButton icon={<User size={20} />} label="Profil Akun" onClick={() => navigate('/profile')} isActive={false} />
            <div className="my-4 border-t border-white/10 mx-2"></div>
            <NavButton icon={<MessageSquare size={20} />} label="Bantuan Admin" onClick={() => window.location.href = 'mailto:admin@ulbi.ac.id'} isActive={false} />
          </div>
        </div>

        {/* Logout */}
        <button onClick={handleLogout} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:bg-white/5 hover:text-red-200 transition-all ${isSidebarHovered ? '' : 'justify-center'}`}>
          <LogOut size={20} />
          <span className={`whitespace-nowrap font-medium text-sm transition-all ${isSidebarHovered ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>Keluar</span>
        </button>
      </aside>


      {/* === 2. BOTTOM NAVIGATION (MOBILE ONLY) === */}
      {/* Hidden di desktop (md:hidden) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-16 flex items-center justify-around z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <MobileNavButton icon={<Search size={20}/>} label="Jelajah" isActive={activeTab === 'jelajah'} onClick={() => setActiveTab('jelajah')} />
        <MobileNavButton icon={<List size={20}/>} label="Riwayat" isActive={activeTab === 'saya'} onClick={() => setActiveTab('saya')} />
        <MobileNavButton icon={<User size={20}/>} label="Profil" onClick={() => navigate('/profile')} isActive={false} />
        <button onClick={handleLogout} className="flex flex-col items-center justify-center w-full text-red-400">
           <LogOut size={20} className="mb-1"/>
           <span className="text-[10px] font-medium">Keluar</span>
        </button>
      </div>


      {/* === 3. MAIN CONTENT AREA === */}
      {/* Margin kiri 20 (lebar sidebar minimize) di desktop, margin bawah 16 di mobile */}
      <main className="flex-1 w-full bg-slate-50 min-h-screen transition-all md:pl-24 pt-6 px-4 md:px-8 pb-24 md:pb-10">
        
        {/* Header User Card - PASTI MUNCUL KARENA TIDAK ADA ANIMASI */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-50 text-[#0a1e3f] rounded-2xl flex items-center justify-center">
               {profile ? getRoleIcon(profile.role_name) : <User />}
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-[#0a1e3f]">
                Halo, {getRoleLabel(profile?.role_name)} <span className="text-orange-600">{profile?.nama_lengkap || 'User'}</span>
              </h2>
              <p className="text-slate-500 text-sm">
                {profile?.role_name === 'mahasiswa' && profile?.specific?.master_prodi?.nama_prodi 
                  ? `Prodi ${profile.specific.master_prodi.nama_prodi}`
                  : 'Selamat datang di dashboard pelaporan.'}
              </p>
            </div>
          </div>

          <div className="flex w-full md:w-auto gap-2">
            <button 
              onClick={() => navigate('/lapor', { state: { tipe: 'kehilangan' } })}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#0a1e3f] text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:bg-blue-900 transition-transform active:scale-95"
            >
              <PlusCircle size={16} /> Lapor Hilang
            </button>
            <button 
              onClick={() => navigate('/lapor', { state: { tipe: 'ditemukan' } })}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-[#0a1e3f] border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-transform active:scale-95"
            >
              <PlusCircle size={16} /> Lapor Temuan
            </button>
          </div>
        </div>

        {/* Judul Section */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-1.5 h-6 rounded-full ${activeTab === 'jelajah' ? 'bg-blue-600' : 'bg-orange-500'}`}></div>
          <h3 className="text-lg font-bold text-slate-800">
            {activeTab === 'jelajah' ? 'Barang Terkini' : 'Riwayat Laporan Saya'}
          </h3>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => <div key={i} className="h-64 bg-slate-200 rounded-2xl"></div>)}
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Search size={24} />
            </div>
            <p className="text-slate-500 text-sm">Belum ada data laporan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((item) => (
              <div 
                key={item.id_postingan} 
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full"
              >
                {/* Gambar */}
                <div className="h-48 bg-slate-100 relative overflow-hidden group">
                  {item.foto_barang && item.foto_barang.length > 10 ? (
                    <img src={item.foto_barang} alt={item.nama_barang} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <List size={32} />
                    </div>
                  )}
                  <div className={`absolute top-3 left-3 px-2 py-1 rounded-md text-[10px] font-bold text-white uppercase tracking-wider
                    ${item.tipe_postingan === 'kehilangan' ? 'bg-red-500' : 'bg-green-600'}`}>
                    {item.tipe_postingan}
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border border-slate-200 px-1.5 py-0.5 rounded">
                      {item.kategori || 'UMUM'}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock size={10} /> {formatDate(item.tgl_postingan)}
                    </span>
                  </div>
                  
                  <h4 className="text-md font-bold text-slate-800 mb-1 line-clamp-1">{item.nama_barang}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                    <MapPin size={12} className="text-orange-500"/> {item.lokasi_terlapor}
                  </p>
                  
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4 flex-1">
                    {item.deskripsi}
                  </p>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                        {item.akun_pengguna?.nama_lengkap?.charAt(0) || '?'}
                      </div>
                      <span className="text-xs font-medium text-slate-500 truncate max-w-[80px]">
                        {item.akun_pengguna?.nama_lengkap?.split(' ')[0]}
                      </span>
                    </div>
                    <button className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">
                      Detail <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;