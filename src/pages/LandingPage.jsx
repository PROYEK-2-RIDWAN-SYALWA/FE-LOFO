import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Shield, Gift, ArrowRight, CheckCircle, Clock, MapPin, LayoutGrid, ChevronRight } from 'lucide-react';
import ulbiLogo from '../assets/ulbi-logo.png'; 
import { fetchPosts } from '../services/api';

const LandingPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  // Efek Navbar: Transparan -> Glass saat scroll
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
        setItems(data.slice(0, 3)); 
      } catch (error) {
        console.error("Gagal load barang:", error);
      } finally {
        setLoading(false);
      }
    };
    loadPosts();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    // BACKGROUND: Diganti dari Putih ke Abu-abu Kebiruan Lembut (#F1F5F9 - Slate 100)
    <div className="min-h-screen bg-[#F1F5F9] font-sans text-slate-800 selection:bg-orange-200 selection:text-orange-900 overflow-x-hidden relative">
      
      {/* Background Decor (Blob Abstrak untuk kedalaman) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-200/40 rounded-full blur-[120px] mix-blend-multiply"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-orange-100/60 rounded-full blur-[100px] mix-blend-multiply"></div>
        {/* Pola titik-titik halus */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
      </div>

      {/* --- NAVBAR --- */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-white/20 py-3 shadow-sm' : 'bg-transparent py-6'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          {/* Logo Area */}
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-xl shadow-md border border-white/50">
               <img src={ulbiLogo} alt="ULBI" className="h-8 w-auto" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-wide leading-none text-[#0a1e3f]">ULBI</h1>
              <p className="text-[10px] text-orange-600 font-bold tracking-[0.2em]">LOST & FOUND</p>
            </div>
          </div>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center gap-8 bg-white/50 backdrop-blur-md px-6 py-2 rounded-full border border-white/40 shadow-sm">
            {['Beranda', 'Terbaru', 'Panduan'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-semibold text-slate-600 hover:text-[#0a1e3f] transition-colors relative group">
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="flex gap-3">
            <Link to="/login" className="hidden md:block px-6 py-2.5 text-sm font-bold text-[#0a1e3f] hover:bg-white/50 rounded-full transition-all">
              Masuk
            </Link>
            <Link to="/register" className="px-6 py-2.5 text-sm font-bold text-white bg-[#0a1e3f] hover:bg-[#1e3a8a] rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
              Daftar
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <div id="beranda" className="relative z-10 pt-40 pb-24 lg:pt-52 lg:pb-32 px-6">
        <div className="max-w-5xl mx-auto text-center flex flex-col items-center">
          
          {/* Badge */}
          <div className="opacity-0 animate-[fadeInDown_0.8s_ease-out_forwards]">
            <div className="inline-flex items-center gap-2 bg-white/80 border border-white px-4 py-1.5 rounded-full mb-8 shadow-sm backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[11px] font-bold text-slate-500 tracking-widest uppercase">Sistem Keamanan Kampus Terintegrasi</span>
            </div>
          </div>
          
          {/* Headline */}
          <h1 className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.2s_forwards] text-5xl md:text-7xl font-black text-[#0a1e3f] mb-6 leading-tight tracking-tight drop-shadow-sm">
            Kehilangan Barang di <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-500">
              Lingkungan ULBI?
            </span>
          </h1>
          
          {/* Description */}
          <p className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.4s_forwards] text-lg md:text-xl text-slate-600 mb-12 leading-relaxed max-w-2xl mx-auto font-medium">
            Platform resmi mahasiswa dan staf ULBI untuk melaporkan kehilangan atau penemuan barang secara aman, cepat, dan transparan.
          </p>
          
          {/* Buttons */}
          <div className="opacity-0 animate-[fadeInUp_0.8s_ease-out_0.6s_forwards] flex flex-col sm:flex-row justify-center gap-5 w-full sm:w-auto">
            <button 
              onClick={() => navigate('/lapor', { state: { tipe: 'kehilangan' } })}
              className="group relative px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold shadow-xl shadow-orange-500/20 transition-all hover:-translate-y-1 overflow-hidden"
            >
              <div className="flex items-center gap-3 relative z-10">
                <Search className="w-5 h-5" />
                <span>Saya Kehilangan Barang</span>
              </div>
            </button>

            <button 
              onClick={() => navigate('/lapor', { state: { tipe: 'ditemukan' } })}
              className="group px-8 py-4 bg-white text-[#0a1e3f] border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all hover:-translate-y-1 shadow-md hover:shadow-lg flex items-center justify-center gap-3"
            >
              <Gift className="w-5 h-5 text-blue-600" />
              <span>Saya Menemukan Barang</span>
            </button>
          </div>
        </div>
      </div>

      {/* --- LIVE FEED SECTION --- */}
      {/* Background Section dibedakan sedikit (Putih) agar kontras dengan Hero */}
      <div id="terbaru" className="relative z-10 py-24 px-6 bg-white/60 backdrop-blur-sm border-t border-white/40 shadow-[0_-20px_40px_-20px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-16 opacity-0 animate-[fadeIn_1s_ease-out_0.8s_forwards]">
            <div>
              <h2 className="text-3xl font-bold text-[#0a1e3f] mb-2">Laporan Terkini</h2>
              <p className="text-slate-500">Data pelaporan barang yang masuk secara real-time.</p>
            </div>
            <Link to="/login" className="hidden sm:flex items-center gap-2 text-blue-600 font-bold hover:text-blue-800 transition-all group">
              Lihat Semua <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
               {[1,2,3].map(i => <div key={i} className="h-96 bg-slate-200/50 rounded-[2rem]"></div>)}
             </div>
          ) : items.length === 0 ? (
             <div className="text-center py-24 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
               <Search size={48} className="mx-auto text-slate-300 mb-4"/>
               <p className="text-slate-500">Belum ada data laporan saat ini.</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {items.map((item, index) => (
                // CARD DESIGN: Glassy White
                <div 
                  key={item.id_postingan} 
                  className="group relative bg-white border border-white/50 rounded-[2.5rem] overflow-hidden hover:border-blue-200 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2 opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]"
                  style={{ animationDelay: `${index * 0.2}s` }} 
                >
                  
                  {/* Image Area */}
                  <div className="h-60 overflow-hidden relative bg-slate-100">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {item.foto_barang && item.foto_barang.length > 10 ? (
                       <img src={item.foto_barang} alt={item.nama_barang} className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700" />
                    ) : (
                       <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50"><LayoutGrid size={40}/></div>
                    )}
                    
                    <div className="absolute top-4 right-4 z-20">
                      <span className="bg-white/90 backdrop-blur-md text-[#0a1e3f] text-[10px] font-bold px-3 py-1 rounded-full shadow-sm tracking-wider uppercase border border-white">
                        {item.kategori || 'UMUM'}
                      </span>
                    </div>
                    
                    <div className={`absolute bottom-4 left-4 z-20 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 backdrop-blur-md shadow-lg text-white border border-white/20
                      ${item.tipe_postingan === 'kehilangan' ? 'bg-red-500/90' : 'bg-green-600/90'}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
                      {item.tipe_postingan}
                    </div>
                  </div>

                  {/* Content Body */}
                  <div className="p-8">
                    <h3 className="text-xl font-bold text-[#0a1e3f] mb-3 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {item.nama_barang}
                    </h3>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-sm text-slate-500">
                        <MapPin size={16} className="text-orange-500" /> 
                        <span className="truncate">{item.lokasi_terlapor}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-500">
                        <Clock size={16} className="text-blue-500" /> 
                        {formatDate(item.tgl_postingan)}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                          {item.akun_pengguna?.nama_lengkap?.charAt(0) || 'U'}
                        </div>
                        <span className="text-xs font-bold text-slate-500 truncate max-w-[100px]">
                          {item.akun_pengguna?.nama_lengkap?.split(' ')[0] || 'User'}
                        </span>
                      </div>
                      <button onClick={() => navigate('/login')} className="text-sm font-bold text-[#0a1e3f] flex items-center gap-2 hover:gap-3 transition-all group/btn">
                        Detail <ChevronRight size={16} className="text-orange-500 group-hover/btn:translate-x-1 transition-transform"/>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- HOW IT WORKS --- */}
      <div id="panduan" className="py-24 px-6 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl font-bold text-[#0a1e3f] mb-4">Sistem Keamanan Kampus</h2>
            <p className="text-slate-500">Proses pelaporan dan pengambilan barang yang terstruktur dan aman.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector Line */}
            <div className="hidden md:block absolute top-12 left-20 right-20 h-0.5 bg-slate-200 -z-10 border-t border-dashed border-slate-300"></div>

            {[
              { icon: <Search className="w-8 h-8 text-blue-600" />, title: "1. Pelaporan Cepat", desc: "Laporkan kehilangan atau penemuan dalam hitungan detik melalui dashboard terintegrasi." },
              { icon: <Shield className="w-8 h-8 text-orange-500" />, title: "2. Validasi Data", desc: "Sistem akan memvalidasi kecocokan data. Keamanan terjamin dengan verifikasi akun kampus." },
              { icon: <CheckCircle className="w-8 h-8 text-green-600" />, title: "3. Klaim Aman", desc: "Proses pengembalian barang dilakukan di titik aman kampus dengan bukti serah terima." }
            ].map((step, idx) => (
              <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group border border-slate-100">
                <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform mx-auto">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-[#0a1e3f] mb-3 text-center">{step.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm text-center">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- FOOTER --- */}
      <footer className="bg-[#0a1e3f] text-white py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h4 className="font-bold text-lg tracking-wider mb-1 flex items-center gap-2 justify-center md:justify-start">
              <div className="bg-white p-2 rounded-xl shadow-md border border-white/50">
               <img src={ulbiLogo} alt="ULBI" className="h-8 w-auto" />
            </div> ULBI LOFO
            </h4>
            <p className="text-xs text-blue-200 opacity-80">Universitas Logistik & Bisnis Internasional</p>
          </div>
          <div className="flex gap-8 text-sm font-medium">
            <a href="#" className="hover:text-orange-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-orange-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-orange-400 transition-colors">Contact</a>
          </div>
          <div className="text-xs text-blue-300 opacity-60">
            &copy; 2025 ULBI Lost & Found. By Ridwan & Syalwa.
          </div>
        </div>
      </footer>

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