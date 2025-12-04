import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  
  // LOGIKA BARU:
  // Jika user tidak ada (belum login atau baru saja LOGOUT),
  // Kembalikan ke Halaman Depan (Landing Page), bukan ke Login.
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Jika ada user, izinkan masuk
  return children;
};

export default PrivateRoute;