// Mengambil URL Backend dari environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * FUNGSI 1: AMBIL PROFIL USER
 */
export const fetchUserProfile = async (userId) => {
  if (!userId) throw new Error("User ID tidak ditemukan");

  const response = await fetch(`${API_BASE_URL}/api/users/profile?userId=${userId}`);
  
  if (!response.ok) {
    if (response.status === 404) return { data: null };
    throw new Error('Gagal mengambil data profil');
  }
  return response.json();
};

/**
 * FUNGSI 2: UPDATE PROFIL USER
 */
export const updateUserProfile = async (userId, userData) => {
  const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, ...userData }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Gagal update profil');
  }
  return response.json();
};

/**
 * FUNGSI 3: BUAT POSTINGAN BARU (INI YANG HILANG TADI)
 */
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