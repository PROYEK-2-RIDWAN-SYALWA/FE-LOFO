import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, FileText, LogOut, ShieldAlert, Tag, Building } from 'lucide-react';

const AdminLayout = () => {
  const { signOut } = useAuth(); 
  const navigate = useNavigate();
  const location = useLocation();
  
  // State untuk Sidebar Collapse
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(); 
      // Hapus sisa token di local storage agar bersih
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
    { icon: <Tag size={20} />, label: 'Kategori Barang', path: '/admin/categories' },
    { icon: <Building size={20} />, label: 'Program Studi', path: '/admin/prodi' },
  ];

  // Komponen Helper: Tombol Navigasi
  const NavButton = ({ icon, label, path }) => {
    const isActive = location.pathname === path;
    return (
      <button 
        onClick={() => navigate(path)}
        className={`relative flex items-center h-12 rounded-xl transition-all duration-300 mb-2 group
          ${isActive 
            ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20' 
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          } 
          ${isSidebarHovered ? 'w-full px-4 gap-3 justify-start' : 'w-12 mx-auto justify-center'}
        `}
      >
        {/* Icon Wrapper agar posisi stabil */}
        <span className="flex-shrink-0">{icon}</span>

        {/* Text Label (Hilang saat collapsed) */}
        <span className={`whitespace-nowrap font-medium text-sm transition-all duration-300 origin-left
          ${isSidebarHovered ? 'opacity-100 w-auto translate-x-0' : 'opacity-0 w-0 -translate-x-4 overflow-hidden absolute left-10'}`}>
          {label}
        </span>

        {/* Tooltip saat Collapsed (Optional UX) */}
        {!isSidebarHovered && (
          <div className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
            {label}
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-800">
      
      {/* === SIDEBAR ADMIN === */}
      <aside 
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
        className={`fixed left-0 top-0 h-screen bg-[#0f172a] text-white z-50 py-6 shadow-2xl transition-all duration-300 ease-in-out flex flex-col justify-between border-r border-slate-800
          ${isSidebarHovered ? 'w-72 px-4' : 'w-20 px-2'} 
        `}
      >
        <div>
          {/* Header Logo */}
          <div className={`flex items-center mb-10 transition-all duration-300 h-12 
            ${isSidebarHovered ? 'justify-start pl-2 gap-3' : 'justify-center'}`}
          >
            <div className="bg-orange-600 p-2 rounded-lg flex-shrink-0 shadow-lg shadow-orange-500/20">
              <ShieldAlert size={24} className="text-white" />
            </div>
            
            <div className={`overflow-hidden transition-all duration-300 flex flex-col justify-center
              ${isSidebarHovered ? 'opacity-100 w-auto ml-0' : 'opacity-0 w-0 -ml-0'}`}>
               <h1 className="text-lg font-bold leading-none tracking-wide text-white">ADMIN</h1>
               <p className="text-[9px] text-slate-400 font-bold tracking-[0.2em] mt-1">PANEL</p>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="space-y-1 flex flex-col">
            {menuItems.map((item) => (
              <NavButton key={item.path} {...item} />
            ))}
          </nav>
        </div>

        {/* Tombol Keluar */}
        <div className="border-t border-slate-800 pt-4 mt-2">
          <button 
            onClick={handleLogout}
            className={`relative flex items-center h-12 rounded-xl transition-all duration-300 group hover:bg-red-500/10 hover:text-red-400 text-slate-400
              ${isSidebarHovered ? 'w-full px-4 gap-3 justify-start' : 'w-12 mx-auto justify-center'}
            `}
          >
            <LogOut size={20} className="flex-shrink-0" />
            <span className={`whitespace-nowrap font-medium text-sm transition-all duration-300
              ${isSidebarHovered ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden absolute'}`}>
              Keluar
            </span>
          </button>
        </div>
      </aside>

      {/* === KONTEN UTAMA === */}
      {/* ml-20 : Margin kiri saat sidebar collapsed (80px)
          ml-72 : Margin kiri saat sidebar expanded (288px)
          p-10  : Padding internal agar konten tidak nempel ke pinggir
      */}
      <main className={`flex-1 min-h-screen bg-[#F8FAFC] transition-all duration-300 ease-in-out
        ${isSidebarHovered ? 'ml-72' : 'ml-20'} 
        p-8 md:p-10 overflow-y-auto`}
      >
        <div className="max-w-7xl mx-auto space-y-6">
           <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;