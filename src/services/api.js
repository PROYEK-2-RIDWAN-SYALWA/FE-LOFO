// File: src/services/api.js

// Ganti URL ini jika backend Anda sudah dideploy atau port-nya beda
const API_BASE_URL = 'http://localhost:3000';

/**
 * HELPER: Mengambil Token JWT dari LocalStorage Supabase
 */
const getAuthToken = () => {
  // Cari key localStorage yang formatnya 'sb-<project-id>-auth-token'
  const storageKey = Object.keys(localStorage).find(key => 
    key.startsWith('sb-') && key.endsWith('-auth-token')
  );
  
  if (!storageKey) return null;
  
  const sessionStr = localStorage.getItem(storageKey);
  if (!sessionStr) return null;

  try {
    const session = JSON.parse(sessionStr);
    return session.access_token;
  } catch (e) {
    console.error("Gagal parsing session:", e);
    return null;
  }
};

/**
 * UTILITY: Wrapper untuk fetch agar tidak mengulang kode header
 */
const fetchWithAuth = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error("Unauthorized: Token tidak ditemukan (Silakan login)");
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`, // Header Authorization Wajib
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Request gagal dengan status ${response.status}`);
  }

  return response.json();
};

// ==========================================
// 1. AUTHENTICATION (Login & Register)
// ==========================================

export const loginUser = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Login gagal');
  }
  return response.json();
};

export const registerUser = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Registrasi gagal');
  }
  return response.json();
};

// ==========================================
// 2. MASTER DATA (Kategori, Prodi, dll)
// ==========================================

export const fetchCategories = async () => {
  const response = await fetch(`${API_BASE_URL}/api/master/kategori`);
  if (!response.ok) throw new Error('Gagal mengambil kategori');
  return response.json();
};

export const fetchProdiList = async () => {
  const response = await fetch(`${API_BASE_URL}/api/master/prodi`);
  if (!response.ok) throw new Error('Gagal mengambil data prodi');
  return response.json();
};

// ==========================================
// 3. POSTINGAN (Laporan Kehilangan/Temuan)
// ==========================================

// Ambil Semua Postingan (PUBLIK)
export const fetchPosts = async () => {
  const response = await fetch(`${API_BASE_URL}/api/posts`);
  if (!response.ok) throw new Error('Gagal mengambil data postingan');
  return response.json();
};

// Buat Postingan Baru (PROTECTED)
export const createPost = async (postData) => {
  return fetchWithAuth('/api/posts', {
    method: 'POST',
    body: JSON.stringify(postData),
  });
};

// Ambil History Postingan Saya (PROTECTED)
export const fetchMyPosts = async () => {
  return fetchWithAuth('/api/posts/history', {
    method: 'GET',
  });
};

// ==========================================
// 4. USER PROFILE (INI YANG TADI HILANG)
// ==========================================

// Ambil Profil User
export const fetchUserProfile = async (authId) => {
  // Backend userController.getProfile membutuhkan query param ?authId=...
  return fetchWithAuth(`/api/users/profile?authId=${authId}`, {
    method: 'GET',
  });
};

// Update Profil User
export const updateUserProfile = async (authId, payload) => {
  // Backend userController.updateProfile mengharapkan payload di body
  return fetchWithAuth(`/api/users/profile`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

// ==========================================
// 5. ADMIN PANEL (FITUR ADMIN)
// ==========================================

export const fetchAdminStats = async () => {
  return fetchWithAuth('/api/admin/stats', {
    method: 'GET',
  });
};

export const fetchAllUsers = async () => {
  return fetchWithAuth('/api/admin/users', {
    method: 'GET',
  });
};

export const verifyUserAccount = async (idPengguna) => {
  return fetchWithAuth(`/api/admin/users/${idPengguna}/verify`, {
    method: 'PUT',
  });
};

export const deletePostByAdmin = async (idPostingan) => {
  return fetchWithAuth(`/api/admin/posts/${idPostingan}`, {
    method: 'DELETE',
  });
};

// [BARU] Ambil Detail Postingan by ID
export const fetchPostDetail = async (idPostingan) => {
  // Panggil endpoint GET /api/posts/:id
  return fetchWithAuth(`/api/posts/${idPostingan}`, {
    method: 'GET',
  });
};
