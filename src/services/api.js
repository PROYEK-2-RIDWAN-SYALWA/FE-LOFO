// --- KONFIGURASI UTAMA ---
const API_BASE_URL = 'http://localhost:3000'; 

/**
 * HELPER: Mengambil Token JWT dari LocalStorage
 * (Token ini didapat saat login via Backend)
 */
const getAuthToken = () => {
  // Cari key di localStorage yang menyimpan token session supabase
  // Biasanya format default auth-js supabase adalah: sb-<project-id>-auth-token
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
// 1. AUTHENTICATION
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
// 2. MASTER DATA
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
// 3. POSTINGAN (CORE FEATURE)
// ==========================================

// Update fungsi fetchPosts
export const fetchPosts = async (page = 1, search = '', category = '') => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: '10', 
    search: search,
    category: category // Kirim kategori ke backend
  });

  const response = await fetch(`${API_BASE_URL}/api/posts?${params.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) throw new Error('Gagal mengambil postingan');
  return response.json(); 
};

export const createPost = async (postData) => {
  return fetchWithAuth('/api/posts', {
    method: 'POST',
    body: JSON.stringify(postData),
  });
};

export const fetchMyPosts = async () => {
  return fetchWithAuth('/api/posts/history', {
    method: 'GET',
  });
};

export const fetchPostDetail = async (idPostingan) => {
  return fetchWithAuth(`/api/posts/${idPostingan}`, {
    method: 'GET',
  });
};

export const updatePostStatus = async (idPostingan, statusBaru) => {
  return fetchWithAuth(`/api/posts/${idPostingan}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status: statusBaru }),
  });
};

// ==========================================
// 4. USER PROFILE
// ==========================================

export const fetchUserProfile = async (authId) => {
  return fetchWithAuth(`/api/users/profile?authId=${authId}`, {
    method: 'GET',
  });
};

export const updateUserProfile = async (authId, payload) => {
  return fetchWithAuth(`/api/users/profile`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

// ==========================================
// 5. ADMIN PANEL
// ==========================================

export const fetchAdminStats = async () => {
  return fetchWithAuth('/api/admin/stats', {
    method: 'GET',
  });
};

// User Management dengan Filter
export const fetchAllUsers = async (status = 'all') => {
  return fetchWithAuth(`/api/admin/users?status=${status}`, {
    method: 'GET',
  });
};

export const fetchUserDetail = async (idPengguna) => {
  return fetchWithAuth(`/api/admin/users/${idPengguna}`, {
    method: 'GET',
  });
};

export const verifyUserAccount = async (idPengguna) => {
  return fetchWithAuth(`/api/admin/users/${idPengguna}/verify`, {
    method: 'PUT',
  });
};

export const rejectUserAccount = async (idPengguna, alasan = '') => {
  return fetchWithAuth(`/api/admin/users/${idPengguna}/reject`, {
    method: 'PUT',
    body: JSON.stringify({ alasan }),
  });
};

export const deletePostByAdmin = async (idPostingan) => {
  return fetchWithAuth(`/api/admin/posts/${idPostingan}`, {
    method: 'DELETE',
  });
};

// ==========================================
// 5.5 ADMIN - MASTER DATA CRUD
// ==========================================

// Kategori
export const createKategori = async (nama_kategori) => {
  return fetchWithAuth('/api/master/kategori', {
    method: 'POST',
    body: JSON.stringify({ nama_kategori }),
  });
};

export const updateKategori = async (id, nama_kategori) => {
  return fetchWithAuth(`/api/master/kategori/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ nama_kategori }),
  });
};

export const deleteKategori = async (id) => {
  return fetchWithAuth(`/api/master/kategori/${id}`, {
    method: 'DELETE',
  });
};

// Prodi
export const createProdi = async (nama_prodi) => {
  return fetchWithAuth('/api/master/prodi', {
    method: 'POST',
    body: JSON.stringify({ nama_prodi }),
  });
};

export const updateProdi = async (id, nama_prodi) => {
  return fetchWithAuth(`/api/master/prodi/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ nama_prodi }),
  });
};

export const deleteProdi = async (id) => {
  return fetchWithAuth(`/api/master/prodi/${id}`, {
    method: 'DELETE',
  });
};

// ==========================================
// 6. NOTIFICATIONS
// ==========================================

export const fetchNotifications = async () => {
  return fetchWithAuth('/api/notifications');
};

export const markNotificationAsRead = async (id = 'all') => {
  return fetchWithAuth(`/api/notifications/${id}/read`, {
    method: 'PUT'
  });
};


// ==========================================
// 7. USER POST MANAGEMENT
// ========================================
// [BARU] User Hapus Postingan Sendiri
export const deleteMyPost = async (idPostingan) => {
  return fetchWithAuth(`/api/posts/${idPostingan}`, {
    method: 'DELETE',
  });
};

// [BARU] User Edit Postingan Sendiri
export const updateMyPost = async (idPostingan, formData) => {
  return fetchWithAuth(`/api/posts/${idPostingan}`, {
    method: 'PUT',
    body: JSON.stringify(formData),
  });
};

// ==========================================
// 8. ADMIN POST VERIFICATION (BARU)
// ==========================================

// Ambil semua postingan untuk admin (dengan filter status)
export const fetchAdminPosts = async (status = 'all', page = 1) => {
  const params = new URLSearchParams({
    status,
    page: page.toString(),
    limit: '20'
  });
  return fetchWithAuth(`/api/admin/posts?${params.toString()}`);
};

// Admin approve postingan
export const approvePost = async (idPostingan) => {
  return fetchWithAuth(`/api/admin/posts/${idPostingan}/approve`, {
    method: 'PUT',
  });
};

// Admin reject postingan
export const rejectPost = async (idPostingan, alasan) => {
  return fetchWithAuth(`/api/admin/posts/${idPostingan}/reject`, {
    method: 'PUT',
    body: JSON.stringify({ alasan }),
  });
};

// ==========================================
// 9. CLAIM MANAGEMENT (BARU)
// ==========================================

// User ajukan klaim barang
export const createClaim = async (claimData) => {
  return fetchWithAuth('/api/claims', {
    method: 'POST',
    body: JSON.stringify(claimData),
  });
};

// Lihat klaim yang saya ajukan
export const fetchMyClaims = async () => {
  return fetchWithAuth('/api/claims/my-claims');
};

// Lihat klaim masuk untuk barang yang saya temukan
export const fetchIncomingClaims = async () => {
  return fetchWithAuth('/api/claims/incoming');
};

// Lihat klaim berdasarkan ID postingan
export const fetchClaimsByPost = async (postId) => {
  return fetchWithAuth(`/api/claims/post/${postId}`);
};

// Penemu approve klaim
export const approveClaim = async (idKlaim) => {
  return fetchWithAuth(`/api/claims/${idKlaim}/approve`, {
    method: 'PUT',
  });
};

// Penemu reject klaim
export const rejectClaim = async (idKlaim, alasan) => {
  return fetchWithAuth(`/api/claims/${idKlaim}/reject`, {
    method: 'PUT',
    body: JSON.stringify({ alasan }),
  });
};