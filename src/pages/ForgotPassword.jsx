import { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // null, success, error

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Mengirim email reset password
      //redirectTo arahkan ke halaman update password di frontend Anda
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'http://localhost:5173/update-password', 
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Link reset password telah dikirim ke email Anda! Cek Inbox/Spam.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        
        <Link to="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-[#0a1e3f] text-sm font-bold mb-6 transition-colors">
          <ArrowLeft size={16}/> Kembali ke Login
        </Link>

        <h2 className="text-2xl font-black text-[#0a1e3f] mb-2">Lupa Password?</h2>
        <p className="text-slate-500 text-sm mb-8">
          Masukkan email yang terdaftar. Kami akan mengirimkan instruksi untuk mereset password Anda.
        </p>

        {message && (
          <div className={`p-4 mb-6 rounded-xl text-sm font-medium flex items-start gap-3
            ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.type === 'success' && <CheckCircle size={18} className="mt-0.5 flex-shrink-0"/>}
            {message.text}
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Email Terdaftar</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-slate-400" size={20} />
              <input 
                type="email" required 
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition font-medium text-slate-700"
                placeholder="nama@email.com"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#0a1e3f] text-white py-3.5 rounded-xl font-bold hover:bg-blue-900 transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={20}/> : 'Kirim Link Reset'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;