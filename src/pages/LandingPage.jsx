// src/pages/LandingPage.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Shield, Gift, ArrowRight, CheckCircle, Clock, MapPin } from 'lucide-react';
import ulbiLogo from '../assets/ulbi-logo.png';

const LandingPage = () => {
  const navigate = useNavigate();

  // Data Dummy untuk Preview Barang
  const recentItems = [
    { id: 1, title: 'Kunci Motor Honda', type: 'Ditemukan', loc: 'Parkiran Gd. 4', time: '2 jam lalu', color: 'bg-green-100 text-green-800' },
    { id: 2, title: 'Tumbler Corkcicle', type: 'Hilang', loc: 'Kantin Utama', time: '5 jam lalu', color: 'bg-red-100 text-red-800' },
    { id: 3, title: 'KTM Angkatan 2023', type: 'Ditemukan', loc: 'Perpus Lt. 2', time: '1 hari lalu', color: 'bg-green-100 text-green-800' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* --- NAVBAR --- */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo Area */}
            <div className="flex items-center gap-3">
               {/* Ganti src dengan file logo ULBI yang Anda punya */}
              <img src={ulbiLogo} alt="ULBI Logo" className="h-12 w-auto" />
              <div className="hidden md:block">
                <h1 className="text-xl font-bold text-blue-900 leading-none">ULBI</h1>
                <p className="text-xs text-orange-600 font-semibold tracking-wide">LOST & FOUND</p>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex space-x-8">
              <a href="#beranda" className="text-gray-600 hover:text-blue-900 font-medium">Beranda</a>
              <a href="#terbaru" className="text-gray-600 hover:text-blue-900 font-medium">Barang Terbaru</a>
              <a href="#panduan" className="text-gray-600 hover:text-blue-900 font-medium">Panduan</a>
            </div>

            {/* Auth Buttons */}
            <div className="flex gap-3">
              <Link to="/login" className="px-5 py-2 text-sm font-medium text-blue-900 border border-blue-900 rounded-full hover:bg-blue-50 transition">
                Masuk
              </Link>
              <Link to="/register" className="px-5 py-2 text-sm font-medium text-white bg-orange-600 rounded-full hover:bg-orange-700 transition shadow-lg shadow-orange-200">
                Daftar
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <div id="beranda" className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 text-white overflow-hidden">
        {/* Abstract Background Element */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <span className="bg-blue-800 text-blue-200 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">
              Official Campus System
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
              Kehilangan Barang di <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-200">ULBI?</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-10 font-light">
              Platform terintegrasi bagi mahasiswa, dosen, dan staf untuk melaporkan kehilangan atau penemuan barang secara aman dan transparan.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={() => navigate('/lapor', { state: { tipe: 'kehilangan' } })}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-transparent border-2 border-red-400 text-white rounded-xl hover:bg-red-500 hover:border-red-500 transition-all group"
              >
                <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Saya Kehilangan Barang</span>
              </button>

              <button 
                onClick={() => navigate('/lapor', { state: { tipe: 'ditemukan' } })}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-orange-600 text-white rounded-xl hover:bg-orange-700 hover:shadow-lg hover:shadow-orange-500/30 transition-all group"
              >
                <Gift className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Saya Menemukan Barang</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- LIVE FEED (BARANG TERBARU) --- */}
      <div id="terbaru" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Laporan Terbaru</h2>
              <p className="text-gray-500 mt-2">Pantau barang yang baru saja dilaporkan di area kampus.</p>
            </div>
            <Link to="/login" className="hidden sm:flex items-center text-blue-700 font-semibold hover:underline">
              Lihat Semua <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentItems.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 overflow-hidden group">
                <div className="h-48 bg-gray-200 relative flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Foto Barang</span>
                  <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${item.color}`}>
                    {item.type}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-blue-700 transition">{item.title}</h3>
                  <div className="flex items-center text-gray-500 text-sm mb-2">
                    <MapPin className="w-4 h-4 mr-2" /> {item.loc}
                  </div>
                  <div className="flex items-center text-gray-400 text-xs">
                    <Clock className="w-3 h-3 mr-2" /> {item.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- CARA KERJA SISTEM (DIAGRAM) --- */}
      <div id="panduan" className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-blue-900 mb-16">Bagaimana Cara Kerjanya?</h2>
          
          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connector Line (Desktop Only) */}
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gray-200 -z-10"></div>

            {/* Step 1 */}
            <div className="relative bg-white p-6">
              <div className="w-24 h-24 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-lg">
                <Search className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">1. Cari atau Lapor</h3>
              <p className="text-gray-500 leading-relaxed">
                Cari barangmu di database atau buat laporan kehilangan/penemuan baru dengan detail lengkap.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative bg-white p-6">
              <div className="w-24 h-24 mx-auto bg-orange-50 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-lg">
                <Shield className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">2. Verifikasi Data</h3>
              <p className="text-gray-500 leading-relaxed">
                Sistem akan memvalidasi kecocokan data. Keamanan terjamin dengan verifikasi akun kampus.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative bg-white p-6">
              <div className="w-24 h-24 mx-auto bg-green-50 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-lg">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">3. Klaim & Kembali</h3>
              <p className="text-gray-500 leading-relaxed">
                Barang dikembalikan melalui Satpam atau pertemuan langsung yang aman di lingkungan ULBI.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-900 text-slate-400 py-12 text-sm">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h4 className="text-white font-bold text-lg mb-2">ULBI LOST & FOUND</h4>
            <p>Universitas Logistik & Bisnis Internasional</p>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition">Kebijakan Privasi</a>
            <a href="#" className="hover:text-white transition">Syarat & Ketentuan</a>
            <a href="#" className="hover:text-white transition">Kontak Admin</a>
          </div>
          <div className="text-slate-600">
            &copy; 2025 ULBI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;