// File: src/components/AdminLayout.jsx
import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, FileText, LogOut, ShieldAlert } from 'lucide-react';

const AdminLayout = () => {
  // 1. PERBAIKAN: Gunakan 'signOut' (bukan logout)
  const { signOut } = useAuth(); 
  const navigate = useNavigate();
  const location = useLocation();
  
  // 2. FITUR BARU: State untuk Sidebar Collapse
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(); // Hapus sesi dari Supabase Client & Context
      
      // 3. TAMBAHAN: Paksa hapus dari LocalStorage agar bersih total
      // Mencari key yang berawalan 'sb-' dan menghapusnya
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-')) localStorage.removeItem(key);
      });
      
      navigate('/login');
    } catch (error) {
      console.error("Gagal Logout:", error);
    }
  };

  const menuItems = [
    { icon: <LayoutDashboard size={22} />, label: 'Overview', path: '/admin/dashboard' },
    { icon: <Users size={22} />, label: 'Manajemen User', path: '/admin/users' },
    { icon: <FileText size={22} />, label: 'Moderasi Laporan', path: '/admin/posts' },
  ];

  // Komponen Tombol Navigasi (Identik dengan Dashboard User tapi versi Gelap)
  const NavButton = ({ icon, label, path }) => {
    const isActive = location.pathname === path;
    return (
      <button 
        onClick={() => navigate(path)}
        className={`relative flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 w-full mb-1.5
          ${isActive 
            ? 'bg-orange-600 text-white shadow-md shadow-orange-900/20' 
            : 'text-slate-400 hover:bg-white/5 hover:text-white'
          } ${isSidebarHovered ? 'justify-start' : 'justify-center'}`}
      >
        <span className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110">{icon}</span>
        <span className={`whitespace-nowrap font-medium text-sm transition-all duration-300 origin-left
          ${isSidebarHovered ? 'opacity-100 scale-100 ml-2' : 'opacity-0 scale-0 w-0 overflow-hidden'}`}>
          {label}
        </span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans text-slate-800 overflow-hidden">
      
      {/* === SIDEBAR ADMIN (COLLAPSIBLE) === */}
      <aside 
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
        className={`fixed left-0 top-0 h-screen bg-slate-900 text-white z-50 py-6 shadow-2xl border-r border-white/5 transition-all duration-300 ease-in-out flex flex-col justify-between
          ${isSidebarHovered ? 'w-72 px-4' : 'w-24 px-3'}`}
      >
        <div>
          {/* Header Logo */}
          <div className={`flex items-center mb-12 mt-2 transition-all duration-300 ${isSidebarHovered ? 'justify-start pl-2 gap-4' : 'justify-center'}`}>
            <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2 rounded-xl flex-shrink-0 shadow-lg shadow-orange-900/30">
              <ShieldAlert size={28} className="text-white" />
            </div>
            
            <div className={`overflow-hidden transition-all duration-300 flex flex-col ${isSidebarHovered ? 'w-auto opacity-100' : 'w-0 opacity-0'}`}>
               <h1 className="text-lg font-black leading-none tracking-wide text-white">ADMIN</h1>
               <p className="text-[10px] text-slate-400 font-bold tracking-[0.2em] mt-1">PANEL KONTROL</p>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <NavButton key={item.path} {...item} />
            ))}
          </nav>
        </div>

        {/* Tombol Keluar */}
        <button 
          onClick={handleLogout}
          className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all group
            ${isSidebarHovered ? '' : 'justify-center'}`}
        >
          <LogOut size={22} className="group-hover:-translate-x-1 transition-transform" />
          <span className={`whitespace-nowrap font-medium text-sm transition-all duration-300 
            ${isSidebarHovered ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>
            Keluar
          </span>
        </button>
      </aside>

      {/* === KONTEN UTAMA === */}
      {/* Margin kiri menyesuaikan state sidebar (Default 24/96px agar pas dengan state collapsed) */}
      <main className={`flex-1 bg-slate-100 min-h-screen transition-all duration-300 
        pl-24 ${isSidebarHovered ? 'ml-0' : 'ml-0'} 
        p-8 h-screen overflow-y-auto`}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;