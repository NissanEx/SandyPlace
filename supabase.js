// Konfigurasi Supabase Sandy Place
const SUPABASE_URL = 'https://aprnwmcliuubjosmtqis.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_OX9pW9J_w-oC6QCZPqPYcg_a0TogFm3';

// Inisialisasi instan client Supabase
let supabaseClient = null;
try {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        window.supabase = supabaseClient;
    }
} catch (e) {
    console.error('Gagal menginisialisasi client Supabase:', e);
}

// Fungsi pembungkus untuk mengambil informasi sesi aktif secara aman
async function dapatkanUserAktif() {
    try {
        if (!window.supabase) {
            console.error('Supabase client belum siap di window.');
            return null;
        }
        const { data: { session }, error } = await window.supabase.auth.getSession();
        if (error || !session?.user) return null;
        return session.user;
    } catch (e) {
        console.error('Error saat menjalankan dapatkanUserAktif:', e);
        return null;
    }
}

// Mengambil profil pengguna dari tabel profiles berdasarkan ID
async function getProfilUser(userId) {
    try {
        if (!window.supabase) return null;
        const { data, error } = await window.supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        if (error) return null;
        return data;
    } catch (e) {
        console.error('Error saat mengambil profil user:', e);
        return null;
    }
}

// Melakukan proses keluar (sign out) dari sesi
async function logoutUser() {
    try {
        if (!window.supabase) return false;
        const { error } = await window.supabase.auth.signOut();
        return !error;
    } catch (e) {
        console.error('Error saat melakukan logout:', e);
        return false;
    }
}

// Daftarkan fungsi ke scope global window secara eksplisit dan instan
window.dapatkanUserAktif = dapatkanUserAktif;
window.getProfilUser = getProfilUser;
window.logoutUser = logoutUser;

console.log('Supabase.js berhasil dimuat dan fungsi global didaftarkan!');