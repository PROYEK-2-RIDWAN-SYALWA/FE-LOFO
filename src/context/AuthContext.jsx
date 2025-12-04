import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

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

  // --- PERBAIKAN DI SINI ---
  const value = {
    // SignUp: Menerima object { email, password, ... }
    signUp: (data) => supabase.auth.signUp(data),
    
    // SignIn: KITA UBAH AGAR MENERIMA OBJECT SECARA LANGSUNG
    signIn: (data) => supabase.auth.signInWithPassword(data),
    
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