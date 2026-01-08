import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, FileText, LogOut, ShieldAlert, Tag, Building, Menu, X, Activity } from 'lucide-react';

const AdminLayout = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // State Desktop Hover
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  // State Mobile Drawer
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-')) localStorage.removeItem(key);
      });
      navigate('/login');
    } catch (error) {
      console.error("Gagal Logout:", error);
    }
  };

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Overview', path: '/admin/dashboard' },
    { icon: <Users size={20} />, label: 'Manajemen User', path: '/admin/users' },
    { icon: <FileText size={20} />, label: 'Moderasi Laporan', path: '/admin/posts' },
    { icon: <Activity size={20} />, label: 'Monitoring Post', path: '/admin/monitoring' },
    { icon: <Tag size={20} />, label: 'Kategori Barang', path: '/admin/categories' },
    { icon: <Building size={20} />, label: 'Program Studi', path: '/admin/prodi' },
  ];

  const NavButton = ({ icon, label, path, isAction }) => {
    const isActive = location.pathname === path;
    const onClick = isAction ? path : () => {
      navigate(path);
      setIsMobileSidebarOpen(false);
    };

    return (
      <button
        onClick={onClick}
        className={`
          relative flex items-center h-12 mb-2 rounded-xl transition-all duration-300 group overflow-hidden
          ${isActive
            ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20'
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }
          /* Mobile: Selalu Full & Rata Kiri */
          w-full px-4 gap-3 justify-start

          /* Desktop: Responsif */
          md:w-full
          ${isSidebarHovered
            ? 'md:px-4 md:justify-start md:gap-3'
            : 'md:px-0 md:justify-center md:gap-0'
          }
        `}
      >
        <span className="flex-shrink-0 transition-transform duration-300">{icon}</span>

        <span className={`
          whitespace-nowrap font-medium text-sm transition-all duration-300 origin-left
          /* Mobile: Selalu Tampil */
          opacity-100 w-auto translate-x-0

          /* Desktop Logic */
          md:absolute md:left-12
          ${isSidebarHovered
            ? 'md:static md:opacity-100 md:w-auto md:translate-x-0'
            : 'md:opacity-0 md:w-0 md:-translate-x-4 pointer-events-none'
          }
        `}>
          {label}
        </span>

        {/* Tooltip Hover (Desktop Collapsed) */}
        {!isSidebarHovered && (
          <div className="hidden md:block absolute left-14 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-[60] pointer-events-none whitespace-nowrap shadow-xl">
            {label}
          </div>
        )}
      </button>
    );
  };

  return (
    // PERBAIKAN PENTING: overflow-x-hidden di root agar mobile tidak bisa geser kanan
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-800 overflow-x-hidden w-full relative">

      {/* === MOBILE HEADER BAR === */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-[#0f172a] text-white px-4 flex items-center justify-between z-40 shadow-xl h-16 w-full">
        <div className="flex items-center gap-3">
          <div className="bg-orange-600 p-1.5 rounded-lg shadow-lg shadow-orange-500/20">
            <ShieldAlert size={20} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-wide">ADMIN PANEL</span>
        </div>
        <button onClick={() => setIsMobileSidebarOpen(true)} className="p-2 active:bg-slate-800 rounded-lg transition-colors">
          <Menu size={24} />
        </button>
      </div>

      {/* === MOBILE DRAWER OVERLAY === */}
      <div
        onClick={() => setIsMobileSidebarOpen(false)}
        className={`fixed inset-0 bg-black/60 z-[45] backdrop-blur-sm transition-opacity duration-300 md:hidden
          ${isMobileSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
      />

      {/* === SIDEBAR === */}
      <aside
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
        className={`
          fixed left-0 top-0 h-screen bg-[#0f172a] text-white z-50 py-6 shadow-2xl 
          transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] 
          flex flex-col justify-between border-r border-slate-800
          
          /* Mobile Logic */
          w-[85vw] max-w-[300px] px-4
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}

          /* Desktop Logic */
          md:translate-x-0
          ${isSidebarHovered ? 'md:w-72 md:px-4' : 'md:w-20 md:px-2'}
        `}
      >
        <div>
          {/* HEADER LOGO DIPERBAIKI (Mencegah Tabrakan) */}
          <div className={`
            flex items-center mb-10 h-12 transition-all duration-300
            /* Mobile: Space Between (Logo Kiri, Close Kanan) */
            justify-between md:justify-center
            
            /* Desktop: Conditional Justify & Gap */
            ${isSidebarHovered ? 'md:justify-start md:gap-3 md:pl-2' : 'md:justify-center md:gap-0'}
          `}>

            {/* Logo Icon & Text Wrapper */}
            <div className="flex items-center gap-3 overflow-hidden">
              {/* Icon (Fixed Size) */}
              <div className="bg-orange-600 p-2 rounded-lg flex-shrink-0 shadow-lg shadow-orange-500/20 z-10 relative">
                <ShieldAlert size={24} className="text-white" />
              </div>

              {/* Text (Animasi Width & Opacity Murni - Tanpa Absolute) */}
              <div className={`
                    flex flex-col justify-center whitespace-nowrap transition-all duration-300 ease-in-out origin-left
                    ${isSidebarHovered
                  ? 'w-32 opacity-100 scale-100' // Desktop Expanded
                  : 'md:w-0 md:opacity-0 md:scale-95 w-32 opacity-100' // Desktop Collapsed (Hidden) vs Mobile (Visible)
                }
                `}>
                <h1 className="text-lg font-bold leading-none tracking-wide text-white">ADMIN</h1>
                <p className="text-[9px] text-slate-400 font-bold tracking-[0.2em] mt-1">PANEL</p>
              </div>
            </div>

            {/* Tombol Close (Hanya Mobile) */}
            <button onClick={() => setIsMobileSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white p-1">
              <X size={24} />
            </button>
          </div>

          <nav className="space-y-1 flex flex-col">
            {menuItems.map((item) => (
              <NavButton key={item.path} {...item} />
            ))}
          </nav>
        </div>

        <div className="border-t border-slate-800 pt-4 mt-2">
          <NavButton
            icon={<LogOut size={20} />}
            label="Keluar"
            path={handleLogout}
            isAction={true}
          />
        </div>
      </aside>

      {/* === KONTEN UTAMA === */}
      <main className={`
        flex-1 min-h-screen bg-[#F8FAFC] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
        /* Mobile: Top Margin untuk Header */
        mt-16 p-4 w-full
        
        /* Desktop */
        md:mt-0 md:p-10 
        ${isSidebarHovered ? 'md:ml-72' : 'md:ml-20'}
      `}>
        {/* max-w-full mencegah konten dalam melebarkan main container */}
        <div className="max-w-7xl mx-auto space-y-6 w-full max-w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;