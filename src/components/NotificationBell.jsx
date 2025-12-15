import { useState, useEffect, useRef } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { fetchNotifications, markNotificationAsRead } from '../services/api';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Load Notifikasi
  const loadNotif = async () => {
    try {
      const data = await fetchNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Gagal load notifikasi:", error);
    }
  };

  useEffect(() => {
    loadNotif();
    // Auto-refresh setiap 60 detik (Simple Polling)
    const interval = setInterval(loadNotif, 60000);
    return () => clearInterval(interval);
  }, []);

  // Tutup dropdown jika klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkRead = async (id, link) => {
    try {
      await markNotificationAsRead(id);
      // Update UI Lokal
      setNotifications(prev => prev.map(n => 
        (id === 'all' || n.id_notifikasi === id) ? { ...n, is_read: true } : n
      ));
      
      if (link) {
        navigate(link);
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Gagal tandai baca:", error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Tombol Lonceng */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-[#0a1e3f] transition-all"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-[fadeIn_0.2s_ease-out]">
          <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-slate-700 text-sm">Notifikasi</h3>
            {unreadCount > 0 && (
              <button 
                onClick={() => handleMarkRead('all')}
                className="text-xs text-orange-600 font-bold hover:underline"
              >
                Tandai semua dibaca
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Tidak ada notifikasi baru.
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id_notifikasi}
                  onClick={() => handleMarkRead(notif.id_notifikasi, notif.link_terkait)}
                  className={`p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors
                    ${!notif.is_read ? 'bg-blue-50/50' : 'bg-white'}`}
                >
                  <div className="flex gap-3">
                    <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${!notif.is_read ? 'bg-orange-500' : 'bg-slate-300'}`}></div>
                    <div>
                      <h4 className={`text-sm ${!notif.is_read ? 'font-bold text-[#0a1e3f]' : 'font-medium text-slate-600'}`}>
                        {notif.judul}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {notif.pesan}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-2 block">
                        {new Date(notif.created_at).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;