import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Lock, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

const UpdatePassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    // 1. Cek apakah ada error di URL (misal: link expired)
    const hash = window.location.hash;
    if (hash && hash.includes('error_code=otp_expired')) {
      setMessage({ 
        type: 'error', 
        text: 'Link reset password sudah kadaluarsa. Silakan minta link baru.' 
      });
      return;
    }

    // 2. Cek Session User
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSessionReady(true);
      } else {
        // Jika tidak ada session (dan bukan karena error URL), tunggu event auth
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
            setSessionReady(true);
          }
        });
        return () => subscription.unsubscribe();
      }
    };

    checkSession();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!sessionReady) {
      setMessage({ type: 'error', text: 'Sesi tidak ditemukan atau link tidak valid.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({ password: password });
      
      if (error) throw error;

      setMessage({ type: 'success', text: 'Password berhasil diperbarui! Mengalihkan ke Dashboard...' });
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        
        <h2 className="text-2xl font-black text-[#0a1e3f] mb-2">Buat Password Baru</h2>
        <p className="text-slate-500 text-sm mb-8">
          Silakan masukkan password baru untuk akun Anda.
        </p>

        {/* ALERT MESSAGE */}
        {message && (
          <div className={`p-4 mb-6 rounded-xl text-sm font-medium flex items-start gap-3
            ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.type === 'success' ? <CheckCircle size={18} className="mt-0.5 flex-shrink-0"/> : <AlertTriangle size={18} className="mt-0.5 flex-shrink-0"/>}
            {message.text}
          </div>
        )}

        {/* FORM HANYA MUNCUL JIKA TIDAK ADA ERROR URL */}
        {(!message || message.type !== 'error' || message.text.includes('Sesi')) && (
          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Password Baru</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-slate-400" size={20} />
                <input 
                  type="password" required 
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition font-medium text-slate-700"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || !sessionReady}
              className={`w-full py-3.5 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2
                ${sessionReady 
                  ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-orange-500/20' 
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}
            >
              {loading ? <Loader2 className="animate-spin" size={20}/> : 'Simpan Password Baru'}
            </button>
          </form>
        )}
        
        {/* Tombol Balik jika Error */}
        {message?.type === 'error' && (
           <button onClick={() => navigate('/forgot-password')} className="w-full mt-4 text-center text-sm font-bold text-[#0a1e3f] hover:underline">
             Minta Link Baru
           </button>
        )}

      </div>
    </div>
  );
};

export default UpdatePassword;