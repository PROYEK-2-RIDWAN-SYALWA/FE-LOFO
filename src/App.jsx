import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import PostDetail from './pages/PostDetail';

// Pages Import
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LaporBarang from './pages/LaporBarang';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import UpdatePassword from './pages/UpdatePassword';
import RiwayatKlaim from './pages/RiwayatKlaim';

// Admin Import
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPosts from './pages/admin/AdminPosts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminProdi from './pages/admin/AdminProdi';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* === PUBLIC ROUTES === */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* === USER ROUTES (Protected) === */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />

        {/* Route Publik untuk Reset Password */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/update-password" element={<UpdatePassword />} />

        <Route path="/post/:id" element={
          <PrivateRoute>
            <PostDetail />
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

        {/* === ADMIN ROUTES (Protected + Nested) === */}
        <Route path="/admin" element={
          <PrivateRoute>
            <AdminLayout />
          </PrivateRoute>
        }>
          {/* Redirect /admin ke /admin/dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />

          {/* Halaman Dashboard Admin */}
          <Route path="dashboard" element={<AdminDashboard />} />

          {/* Halaman Manajemen User */}
          <Route path="users" element={<AdminUsers />} />

          {/* Halaman Moderasi Laporan */}
          <Route path="posts" element={<AdminPosts />} />

          {/* Halaman Kelola Kategori */}
          <Route path="categories" element={<AdminCategories />} />

          {/* Halaman Kelola Prodi */}
          <Route path="prodi" element={<AdminProdi />} />
        </Route>

        {/* === FALLBACK ROUTE === */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;