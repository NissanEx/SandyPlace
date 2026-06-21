// ===== KONFIGURASI SUPABASE =====
const SUPABASE_URL = "https://aprnwmcliuubjosmtqis.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_OX9pW9J_w-oC6QCZPqPYcg_a0TogFm3";

// ===== INISIALISASI SUPABASE CLIENT =====
let supabase = null;

// Tunggu Supabase library selesai di-load dari CDN
function initSupabase() {
    if (typeof window.supabase === 'undefined') {
        console.error('Supabase library belum di-load. Pastikan <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script> sudah ada di HTML.');
        return false;
    }
    
    try {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✓ Supabase client initialized successfully');
        return true;
    } catch (error) {
        console.error('Gagal inisialisasi Supabase:', error);
        return false;
    }
}

// Jalankan inisialisasi segera
if (!initSupabase()) {
    console.error('FATAL: Supabase tidak bisa diinisialisasi!');
}

// ===== HELPER: AMBIL USER AKTIF =====
async function dapatkanUserAktif() {
    if (!supabase) {
        console.warn('Supabase belum diinisialisasi');
        return null;
    }
    
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
            console.warn('Error dapatkanUserAktif:', error.message);
            return null;
        }
        
        // Debug log
        if (user) {
            console.log('✓ User ditemukan:', user.email);
        } else {
            console.log('ℹ Tidak ada user login');
        }
        
        return user;
    } catch (error) {
        console.error('Exception di dapatkanUserAktif:', error);
        return null;
    }
}

// ===== HELPER: FORMAT RUPIAH =====
function formatRupiah(angka) {
    if (angka === null || angka === undefined) return 'Rp 0';
    if (angka === 0) return 'Rp 0';
    
    try {
        return 'Rp ' + Number(angka).toLocaleString('id-ID');
    } catch (error) {
        console.error('Error formatRupiah:', error);
        return 'Rp 0';
    }
}

// ===== HELPER: REDIRECT KE AUTH =====
async function redirectKeAuth(message = "Silakan login terlebih dahulu!") {
    console.log('Redirect ke auth.html dengan pesan:', message);
    
    // Tampilkan toast jika ada fungsi tampilkanToast
    if (typeof tampilkanToast === 'function') {
        tampilkanToast(message, "#dc2626");
    }
    
    // Tunggu 1.5 detik sebelum redirect
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Redirect ke auth.html
    window.location.href = "auth.html";
}

// ===== HELPER: CEK SESI DAN REDIRECT JIKA PERLU =====
async function cekSesiDanRedirect() {
    console.log('Checking session...');
    const user = await dapatkanUserAktif();
    
    if (!user) {
        console.log('No user session, redirecting to auth.html');
        await redirectKeAuth("Silakan login terlebih dahulu!");
        return null;
    }
    
    console.log('User session valid:', user.email);
    return user;
}

// ===== DEBUG MODE (set ke false untuk production) =====
const DEBUG = true;

if (DEBUG) {
    console.log('🔧 DEBUG MODE AKTIF');
    console.log('Supabase URL:', SUPABASE_URL);
    console.log('Supabase initialized:', supabase !== null);
}

// Log saat file ini berhasil di-load
console.log('✓ supabase.js loaded successfully');