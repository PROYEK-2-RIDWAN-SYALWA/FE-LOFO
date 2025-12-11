// Mengambil URL Backend dari environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// --- FUNGSI AUTH ---

// [BARU] Login via Backend
export const loginUser = async (credentials) => {
  // credentials = { identifier, password }
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Login Gagal');
  }
  
  return data; // Return object { message, session, user }
};

// ... (Biarkan fungsi fetchUserProfile, updateUserProfile, registerUser, dll tetap ada di bawah sini) ...
// --- FUNGSI USER ---

export const fetchUserProfile = async (userId) => {
  if (!userId) throw new Error("User ID tidak ditemukan");
  // Perhatikan: endpoint ini harus cocok dengan route di index.js
  const response = await fetch(`${API_BASE_URL}/api/users/profile?authId=${userId}`);
  
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error('Gagal mengambil data profil');
  }
  return response.json();
};

export const updateUserProfile = async (userId, payload) => {
  // payload isinya { authId, commonData, specificData } dari Profile.jsx
  const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Gagal update profil');
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
    constHZ = await response.json();
    throw new Error(constHZ.error || 'Registrasi Gagal');
  }
  return response.json();
};

// --- FUNGSI POSTINGAN (INI YANG HILANG TADI) ---

export const createPost = async (postData) => {
  const response = await fetch(`${API_BASE_URL}/api/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postData),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Gagal membuat postingan');
  }
  return response.json();
};

// Ambil SEMUA postingan (untuk Tab Jelajah / Landing Page)
export const fetchAllPosts = async () => {
  const response = await fetch(`${API_BASE_URL}/api/posts`);
  if (!response.ok) throw new Error('Gagal mengambil data postingan');
  return response.json();
};

// Ambil postingan SAYA (untuk Tab Laporan Saya)
export const fetchMyPosts = async (authId) => {
  const response = await fetch(`${API_BASE_URL}/api/posts/history?auth_id=${authId}`);
  if (!response.ok) throw new Error('Gagal mengambil history laporan');
  return response.json();
};

// --- FUNGSI MASTER DATA ---
export const fetchProdiList = async () => {
  const response = await fetch(`${API_BASE_URL}/api/master/prodi`);
  if (!response.ok) throw new Error('Gagal memuat daftar prodi');
  return response.json();
};

// Fetch Kategori List
export const fetchKategoriList = async () => {
  const response = await fetch(`${API_BASE_URL}/api/master/kategori`);
  if (!response.ok) throw new Error('Gagal memuat kategori');
  return response.json();
};