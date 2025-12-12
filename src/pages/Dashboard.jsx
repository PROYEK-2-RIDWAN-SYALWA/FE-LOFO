import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { fetchUserProfile, fetchPosts, fetchMyPosts } from '../services/api';
import { 
  LogOut, User, PlusCircle, Search, 
  List, MessageSquare, Clock, MapPin, 
  ChevronRight, Shield, GraduationCap, School, Loader2
} from 'lucide-react';

const Dashboard = () => {
  const { user, signOut } = useAuth(); 
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('jelajah');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // State untuk search

  useEffect(() => {
    const initData = async () => {
      if (user) {
        setLoading(true);
        try {
          const userRes = await fetchUserProfile(user.id);
          setProfile(userRes); 
          
          let postsData = [];
          if (activeTab === 'jelajah') {
            const allPosts = await fetchPosts();
            // Filter: Hanya tampilkan yang aktif
            postsData = allPosts.filter(p => p.status_postingan === 'aktif');
          } else {
            postsData = await fetchMyPosts();
          }
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

  const handleDetailClick = (id) => {
    navigate(`/post/${id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit'
    });
  };

  const getRoleLabel = (role) => {
    const r = role ? role.toLowerCase() : 'mahasiswa';
    if (r === 'dosen') return 'Bapak/Ibu Dosen';
    if (r === 'satpam') return 'Pak Satpam';
    if (r === 'admin') return 'Administrator';
    return 'Mahasiswa';
  };

  const getRoleIcon = (role) => {
    const r = role ? role.toLowerCase() : 'mahasiswa';
    if (r === 'dosen') return <GraduationCap size={24} />;
    if (r === 'satpam') return <Shield size={24} />;
    return <School size={24} />;
  };

  // Filter Search Logic
  const filteredPosts = posts.filter(post => 
    post.nama_barang.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.deskripsi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const NavButton = ({ icon, label, isActive, onClick }) => (
    <button 
      onClick={onClick}
      className={`relative flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 w-full mb-1.5
        ${isActive 
          ? 'bg-orange-500 text-white shadow-md shadow-orange-900/20' 
          : 'text-slate-300 hover:bg-white/10 hover:text-white'
        } ${isSidebarHovered ? 'justify-start' : 'justify-center'}`}
    >
      <span className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110">{icon}</span>
      <span className={`whitespace-nowrap font-medium text-sm transition-all duration-300 origin-left
        ${isSidebarHovered ? 'opacity-100 scale-100 ml-2' : 'opacity-0 scale-0 w-0 overflow-hidden'}`}>
        {label}
      </span>
    </button>
  );

  const MobileNavButton = ({ icon, label, isActive, onClick }) => (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full py-2 active:scale-95 transition-transform
        ${isActive ? 'text-orange-600' : 'text-slate-400 hover:text-slate-600'}`}
    >
      <div className={`p-1.5 rounded-lg mb-0.5 transition-colors ${isActive ? 'bg-orange-50' : 'bg-transparent'}`}>
        {icon}
      </div>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside 
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
        className={`hidden md:flex flex-col justify-between fixed left-0 top-0 h-screen 
          bg-[#0a1e3f] text-white z-50 py-6 shadow-2xl border-r border-white/5 transition-all duration-300 ease-in-out
          ${isSidebarHovered ? 'w-72 px-4' : 'w-24 px-3'}`}
      >
        <div>
          <div className={`flex items-center mb-12 mt-2 transition-all duration-300 ${isSidebarHovered ? 'justify-start pl-2 gap-4' : 'justify-center'}`}>
            <div className="bg-white p-2 rounded-xl flex-shrink-0 shadow-lg shadow-blue-900/50">
              <img src="/src/assets/ulbi-logo.png" alt="ULBI" className="h-6 w-auto" />
              <School className="h-8 w-8 text-[#0a1e3f] hidden peer-placeholder-shown:block" />
            </div>
            <div className={`overflow-hidden transition-all duration-300 flex flex-col ${isSidebarHovered ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
               <h1 className="text-xl font-black leading-none tracking-wide text-white">ULBI</h1>
               <p className="text-[10px] text-orange-400 font-bold tracking-[0.2em] mt-1">LOST & FOUND</p>
            </div>
          </div>

          <div className="space-y-2">
            <NavButton icon={<Search size={22} />} label="Jelajah Barang" isActive={activeTab === 'jelajah'} onClick={() => setActiveTab('jelajah')} />
            <NavButton icon={<List size={22} />} label="Riwayat Saya" isActive={activeTab === 'saya'} onClick={() => setActiveTab('saya')} />
            <NavButton icon={<User size={22} />} label="Profil Akun" onClick={() => navigate('/profile')} isActive={false} />
            <div className="my-6 border-t border-white/10 mx-2"></div>
            <NavButton icon={<MessageSquare size={22} />} label="Bantuan Admin" onClick={() => window.open('mailto:admin@ulbi.ac.id')} isActive={false} />
          </div>
        </div>

        <button onClick={handleLogout} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-all group ${isSidebarHovered ? '' : 'justify-center'}`}>
          <LogOut size={22} className="group-hover:-translate-x-1 transition-transform"/>
          <span className={`whitespace-nowrap font-medium text-sm transition-all duration-300 ${isSidebarHovered ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>
            Keluar Aplikasi
          </span>
        </button>
      </aside>

      {/* MOBILE NAV */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 h-20 pb-2 flex items-center justify-around z-50 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]">
        <MobileNavButton icon={<Search size={24}/>} label="Jelajah" isActive={activeTab === 'jelajah'} onClick={() => setActiveTab('jelajah')} />
        <MobileNavButton icon={<List size={24}/>} label="Riwayat" isActive={activeTab === 'saya'} onClick={() => setActiveTab('saya')} />
        <div className="relative -top-6">
          <button onClick={() => navigate('/lapor')} className="bg-[#0a1e3f] text-white p-4 rounded-full shadow-lg shadow-blue-900/40 hover:scale-105 transition-transform active:scale-95">
            <PlusCircle size={28} />
          </button>
        </div>
        <MobileNavButton icon={<User size={24}/>} label="Profil" onClick={() => navigate('/profile')} isActive={false} />
        <button onClick={handleLogout} className="flex flex-col items-center justify-center w-full py-2 text-red-400 active:scale-95 transition-transform">
           <LogOut size={24} className="mb-0.5"/>
           <span className="text-[10px] font-medium">Keluar</span>
        </button>
      </div>

      {/* MAIN CONTENT */}
      <main className={`flex-1 bg-slate-50 min-h-screen transition-all duration-300 md:pl-28 ${isSidebarHovered ? 'md:ml-64' : 'md:ml-0'} pt-6 px-4 md:px-10 pb-28 md:pb-12 h-screen overflow-y-auto`}>
        
        {/* Header User Card */}
        <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 pointer-events-none"></div>
          
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-16 h-16 bg-[#0a1e3f] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/20">
               {profile ? getRoleIcon(profile.role_name) : <User />}
            </div>
            <div>
              <h2 className="text-xl md:text-3xl font-black text-[#0a1e3f] tracking-tight">
                Halo, <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-400">
                  {profile?.nama_lengkap ? profile.nama_lengkap.split(' ')[0] : 'User'}!
                </span>
              </h2>
              <p className="text-slate-500 text-sm md:text-base font-medium mt-1">
                {profile?.role_name === 'mahasiswa' && profile?.specific?.master_prodi?.nama_prodi 
                  ? `Mahasiswa Prodi ${profile.specific.master_prodi.nama_prodi}`
                  : `Selamat datang, ${getRoleLabel(profile?.role_name)}`}
              </p>
            </div>
          </div>

          <div className="flex w-full md:w-auto gap-3 relative z-10">
            <button onClick={() => navigate('/lapor', { state: { tipe: 'kehilangan' } })} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#0a1e3f] text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg hover:bg-blue-900 transition-all active:scale-95">
              <PlusCircle size={18} /> Lapor Hilang
            </button>
            <button onClick={() => navigate('/lapor', { state: { tipe: 'ditemukan' } })} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-[#0a1e3f] border-2 border-slate-100 px-6 py-3 rounded-xl text-sm font-bold hover:border-slate-200 hover:bg-slate-50 transition-all active:scale-95">
              <PlusCircle size={18} /> Lapor Temuan
            </button>
          </div>
        </div>

        {/* --- UPDATE: BAGIAN TAB & SEARCH BAR --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
           
           {/* Bagian Kiri: Icon Tab & Judul */}
           <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg ${activeTab === 'jelajah' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                 {activeTab === 'jelajah' ? <Search size={20}/> : <List size={20}/>}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  {activeTab === 'jelajah' ? 'Jelajah Barang Terkini' : 'Riwayat Laporan Saya'}
                </h3>
                <p className="text-slate-400 text-xs">
                   {activeTab === 'jelajah' ? 'Daftar semua laporan kehilangan & temuan' : 'Memantau status laporan yang Anda buat'}
                </p>
              </div>
           </div>

           {/* Bagian Kanan: Search Input */}
           <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Cari barang..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all text-sm font-medium"
              />
           </div>
        </div>

        {/* Content Grid (Menggunakan filteredPosts) */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-3xl h-80 p-4 border border-slate-100 shadow-sm flex flex-col gap-4 animate-pulse">
                 <div className="w-full h-40 bg-slate-200 rounded-2xl"></div>
                 <div className="w-3/4 h-6 bg-slate-200 rounded-full"></div>
                 <div className="w-1/2 h-4 bg-slate-200 rounded-full"></div>
                 <div className="flex-1"></div>
                 <div className="w-full h-10 bg-slate-200 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-16 text-center flex flex-col items-center justify-center">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mb-6 text-slate-300">
              <Search size={32} />
            </div>
            <h4 className="text-lg font-bold text-slate-700 mb-1">Tidak ada data ditemukan</h4>
            <p className="text-slate-400 text-sm max-w-xs mx-auto">
              Coba kata kunci lain atau pastikan ejaan barang yang Anda cari benar.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
            {filteredPosts.map((item) => (
              <div 
                key={item.id_postingan} 
                className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 overflow-hidden flex flex-col h-full hover:-translate-y-1"
              >
                {/* Gambar */}
                <div className="h-52 bg-slate-100 relative overflow-hidden">
                  {item.foto_barang && item.foto_barang.length > 10 ? (
                    <img src={item.foto_barang} alt={item.nama_barang} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50">
                      <List size={40} className="mb-2 opacity-20"/>
                      <span className="text-xs font-medium">No Image</span>
                    </div>
                  )}
                  
                  {/* Badge Tipe */}
                  <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-lg text-[10px] font-black text-white uppercase tracking-wider shadow-lg
                    ${item.tipe_postingan === 'kehilangan' ? 'bg-red-500' : 'bg-emerald-500'}`}>
                    {item.tipe_postingan}
                  </div>

                  {/* Badge Status (Jika tab Saya) */}
                  {activeTab === 'saya' && (
                     <div className={`absolute bottom-4 right-4 px-3 py-1.5 rounded-lg text-[10px] font-bold text-white uppercase tracking-wider shadow-lg backdrop-blur-md
                      ${item.status_postingan === 'aktif' ? 'bg-blue-600/80' : 'bg-slate-800/80'}`}>
                      {item.status_postingan}
                    </div>
                  )}
                </div>

                {/* Info Content */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-bold text-[#0a1e3f] uppercase tracking-wider bg-blue-50 border border-blue-100 px-2 py-1 rounded-md">
                      {item.master_kategori?.nama_kategori || 'UMUM'}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium bg-slate-50 px-2 py-1 rounded-full">
                      <Clock size={12} /> {formatDate(item.created_at)}
                    </span>
                  </div>
                  
                  <h4 className="text-lg font-bold text-slate-800 mb-2 line-clamp-1 group-hover:text-orange-600 transition-colors">
                    {item.nama_barang}
                  </h4>
                  
                  <div className="flex items-start gap-1.5 mb-4">
                     <MapPin size={14} className="text-orange-500 mt-0.5 flex-shrink-0"/> 
                     <span className="text-xs text-slate-500 font-medium line-clamp-1">{item.lokasi_terlapor}</span>
                  </div>
                  
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-6 flex-1">
                    {item.deskripsi}
                  </p>

                  <div className="pt-4 border-t border-slate-50 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                        {item.akun_pengguna?.nama_lengkap?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="flex flex-col">
                         <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pelapor</span>
                         <span className="text-xs font-bold text-slate-700 truncate max-w-[80px]">
                           {item.akun_pengguna?.nama_lengkap?.split(' ')[0]}
                         </span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleDetailClick(item.id_postingan)}
                      className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-[#0a1e3f] hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg"
                    >
                      <ChevronRight size={18} />
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