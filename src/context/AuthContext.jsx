import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { loginUser } from "../services/api"; // <--- Import fungsi baru

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cek sesi saat refresh halaman
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };
    getSession();

    // Dengarkan perubahan login/logout realtime
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    // SignUp tetap direct (atau mau dipindah ke backend juga boleh, tapi Register sudah via API di registerUser page)
    signUp: (data) => supabase.auth.signUp(data),
    
    // [MODIFIKASI] SignIn sekarang lewat Backend Express
    signIn: async ({ identifier, password }) => {
      try {
        // 1. Minta Backend login & cari username
        const data = await loginUser({ identifier, password });
        
        // 2. Set Session di Frontend supaya Supabase Client 'tahu' kita sudah login
        const { error } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });

        if (error) throw error;

        return { data, error: null };
      } catch (err) {
        return { data: null, error: err };
      }
    },
    
    // SignOut
    signOut: () => supabase.auth.signOut(),
    
    user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};