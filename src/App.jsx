import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// --- IMPORT SEMUA HALAMAN (Pastikan tidak ada yang terlewat) ---
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LaporBarang from './pages/LaporBarang';
import Profile from './pages/Profile'; // <--- INI YANG TADI HILANG

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* === RUTE PUBLIK (Bisa diakses siapa saja) === */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* === RUTE TERPROTEKSI (Wajib Login) === */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        
        <Route path="/lapor" element={
          <PrivateRoute>
            <LaporBarang />
          </PrivateRoute>
        } />
        
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />

        {/* === REDIRECT (Penyelamat Link Rusak) === */}
        {/* Jika user ketik alamat ngawur, lempar ke Landing Page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;