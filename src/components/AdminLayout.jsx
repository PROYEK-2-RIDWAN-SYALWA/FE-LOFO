import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, FileText, LogOut, ShieldAlert, Tag, Building, Menu, X } from 'lucide-react';

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
    { icon: <Tag size={20} />, label: 'Kategori Barang', path: '/admin/categories' },
    { icon: <Building size={20} />, label: 'Program Studi', path: '/admin/prodi' },
  ];

  // Component Helper: NavButton 
  // Unified Logic:
  // - Icon selalu visible
  // - Text visible di Mobile (drawer)
  // - Text hidden di Desktop Collapsed -> Visible di Desktop Hovered
  const NavButton = ({ icon, label, path, isAction }) => {
    const isActive = location.pathname === path;
    const onClick = isAction ? path : () => {
      navigate(path);
      setIsMobileSidebarOpen(false); // Close drawer on mobile click
    };

    return (
      <button
        onClick={onClick}
        className={`relative flex items-center h-12 rounded-xl transition-all duration-300 mb-2 group shrink-0 overflow-hidden
          ${isActive
            ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20'
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }
          /* Width Logic */
          /* Mobile: Always Full Width (inside drawer) */
          w-full px-4 gap-3 justify-start

          /* Desktop: Conditional Width */
          md:w-auto md:px-0 md:justify-center md:gap-0
          ${isSidebarHovered ? 'md:!w-full md:!justify-start md:!px-4 md:!gap-3' : 'md:w-12 md:mx-auto'}
        `}
      >
        <span className="flex-shrink-0">{icon}</span>

        {/* Label Text */}
        <span className={`whitespace-nowrap font-medium text-sm transition-all duration-300 origin-left
          /* Mobile: Always Visible */
          opacity-100 w-auto

          /* Desktop: Conditional Visibility */
          md:absolute md:left-12 
          ${isSidebarHovered ? 'md:static md:opacity-100 md:w-auto md:left-auto' : 'md:opacity-0 md:w-0 md:overflow-hidden'}
        `}>
          {label}
        </span>

        {/* Tooltip for Desktop Collapsed State */}
        {!isSidebarHovered && (
          <div className="hidden md:block absolute left-14 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-[60] pointer-events-none whitespace-nowrap">
            {label}
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-800">

      {/* === MOBILE HEADER BAR === */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-[#0f172a] text-white p-4 flex items-center justify-between z-40 shadow-xl h-16">
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

      {/* === SIDEBAR (DESKTOP + MOBILE DRAWER) === */}
      <aside
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
        className={`fixed left-0 top-0 h-screen bg-[#0f172a] text-white z-50 py-6 shadow-2xl transition-all duration-300 ease-in-out flex flex-col justify-between border-r border-slate-800
          
          /* Mobile Logic (Drawer) */
          w-72 px-4
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}

          /* Desktop Logic (Hover Expand) */
          md:translate-x-0
          ${isSidebarHovered ? 'md:w-72 md:px-4' : 'md:w-20 md:px-2'}
        `}
      >
        <div>
          {/* Header Sidebar Logo */}
          <div className={`flex items-center mb-10 transition-all duration-300 h-12 relative
             /* Desktop Alignment */
             ${isSidebarHovered ? 'md:justify-start md:gap-3 md:pl-2' : 'md:justify-center'}
             /* Mobile Alignment */
             justify-between
            `}
          >
            {/* Logo Group */}
            <div className={`flex items-center gap-3 transition-all duration-300`}>
              <div className="bg-orange-600 p-2 rounded-lg flex-shrink-0 shadow-lg shadow-orange-500/20">
                <ShieldAlert size={24} className="text-white" />
              </div>

              {/* Text: Hidden on Desktop Collapsed, Visible on Hover & Mobile */}
              <div className={`overflow-hidden transition-all duration-300 flex flex-col justify-center whitespace-nowrap
                    md:absolute md:left-14
                    ${isSidebarHovered ? 'md:static md:opacity-100 md:w-auto' : 'md:opacity-0 md:w-0'}
                    opacity-100 w-auto
                `}>
                <h1 className="text-lg font-bold leading-none tracking-wide text-white">ADMIN</h1>
                <p className="text-[9px] text-slate-400 font-bold tracking-[0.2em] mt-1">PANEL</p>
              </div>
            </div>

            {/* Tombol Close (Mobile Only) */}
            <button onClick={() => setIsMobileSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white p-1">
              <X size={24} />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="space-y-1 flex flex-col">
            {menuItems.map((item) => (
              <NavButton key={item.path} {...item} />
            ))}
          </nav>
        </div>

        {/* Footer Sidebar (Logout) */}
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
      {/* 
         Mobile Main Content:
         - Margin Top 16 (64px) untuk kompensasi Header Bar Fixed
         - Margin Left 0 (Sidebar hidden/drawer)
      */}
      <main className={`flex-1 min-h-screen bg-[#F8FAFC] transition-all duration-300 ease-in-out
        mt-16 p-4
        
        md:mt-0 md:p-10 
        ${isSidebarHovered ? 'md:ml-72' : 'md:ml-20'}
      `}>
        <div className="max-w-7xl mx-auto space-y-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;