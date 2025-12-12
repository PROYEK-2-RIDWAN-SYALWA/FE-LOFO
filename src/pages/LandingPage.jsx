import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Gift, ArrowRight, Clock, MapPin, ChevronRight, Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import ulbiLogo from '../assets/ulbi-logo.png'; 
import { fetchPosts } from '../services/api';

const LandingPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  // Efek Navbar: Transparan -> Solid saat scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load Data
  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await fetchPosts();
        // Filter hanya yang aktif
        const activePosts = data.filter(post => post.status_postingan === 'aktif');
        setItems(activePosts.slice(0, 3)); 
      } catch (error) {
        console.error("Gagal load barang:", error);
      } finally {
        setLoading(false);
      }
    };
    loadPosts();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen font-sans text-slate-800 bg-white selection:bg-orange-200 selection:text-orange-900 overflow-x-hidden">
      
      {/* --- NAVBAR --- */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#0a1e3f] py-3 shadow-lg' : 'bg-transparent py-6'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-lg shadow-sm">
               <img src={ulbiLogo} alt="ULBI" className="h-8 w-auto" onError={(e) => e.target.style.display = 'none'} />
            </div>
            <div className="hidden sm:block">
              <h1 className={`text-lg font-extrabold tracking-wide leading-none ${scrolled ? 'text-white' : 'text-white'}`}>ULBI</h1>
              <p className={`text-[9px] font-bold tracking-[0.2em] ${scrolled ? 'text-orange-400' : 'text-orange-300'}`}>LOST & FOUND</p>
            </div>
          </div>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center gap-8">
            {['Beranda', 'Terbaru', 'Panduan'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-blue-100 hover:text-white transition-colors relative group">
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="flex gap-3">
            <Link to="/login" className="px-5 py-2 text-sm font-bold text-white hover:text-orange-300 transition-colors">
              Masuk
            </Link>
            <Link to="/register" className="px-6 py-2 text-sm font-bold text-[#0a1e3f] bg-white hover:bg-orange-50 rounded-full transition-all shadow-lg hover:shadow-orange-500/20 transform hover:-translate-y-0.5">
              Daftar
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <div id="beranda" className="relative bg-[#0a1e3f] pb-32 pt-40 px-6 overflow-hidden">
        {/* Dekorasi Background */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500 rounded-full blur-[120px] opacity-20 -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-500 rounded-full blur-[100px] opacity-10 -ml-20 -mb-20"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full mb-8 backdrop-blur-sm animate-[fadeInDown_0.8s_ease-out_forwards] opacity-0">
            <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
            <span className="text-[11px] font-bold text-blue-100 tracking-widest uppercase">Sistem Resmi Kampus ULBI</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight drop-shadow-lg animate-[fadeInUp_0.8s_ease-out_0.2s_forwards] opacity-0">
            Kehilangan Barang? <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-200">
              Temukan di Sini.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-blue-100/80 mb-12 leading-relaxed max-w-2xl mx-auto font-light animate-[fadeInUp_0.8s_ease-out_0.4s_forwards] opacity-0">
            Layanan terintegrasi bagi civitas akademika ULBI untuk melaporkan kehilangan dan penemuan barang secara aman & transparan.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-5 w-full sm:w-auto animate-[fadeInUp_0.8s_ease-out_0.6s_forwards] opacity-0">
            
            {/* TOMBOL KEHILANGAN (Redirect ke Login) */}
            <button 
              onClick={() => navigate('/login')} 
              className="group relative px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-xl shadow-orange-900/30 transition-all hover:-translate-y-1 overflow-hidden"
            >
              <div className="flex items-center gap-3 relative z-10">
                <AlertTriangle className="w-5 h-5" />
                <span>Saya Kehilangan Barang</span>
              </div>
            </button>

            {/* TOMBOL DITEMUKAN (Redirect ke Login) */}
            <button 
              onClick={() => navigate('/login')} 
              className="group px-8 py-4 bg-transparent border border-white/30 text-white rounded-xl font-bold hover:bg-white/10 transition-all hover:-translate-y-1 flex items-center justify-center gap-3"
            >
              <CheckCircle className="w-5 h-5 text-blue-300" />
              <span>Saya Menemukan Barang</span>
            </button>
          </div>
        </div>
      </div>

      {/* --- LIVE FEED SECTION --- */}
      <div id="terbaru" className="relative z-20 -mt-20 px-6 pb-24">
        <div className="max-w-7xl mx-auto">
          
          {/* Section Header */}
          <div className="flex justify-between items-end mb-8 px-2 animate-[fadeIn_1s_ease-out_0.8s_forwards] opacity-0">
            <h2 className="text-2xl font-bold text-white drop-shadow-md">Laporan Terbaru</h2>
            <Link to="/login" className="hidden sm:flex items-center gap-2 text-orange-400 font-bold hover:text-orange-300 transition-all text-sm group">
              Lihat Semua <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
               {[1,2,3].map(i => <div key={i} className="h-80 bg-white/20 backdrop-blur-sm rounded-3xl"></div>)}
             </div>
          ) : items.length === 0 ? (
             <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-xl">
               <Search size={48} className="mx-auto text-slate-300 mb-4"/>
               <p className="text-slate-500 font-medium">Belum ada laporan aktif saat ini.</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {items.map((item, index) => (
                <div 
                  key={item.id_postingan} 
                  className="group bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300 hover:-translate-y-2 opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]"
                  style={{ animationDelay: `${index * 0.15}s` }} 
                >
                  {/* Image Area */}
                  <div className="h-56 overflow-hidden relative bg-slate-100">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a1e3f]/60 to-transparent z-10"></div>
                    
                    {item.foto_barang && item.foto_barang.length > 10 ? (
                       <img src={item.foto_barang} alt={item.nama_barang} className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700" />
                    ) : (
                       <div className="w-full h-full flex items-center justify-center text-slate-300"><Gift size={40}/></div>
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-4 right-4 z-20">
                      <span className="bg-white/95 text-[#0a1e3f] text-[10px] font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wide">
                        {item.master_kategori?.nama_kategori || 'UMUM'}
                      </span>
                    </div>
                    <div className={`absolute bottom-4 left-4 z-20 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm text-white
                      ${item.tipe_postingan === 'kehilangan' ? 'bg-red-500' : 'bg-green-600'}`}>
                      {item.tipe_postingan}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-[#0a1e3f] mb-2 line-clamp-1 group-hover:text-orange-600 transition-colors">
                      {item.nama_barang}
                    </h3>
                    
                    <div className="space-y-2 mb-6 border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                        <MapPin size={14} className="text-orange-500" /> 
                        <span className="truncate">{item.lokasi_terlapor}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                        <Clock size={14} className="text-blue-500" /> 
                        {formatDate(item.created_at || item.tgl_postingan)}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-[#0a1e3f] text-white flex items-center justify-center text-[10px] font-bold">
                          {item.akun_pengguna?.nama_lengkap?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <span className="text-xs font-bold text-slate-500 truncate max-w-[80px]">
                          {item.akun_pengguna?.nama_lengkap?.split(' ')[0] || 'User'}
                        </span>
                      </div>
                      <button onClick={() => navigate('/login')} className="text-xs font-bold text-[#0a1e3f] flex items-center gap-1 hover:gap-2 transition-all group/btn bg-slate-50 px-3 py-1.5 rounded-full hover:bg-slate-100">
                        Detail <ChevronRight size={14} className="text-orange-500"/>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- PANDUAN SECTION --- */}
      <div id="panduan" className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-[#0a1e3f] mb-4">Alur Pelaporan</h2>
            <p className="text-slate-500">Sistem dirancang untuk keamanan dan kemudahan seluruh warga kampus.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Search className="w-6 h-6 text-white" />, color: "bg-blue-600", title: "1. Lapor Cepat", desc: "Isi formulir kehilangan atau penemuan barang melalui dashboard yang tersedia." },
              { icon: <Shield className="w-6 h-6 text-white" />, color: "bg-orange-500", title: "2. Verifikasi", desc: "Sistem memvalidasi data. Hanya pengguna terverifikasi yang dapat membuat laporan." },
              { icon: <Gift className="w-6 h-6 text-white" />, color: "bg-green-600", title: "3. Kembali Aman", desc: "Lakukan pertemuan di area kampus yang aman (Pos Satpam/Gedung Utama) untuk serah terima." }
            ].map((step, idx) => (
              <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center hover:-translate-y-2 transition-transform duration-300">
                <div className={`w-14 h-14 ${step.color} rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg shadow-slate-200`}>
                  {step.icon}
                </div>
                <h3 className="text-lg font-bold text-[#0a1e3f] mb-3">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- FOOTER --- */}
      <footer className="bg-[#0a1e3f] text-white py-10 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-lg">
               <img src={ulbiLogo} alt="ULBI" className="h-6 w-auto" onError={(e) => e.target.style.display = 'none'} />
            </div>
            <div>
                <span className="font-bold tracking-wider text-sm">ULBI LOFO</span>
                <p className="text-[10px] text-blue-300">Universitas Logistik & Bisnis Internasional</p>
            </div>
          </div>
          
          <div className="flex gap-6 text-xs font-medium text-blue-200">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact Support</a>
          </div>
          
          <div className="text-[10px] text-blue-400">
            &copy; 2025 ULBI Lost & Found.
          </div>
        </div>
      </footer>

      {/* Custom Keyframes untuk Animasi */}
      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
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

export default LandingPage;