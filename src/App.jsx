import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
// Import Halaman
import Login from './pages/Login';
import Register from './pages/Register';
import LaporBarang from './pages/LaporBarang';
import Dashboard from './pages/Dashboard'; // <--- PENTING: Import dari file pages

// Komponen Proteksi Route
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

// --- BAGIAN INI SUDAH DIHAPUS (JANGAN ADA LAGI) ---
// const Dashboard = () => { ... } 
// --------------------------------------------------

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Rute Terproteksi */}
        <Route path="/" element={
          <PrivateRoute>
            <Dashboard /> {/* Sekarang ini memanggil file dari pages/Dashboard.jsx */}
          </PrivateRoute>
        } />
        
        <Route path="/lapor" element={
          <PrivateRoute>
            <LaporBarang />
          </PrivateRoute>
        } />

        {/* Redirect */}
        <Route path="/dashboard" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;