// src/components/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  
  // Logika: Jika user belum login (null), tendang ke halaman login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Jika sudah login, izinkan masuk ke halaman tujuan
  return children;
};

export default PrivateRoute;